import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RequestCustomerOtpDto, VerifyCustomerOtpDto } from './dto/customer-otp.dto';
import {
  RequestRiderOtpDto,
  RequestRiderRegistrationOtpDto,
  VerifyRiderOtpDto,
  VerifyRiderRegistrationOtpDto,
} from './dto/rider-otp.dto';
import { AdminLoginDto, AdminVerify2faDto } from './dto/admin-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';

@ApiTags('Authentication & Identity')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('customer/otp-request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request Customer OTP login code (Phone only)' })
  @ApiResponse({ status: 200, description: 'OTP sent via provider; seeded staging demo accounts receive a demoCode instead' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded (max 3 per 5 mins)' })
  async requestCustomerOtp(@Body() dto: RequestCustomerOtpDto, @Req() req: Request) {
    return this.authService.requestCustomerOtp(dto, req.ip);
  }

  @Public()
  @Post('customer/otp-verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Customer OTP & issue access + rotating refresh tokens' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyCustomerOtp(@Body() dto: VerifyCustomerOtpDto, @Req() req: Request) {
    return this.authService.verifyCustomerOtp(dto, req.ip, req.headers['user-agent']);
  }

  @Public()
  @Post('rider/otp-request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request Rider OTP login code (Phone or Email)' })
  @ApiResponse({ status: 200, description: 'Rider OTP sent via provider; seeded staging demo accounts receive a demoCode instead' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async requestRiderOtp(@Body() dto: RequestRiderOtpDto, @Req() req: Request) {
    return this.authService.requestRiderOtp(dto, req.ip);
  }

  @Public()
  @Post('rider/otp-verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Rider OTP & authenticate' })
  @ApiResponse({ status: 200, description: 'Rider authenticated' })
  async verifyRiderOtp(@Body() dto: VerifyRiderOtpDto, @Req() req: Request) {
    return this.authService.verifyRiderOtp(dto, req.ip, req.headers['user-agent']);
  }

  @Public()
  @Post('rider/registration/otp-request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request an OTP to register a rider account' })
  @ApiResponse({ status: 200, description: 'Registration OTP sent to the rider phone' })
  @ApiResponse({ status: 429, description: 'Per-phone or per-IP OTP rate limit exceeded' })
  async requestRiderRegistrationOtp(
    @Body() dto: RequestRiderRegistrationOtpDto,
    @Req() req: Request,
  ) {
    return this.authService.requestRiderRegistrationOtp(dto, req.ip);
  }

  @Public()
  @Post('rider/registration/otp-verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify registration OTP and create a pending rider account' })
  @ApiResponse({ status: 200, description: 'Rider account created in REGISTERED state' })
  @ApiResponse({ status: 400, description: 'Invalid OTP or phone/email already registered' })
  async verifyRiderRegistrationOtp(
    @Body() dto: VerifyRiderRegistrationOtpDto,
    @Req() req: Request,
  ) {
    return this.authService.verifyRiderRegistrationOtp(dto, req.ip, req.headers['user-agent']);
  }

  @Public()
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login by Email + Argon2 Password (Optional 2FA for Super Admin)' })
  @ApiResponse({ status: 200, description: 'Admin authenticated or 2FA required; seeded staging Super Admin receives a demoCode instead of email delivery' })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  async adminLogin(@Body() dto: AdminLoginDto, @Req() req: Request) {
    return this.authService.adminLogin(dto, req.ip, req.headers['user-agent']);
  }

  @Public()
  @Post('admin/verify-2fa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Super Admin 2FA OTP code' })
  @ApiResponse({ status: 200, description: 'Super Admin authenticated' })
  @ApiResponse({ status: 400, description: 'Invalid 2FA code' })
  async verifyAdmin2fa(@Body() dto: AdminVerify2faDto, @Req() req: Request) {
    return this.authService.verifyAdmin2fa(dto, req.ip, req.headers['user-agent']);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token (Replay attack detection & revocation)' })
  @ApiResponse({ status: 200, description: 'Tokens rotated successfully' })
  @ApiResponse({ status: 401, description: 'Token compromised or expired' })
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    return this.authService.refreshSession(dto, req.ip, req.headers['user-agent']);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and revoke device refresh session' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Revoke all active sessions for the authenticated account' })
  async logoutAll(@CurrentUser() user: UserPayload) {
    return this.authService.logoutAll(user);
  }

  @Post('push-token')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Register an FCM token for an active signed-in device' })
  async registerPushToken(
    @Body() dto: RegisterPushTokenDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.authService.registerPushToken(dto, user.id);
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  async getProfile(@Req() req: Request) {
    return { user: (req as any).user };
  }
}
