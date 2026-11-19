import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { accessTokenLifetimeSeconds } from '../../config/env.validation';
import crypto from 'crypto';
import argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notifications/notification.service';
import { Role, OtpPurpose } from '@prisma/client';
import { UserPayload } from '../../common/decorators/current-user.decorator';
import { RequestCustomerOtpDto, VerifyCustomerOtpDto } from './dto/customer-otp.dto';
import {
  RequestRiderOtpDto,
  RequestRiderRegistrationOtpDto,
  VerifyRiderOtpDto,
  VerifyRiderRegistrationOtpDto,
} from './dto/rider-otp.dto';
import { AdminLoginDto, AdminVerify2faDto } from './dto/admin-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
  ) {}

  // Helpers
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private generate6DigitOtp(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }

  private demoOtpFor(isDemoAccount: boolean): string | undefined {
    if (
      !isDemoAccount ||
      !this.configService.get<boolean>('DEMO_OTP_ENABLED', false)
    ) {
      return undefined;
    }

    const code = this.configService.get<string>('DEMO_OTP_CODE');
    if (!code) {
      throw new Error('DEMO_OTP_CODE must be configured when demo OTP is enabled');
    }
    return code;
  }

  private shouldExposeOtp(demoOtpCode?: string): boolean {
    return Boolean(demoOtpCode) ||
      this.configService.get<boolean>('OTP_DEV_MODE', false);
  }

  private generateRandomToken(bytes = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }

  private async incrementRateLimit(
    key: string,
    endpoint: string,
    limit: number,
    code: string,
    message: string,
  ): Promise<void> {
    const now = new Date();
    const resetBefore = new Date(now.getTime() - 5 * 60 * 1000);
    const reset = await this.prisma.rateLimitRecord.updateMany({
      where: { key, endpoint, windowStart: { lt: resetBefore } },
      data: { hitCount: 1, windowStart: now, blockedUntil: null },
    });

    if (reset.count > 0) return;

    const record = await this.prisma.rateLimitRecord.upsert({
      where: { key_endpoint: { key, endpoint } },
      create: { key, endpoint, hitCount: 1, windowStart: now },
      update: { hitCount: { increment: 1 } },
    });

    if (record.hitCount > limit) {
      throw new HttpException({ code, message }, HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  // Rate Limit Check (per destination and per IP)
  private async checkRateLimit(destination: string, ipAddress?: string): Promise<void> {
    await this.incrementRateLimit(
      destination,
      'otp_request_destination',
      3,
      'RATE_LIMIT_EXCEEDED',
      'Too many OTP requests for this number/email. Please wait 5 minutes.',
    );

    if (ipAddress) {
      await this.incrementRateLimit(
        ipAddress,
        'otp_request_ip',
        10,
        'IP_RATE_LIMIT_EXCEEDED',
        'Too many requests from this IP address. Please wait 5 minutes.',
      );
    }
  }

  // 1. Customer OTP Request (Phone only)
  async requestCustomerOtp(dto: RequestCustomerOtpDto, ipAddress?: string) {
    await this.checkRateLimit(dto.phone, ipAddress);

    const user = await this.prisma.user.findFirst({
      where: { phone: dto.phone },
      select: { role: true, isDemoAccount: true },
    });
    if (user && user.role !== Role.CUSTOMER) {
      throw new BadRequestException('Customer account not available for this phone number');
    }

    const demoOtpCode = this.demoOtpFor(user?.isDemoAccount ?? false);
    const otpCode = demoOtpCode ?? this.generate6DigitOtp();
    const codeHash = this.hashToken(otpCode);
    const expiresAt = new Date(
      Date.now() + this.configService.get<number>('OTP_TTL_MINUTES', 5) * 60 * 1000,
    );

    await this.prisma.otpRequest.create({
      data: {
        destination: dto.phone,
        purpose: OtpPurpose.LOGIN,
        codeHash,
        expiresAt,
      },
    });

    if (!demoOtpCode) {
      await this.notificationService.sendOtp(dto.phone, otpCode);
    }

    return {
      message: demoOtpCode
        ? 'Staging demo verification code ready'
        : `Verification code sent to ${dto.phone}`,
      expiresInSeconds: 300,
      ...(this.shouldExposeOtp(demoOtpCode) && { demoCode: otpCode }),
    };
  }

  // 2. Customer OTP Verification
  async verifyCustomerOtp(dto: VerifyCustomerOtpDto, ipAddress?: string, userAgent?: string) {
    const codeHash = this.hashToken(dto.code);

    const otpRecord = await this.prisma.otpRequest.findFirst({
      where: {
        destination: dto.phone,
        purpose: OtpPurpose.LOGIN,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('Verification code is invalid or has expired');
    }

    let user = await this.prisma.user.findFirst({
      where: { phone: dto.phone },
      include: { customerProfile: { include: { addresses: true } } },
    });
    if (user && user.role !== Role.CUSTOMER) {
      throw new ForbiddenException('This sign-in method is not available for this account');
    }

    if (otpRecord.attemptsCount >= this.configService.get<number>('OTP_MAX_ATTEMPTS', 3)) {
      throw new BadRequestException('Maximum verification attempts exceeded. Please request a new code.');
    }

    if (otpRecord.codeHash !== codeHash) {
      await this.prisma.otpRequest.update({
        where: { id: otpRecord.id },
        data: { attemptsCount: { increment: 1 } },
      });
      throw new BadRequestException('Incorrect verification code');
    }

    // Find or auto-register customer
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone: dto.phone,
          role: Role.CUSTOMER,
          fullName: 'BuyMe Customer',
          customerProfile: { create: {} },
        },
        include: { customerProfile: { include: { addresses: true } } },
      });
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account has been suspended');
    }

    await this.prisma.otpRequest.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    return this.createAuthSession(user, dto.deviceId, dto.deviceInfo, ipAddress, userAgent);
  }

  // 3. Rider OTP Request (Phone or Email)
  async requestRiderOtp(dto: RequestRiderOtpDto, ipAddress?: string) {
    await this.checkRateLimit(dto.destination, ipAddress);

    // Verify Rider exists
    const isEmail = dto.destination.includes('@');
    const user = await this.prisma.user.findFirst({
      where: isEmail ? { email: dto.destination } : { phone: dto.destination },
      include: { riderProfile: true },
    });

    if (!user || user.role !== Role.RIDER) {
      throw new BadRequestException('No rider account found with this phone number or email.');
    }

    const demoOtpCode = this.demoOtpFor(user.isDemoAccount);
    const otpCode = demoOtpCode ?? this.generate6DigitOtp();
    const codeHash = this.hashToken(otpCode);
    const expiresAt = new Date(
      Date.now() + this.configService.get<number>('OTP_TTL_MINUTES', 5) * 60 * 1000,
    );

    await this.prisma.otpRequest.create({
      data: {
        destination: dto.destination,
        purpose: OtpPurpose.RIDER_LOGIN,
        codeHash,
        expiresAt,
      },
    });

    if (!demoOtpCode) {
      await this.notificationService.sendOtp(dto.destination, otpCode);
    }

    return {
      message: demoOtpCode
        ? 'Staging demo rider verification code ready'
        : `Rider login code sent to ${dto.destination}`,
      expiresInSeconds: 300,
      ...(this.shouldExposeOtp(demoOtpCode) && { demoCode: otpCode }),
    };
  }

  async requestRiderRegistrationOtp(
    dto: RequestRiderRegistrationOtpDto,
    ipAddress?: string,
  ) {
    const phone = dto.phone.trim();
    const fullName = dto.fullName.trim();
    if (!fullName) throw new BadRequestException('Rider name is required');
    const email = dto.email?.trim().toLowerCase();
    await this.checkRateLimit(phone, ipAddress);

    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ phone }, ...(email ? [{ email }] : [])] },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException('A user is already registered with this phone or email');
    }

    const otpCode = this.generate6DigitOtp();
    const expiresAt = new Date(
      Date.now() + this.configService.get<number>('OTP_TTL_MINUTES', 5) * 60 * 1000,
    );
    await this.prisma.otpRequest.create({
      data: {
        destination: phone,
        purpose: OtpPurpose.REGISTRATION,
        codeHash: this.hashToken(otpCode),
        expiresAt,
      },
    });
    await this.notificationService.sendOtp(phone, otpCode);

    return {
      message: `Rider registration code sent to ${phone}`,
      expiresInSeconds: this.configService.get<number>('OTP_TTL_MINUTES', 5) * 60,
      ...(this.configService.get<boolean>('OTP_DEV_MODE', false) && { demoCode: otpCode }),
    };
  }

  async verifyRiderRegistrationOtp(
    dto: VerifyRiderRegistrationOtpDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const phone = dto.phone.trim();
    const fullName = dto.fullName.trim();
    if (!fullName) throw new BadRequestException('Rider name is required');
    const email = dto.email?.trim().toLowerCase();
    const otp = await this.prisma.otpRequest.findFirst({
      where: {
        destination: phone,
        purpose: OtpPurpose.REGISTRATION,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!otp) throw new BadRequestException('Registration code is invalid or has expired');
    if (otp.attemptsCount >= this.configService.get<number>('OTP_MAX_ATTEMPTS', 3)) {
      throw new BadRequestException('Maximum verification attempts exceeded. Please request a new code.');
    }
    if (otp.codeHash !== this.hashToken(dto.code)) {
      await this.prisma.otpRequest.update({
        where: { id: otp.id },
        data: { attemptsCount: { increment: 1 } },
      });
      throw new BadRequestException('Incorrect verification code');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT pg_advisory_xact_lock(hashtextextended(${phone}, 0)) IS NULL AS locked
      `;
      const currentOtp = await tx.otpRequest.findUnique({ where: { id: otp.id } });
      if (!currentOtp || currentOtp.isUsed || currentOtp.expiresAt <= new Date()) {
        throw new BadRequestException('Registration code is invalid or has expired');
      }
      if (currentOtp.attemptsCount >= this.configService.get<number>('OTP_MAX_ATTEMPTS', 3)) {
        throw new BadRequestException('Maximum verification attempts exceeded. Please request a new code.');
      }
      if (currentOtp.codeHash !== this.hashToken(dto.code)) {
        await tx.otpRequest.update({
          where: { id: currentOtp.id },
          data: { attemptsCount: { increment: 1 } },
        });
        throw new BadRequestException('Incorrect verification code');
      }

      const existing = await tx.user.findFirst({
        where: { OR: [{ phone }, ...(email ? [{ email }] : [])] },
        select: { id: true },
      });
      if (existing) throw new BadRequestException('A user is already registered with this phone or email');

      await tx.otpRequest.update({
        where: { id: currentOtp.id },
        data: { isUsed: true },
      });
      const user = await tx.user.create({
        data: {
          phone,
          email,
          role: Role.RIDER,
          fullName,
          riderProfile: { create: {} },
        },
        include: { riderProfile: true },
      });
      if (!user.riderProfile) throw new Error('Rider profile was not created');
      await tx.auditLog.create({
        data: {
          userId: user.id,
          userRole: Role.RIDER,
          action: 'RIDER_REGISTER',
          entityType: 'RiderProfile',
          entityId: user.riderProfile.id,
          newValues: { kycStatus: 'REGISTERED' },
        },
      });
      const notifications = await this.notificationService.queueRiderStateChange(
        tx,
        user,
        'REGISTERED',
        'Rider registration received',
        'Your BuyMe rider account was created. Complete KYC and wait for review before accepting deliveries.',
      );
      return { user, notifications };
    });

    await this.notificationService.dispatchRiderStateChange(result.notifications, {
      id: result.user.id,
      phone: result.user.phone,
      email: result.user.email,
    });
    return this.createAuthSession(
      result.user,
      dto.deviceId,
      dto.deviceInfo,
      ipAddress,
      userAgent,
    );
  }

  // 4. Rider OTP Verification
  async verifyRiderOtp(dto: VerifyRiderOtpDto, ipAddress?: string, userAgent?: string) {
    const codeHash = this.hashToken(dto.code);

    const otpRecord = await this.prisma.otpRequest.findFirst({
      where: {
        destination: dto.destination,
        purpose: OtpPurpose.RIDER_LOGIN,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('Verification code is invalid or has expired');
    }

    if (otpRecord.attemptsCount >= this.configService.get<number>('OTP_MAX_ATTEMPTS', 3)) {
      throw new BadRequestException('Maximum verification attempts exceeded. Please request a new code.');
    }

    if (otpRecord.codeHash !== codeHash) {
      await this.prisma.otpRequest.update({
        where: { id: otpRecord.id },
        data: { attemptsCount: { increment: 1 } },
      });
      throw new BadRequestException('Incorrect verification code');
    }

    await this.prisma.otpRequest.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    const isEmail = dto.destination.includes('@');
    const user = await this.prisma.user.findFirst({
      where: isEmail ? { email: dto.destination } : { phone: dto.destination },
      include: {
        riderProfile: { include: { assignedStore: true } },
      },
    });

    if (!user || user.role !== Role.RIDER) {
      throw new BadRequestException('Rider account not found');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Rider account has been deactivated');
    }

    return this.createAuthSession(user, dto.deviceId, dto.deviceInfo, ipAddress, userAgent);
  }

  // 5. Admin Login (Email + Password using argon2, with optional Super Admin 2FA)
  async adminLogin(dto: AdminLoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { storeAdminAssignment: { include: { store: true } } },
    });

    if (!user || (user.role !== Role.SUPER_ADMIN && user.role !== Role.STORE_ADMIN)) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Password authentication not configured for this account');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Admin account has been deactivated');
    }

    // Optional 2FA for Super Admin
    if (user.role === Role.SUPER_ADMIN && user.isTwoFactorEnabled) {
      const demoOtpCode = this.demoOtpFor(user.isDemoAccount);
      const otpCode = demoOtpCode ?? this.generate6DigitOtp();
      const codeHash = this.hashToken(otpCode);
      const expiresAt = new Date(
        Date.now() + this.configService.get<number>('OTP_TTL_MINUTES', 5) * 60 * 1000,
      );

      await this.prisma.otpRequest.create({
        data: {
          destination: user.email!,
          purpose: OtpPurpose.ADMIN_2FA,
          codeHash,
          expiresAt,
        },
      });

      if (!demoOtpCode) {
        await this.notificationService.sendOtp(user.email!, otpCode);
      }

      return {
        requires2fa: true,
        message: demoOtpCode
          ? 'Staging demo two-factor code ready'
          : 'Two-factor authentication code sent to admin email.',
        email: user.email,
        ...(this.shouldExposeOtp(demoOtpCode) && { demoCode: otpCode }),
      };
    }

    return this.createAuthSession(user, dto.deviceId, dto.deviceInfo, ipAddress, userAgent);
  }

  // 6. Super Admin 2FA OTP Verification
  async verifyAdmin2fa(dto: AdminVerify2faDto, ipAddress?: string, userAgent?: string) {
    const codeHash = this.hashToken(dto.code);

    const otpRecord = await this.prisma.otpRequest.findFirst({
      where: {
        destination: dto.email,
        purpose: OtpPurpose.ADMIN_2FA,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('2FA code is invalid or has expired');
    }

    if (otpRecord.attemptsCount >= this.configService.get<number>('OTP_MAX_ATTEMPTS', 3)) {
      throw new BadRequestException('Maximum 2FA attempts exceeded. Please login again.');
    }

    if (otpRecord.codeHash !== codeHash) {
      await this.prisma.otpRequest.update({
        where: { id: otpRecord.id },
        data: { attemptsCount: { increment: 1 } },
      });
      throw new BadRequestException('Incorrect 2FA code');
    }

    await this.prisma.otpRequest.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Admin user not found');
    }

    return this.createAuthSession(user, dto.deviceId, dto.deviceInfo, ipAddress, userAgent);
  }

  // 7. Rotating Refresh Token (Detects replay attacks and revokes on reuse)
  async refreshSession(dto: RefreshTokenDto, ipAddress?: string, userAgent?: string) {
    const refreshTokenHash = this.hashToken(dto.refreshToken);

    const session = await this.prisma.deviceSession.findUnique({
      where: { refreshTokenHash },
      include: { user: true },
    });

    // Replay attack detection: if token exists but isRevoked is already true, the token was STOLEN!
    if (session && session.isRevoked) {
      this.logger.warn(`🚨 REPLAY ATTACK DETECTED! Invalidate all sessions for user ${session.userId}`);
      // Invalidate ALL sessions for this compromised account immediately
      await this.prisma.deviceSession.updateMany({
        where: { userId: session.userId },
        data: { isRevoked: true, pushToken: null },
      });
      throw new UnauthorizedException('Security alert: Refresh token reuse detected. All sessions invalidated.');
    }

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired or invalid. Please login again.');
    }

    const newRawRefreshToken = this.generateRandomToken(40);
    const newRefreshTokenHash = this.hashToken(newRawRefreshToken);
    const refreshExpiresDays = this.configService.get<number>('REFRESH_TOKEN_EXPIRES_DAYS', 30);
    const expiresAt = new Date(Date.now() + refreshExpiresDays * 24 * 60 * 60 * 1000);

    const rotated = await this.prisma.$transaction(async (transaction) => {
      const claimed = await transaction.deviceSession.updateMany({
        where: {
          id: session.id,
          isRevoked: false,
          expiresAt: { gt: new Date() },
        },
        data: { isRevoked: true, lastUsedAt: new Date(), pushToken: null },
      });

      if (claimed.count !== 1) return false;

      await transaction.deviceSession.create({
        data: {
          userId: session.userId,
          refreshTokenHash: newRefreshTokenHash,
          deviceId: dto.deviceId || session.deviceId,
          deviceInfo: session.deviceInfo,
          ipAddress: ipAddress || session.ipAddress,
          userAgent: userAgent || session.userAgent,
          pushToken: session.pushToken,
          expiresAt,
        },
      });
      return true;
    });

    if (!rotated) {
      const replayedSession = await this.prisma.deviceSession.findUnique({
        where: { refreshTokenHash },
      });
      if (replayedSession?.isRevoked) {
        this.logger.warn(`Refresh token reuse detected for user ${replayedSession.userId}`);
        await this.prisma.deviceSession.updateMany({
          where: { userId: replayedSession.userId },
          data: { isRevoked: true, pushToken: null },
        });
      }
      throw new UnauthorizedException('Session expired or invalid. Please login again.');
    }

    const accessToken = this.jwtService.sign(
      {
        sub: session.user.id,
        role: session.user.role,
        email: session.user.email,
        phone: session.user.phone,
        fullName: session.user.fullName,
      },
      {
        expiresIn: accessTokenLifetimeSeconds(
          this.configService.get<string>('ACCESS_TOKEN_EXPIRES_IN', '15m'),
        ),
      }
    );

    return {
      accessToken,
      refreshToken: newRawRefreshToken,
      expiresIn: '15m',
    };
  }

  // 8. Logout / Session Invalidation
  async logout(dto: RefreshTokenDto) {
    const refreshTokenHash = this.hashToken(dto.refreshToken);
    await this.prisma.deviceSession.updateMany({
      where: { refreshTokenHash },
      data: { isRevoked: true, pushToken: null },
    });
    return { message: 'Logged out successfully' };
  }

  async logoutAll(user: UserPayload) {
    return this.prisma.$transaction(async (tx) => {
      const revoked = await tx.deviceSession.updateMany({
        where: { userId: user.id, isRevoked: false },
        data: { isRevoked: true, pushToken: null },
      });
      await tx.auditLog.create({
        data: {
          userId: user.id,
          userRole: user.role as Role,
          action: 'AUTH_LOGOUT_ALL',
          entityType: 'User',
          entityId: user.id,
          newValues: { revokedSessions: revoked.count },
        },
      });
      return { revokedSessions: revoked.count };
    });
  }

  async registerPushToken(dto: RegisterPushTokenDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const session = await tx.deviceSession.findFirst({
        where: {
          userId,
          deviceId: dto.deviceId,
          isRevoked: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { lastUsedAt: 'desc' },
        select: { id: true },
      });
      if (!session) {
        throw new UnauthorizedException('An active session for this device is required');
      }

      await tx.deviceSession.updateMany({
        where: { pushToken: dto.pushToken },
        data: { pushToken: null },
      });
      await tx.deviceSession.update({
        where: { id: session.id },
        data: { pushToken: dto.pushToken },
      });
      return { registered: true };
    });
  }

  // Helper to issue tokens & session
  private async createAuthSession(
    user: any,
    deviceId: string,
    deviceInfo?: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        role: user.role,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
      },
      {
        expiresIn: accessTokenLifetimeSeconds(
          this.configService.get<string>('ACCESS_TOKEN_EXPIRES_IN', '15m'),
        ),
      }
    );

    const rawRefreshToken = this.generateRandomToken(40);
    const refreshTokenHash = this.hashToken(rawRefreshToken);
    const refreshExpiresDays = this.configService.get<number>('REFRESH_TOKEN_EXPIRES_DAYS', 30);
    const expiresAt = new Date(Date.now() + refreshExpiresDays * 24 * 60 * 60 * 1000);

    await this.prisma.deviceSession.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        deviceId: deviceId || 'unknown-device',
        deviceInfo: deviceInfo || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: '15m',
      user: {
        id: user.id,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        store: user.storeAdminAssignment?.store || null,
        riderProfile: user.riderProfile
          ? {
              id: user.riderProfile.id,
              kycStatus: user.riderProfile.kycStatus,
              riderType: user.riderProfile.riderType,
              assignedStoreId: user.riderProfile.assignedStoreId,
              bikeNumber: user.riderProfile.bikeNumber,
              rejectionReason: user.riderProfile.rejectionReason,
              approvedAt: user.riderProfile.approvedAt,
            }
          : null,
        customerProfile: user.customerProfile || null,
      },
    };
  }
}
