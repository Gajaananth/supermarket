import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  KycStatus,
  Notification,
  OrderStatus,
  Prisma,
  RiderType,
  Role,
} from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { UserPayload } from '../../common/decorators/current-user.decorator';
import { NotificationService } from '../notifications/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ApproveRiderKycDto,
  KycUploadUrlDto,
  RiderKycReviewQueryDto,
  RejectRiderKycDto,
  SubmitRiderKycDto,
  SuspendRiderDto,
} from './dto/rider-kyc.dto';
import { ClamAvScannerService } from './clamav-scanner.service';
import { PrivateObjectStorageService } from '../cash-control/private-object-storage.service';
import { CashControlService } from '../cash-control/cash-control.service';

const maximumImageSize = 5 * 1024 * 1024;
const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

type RiderRecord = {
  id: string;
  userId: string;
  user: { id: string; fullName: string; phone: string | null; email: string | null };
  kycStatus: KycStatus;
};
type KycRiderWithUser = Prisma.RiderProfileGetPayload<{
  include: {
    user: {
      select: { id: true; fullName: true; phone: true; email: true };
    };
  };
}>;

@Injectable()
export class RiderOnboardingService {
  private readonly logger = new Logger(RiderOnboardingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: PrivateObjectStorageService,
    private readonly malwareScanner: ClamAvScannerService,
    private readonly notifications: NotificationService,
    private readonly cashControl: CashControlService,
  ) {}

  async getMyStatus(user: UserPayload) {
    const rider = await this.prisma.riderProfile.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        kycStatus: true,
        riderType: true,
        assignedStoreId: true,
        isShiftActive: true,
        bikeNumber: true,
        rejectionReason: true,
        drivingLicenceObjectKey: true,
        vehicleLicenceObjectKey: true,
        assignedStore: { select: { name: true } },
      },
    });
    if (!rider) throw new NotFoundException('Rider profile not found');
    return {
      id: rider.id,
      kycStatus: rider.kycStatus,
      riderType: rider.riderType,
      assignedStoreId: rider.assignedStoreId,
      isShiftActive: rider.isShiftActive,
      assignedStoreName: rider.assignedStore?.name ?? null,
      bikeNumber: rider.bikeNumber,
      rejectionReason: rider.rejectionReason,
      documents: {
        drivingLicenceUploaded: Boolean(rider.drivingLicenceObjectKey),
        vehicleLicenceUploaded: Boolean(rider.vehicleLicenceObjectKey),
      },
    };
  }

  async startShift(user: UserPayload) {
    const result = await this.prisma.$transaction(async (tx) => {
      const rider = await tx.riderProfile.findUnique({
        where: { userId: user.id },
        select: {
          id: true,
          kycStatus: true,
          assignedStoreId: true,
          isShiftActive: true,
          user: { select: { isActive: true } },
        },
      });
      if (
        !rider ||
        !rider.user.isActive ||
        rider.kycStatus !== KycStatus.APPROVED ||
        !rider.assignedStoreId
      ) {
        throw new ForbiddenException('An active, approved rider assigned to a store is required');
      }

      await this.lockRider(tx, rider.id);
      const current = await tx.riderProfile.findUniqueOrThrow({
        where: { id: rider.id },
        select: {
          id: true,
          kycStatus: true,
          assignedStoreId: true,
          isShiftActive: true,
          user: { select: { isActive: true } },
        },
      });
      if (
        !current.user.isActive ||
        current.kycStatus !== KycStatus.APPROVED ||
        !current.assignedStoreId
      ) {
        throw new ForbiddenException('An active, approved rider assigned to a store is required');
      }
      const cashPolicy = await this.cashControl.enforceCashPolicy(tx, rider.id, user);
      if (cashPolicy.isCashLocked || cashPolicy.depositPending) {
        return {
          riderId: rider.id,
          isShiftActive: false,
          blockedReason:
            cashPolicy.cashLockReason ?? 'A cash deposit must be verified before starting a shift',
        };
      }
      if (current.isShiftActive) return { riderId: rider.id, isShiftActive: true };

      await tx.riderProfile.update({
        where: { id: rider.id },
        data: { isShiftActive: true },
      });
      await this.audit(tx, user, rider.id, 'RIDER_SHIFT_START', {
        assignedStoreId: current.assignedStoreId,
      });
      return { riderId: rider.id, isShiftActive: true };
    });
    if ('blockedReason' in result) {
      throw new ForbiddenException(result.blockedReason);
    }
    return result;
  }

  async stopShift(user: UserPayload) {
    return this.prisma.$transaction(async (tx) => {
      const rider = await tx.riderProfile.findUnique({
        where: { userId: user.id },
        select: { id: true, isShiftActive: true, user: { select: { isActive: true } } },
      });
      if (!rider || !rider.user.isActive) {
        throw new ForbiddenException('An active rider account is required');
      }
      await this.lockRider(tx, rider.id);
      const current = await tx.riderProfile.findUniqueOrThrow({
        where: { id: rider.id },
        select: { id: true, isShiftActive: true, user: { select: { isActive: true } } },
      });
      if (!current.user.isActive) {
        throw new ForbiddenException('An active rider account is required');
      }
      const activeDelivery = await tx.order.findFirst({
        where: {
          riderId: rider.id,
          status: {
            in: [
              OrderStatus.RIDER_ASSIGNED,
              OrderStatus.PICKED_UP,
              OrderStatus.ON_THE_WAY,
            ],
          },
        },
        select: { id: true },
      });
      if (activeDelivery) {
        throw new ConflictException('Complete or decline the active delivery before ending the shift');
      }
      if (!current.isShiftActive) return { riderId: rider.id, isShiftActive: false };

      await tx.riderProfile.update({
        where: { id: rider.id },
        data: { isShiftActive: false },
      });
      await this.audit(tx, user, rider.id, 'RIDER_SHIFT_STOP', {});
      return { riderId: rider.id, isShiftActive: false };
    });
  }

  async createUploadUrl(dto: KycUploadUrlDto, user: UserPayload) {
    const rider = await this.findRiderByUser(user.id);
    this.assertCanSubmit(rider.kycStatus);
    if (!allowedImageTypes.has(dto.contentType)) {
      throw new BadRequestException('KYC documents must be JPEG, PNG, or WebP images');
    }
    if (dto.contentLength < 1 || dto.contentLength > maximumImageSize) {
      throw new BadRequestException('KYC image must be between 1 byte and 5 MB');
    }
    const extension = this.extensionForType(dto.contentType);
    const key = `rider-kyc/${rider.id}/uploads/${randomUUID()}.${extension}`;
    return this.storage.createKycUploadUrl(key, dto.contentType, dto.contentLength);
  }

  async submitKyc(dto: SubmitRiderKycDto, user: UserPayload) {
    const rider = await this.findRiderByUser(user.id);
    this.assertCanSubmit(rider.kycStatus);
    const bikeNumber = dto.bikeNumber.trim().toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9 -]{1,48}[A-Z0-9]$/.test(bikeNumber)) {
      throw new BadRequestException('Bike number must contain 3-50 letters, digits, spaces, or hyphens');
    }

    this.assertDocumentKey(dto.drivingLicenceObjectKey, rider.id);
    this.assertDocumentKey(dto.vehicleLicenceObjectKey, rider.id);
    if (dto.drivingLicenceObjectKey === dto.vehicleLicenceObjectKey) {
      throw new BadRequestException('Driving licence and vehicle licence must be separate images');
    }
    const [drivingImage, vehicleImage] = await Promise.all([
      this.storage.readAndValidateKycImage(
        dto.drivingLicenceObjectKey,
        this.typeForKey(dto.drivingLicenceObjectKey),
      ),
      this.storage.readAndValidateKycImage(
        dto.vehicleLicenceObjectKey,
        this.typeForKey(dto.vehicleLicenceObjectKey),
      ),
    ]);
    await Promise.all([
      this.malwareScanner.scan(drivingImage.bytes),
      this.malwareScanner.scan(vehicleImage.bytes),
    ]);

    const promotedKeys: string[] = [];
    let result: { rider: KycRiderWithUser; notifications: Notification[] };
    try {
      const drivingLicenceKey = await this.storage.promoteKycDocument(
        dto.drivingLicenceObjectKey,
        this.typeForKey(dto.drivingLicenceObjectKey),
        drivingImage.etag,
      );
      promotedKeys.push(drivingLicenceKey);
      const vehicleLicenceKey = await this.storage.promoteKycDocument(
        dto.vehicleLicenceObjectKey,
        this.typeForKey(dto.vehicleLicenceObjectKey),
        vehicleImage.etag,
      );
      promotedKeys.push(vehicleLicenceKey);

      result = await this.prisma.$transaction(async (tx) => {
        await this.lockRider(tx, rider.id);
        const current = await tx.riderProfile.findUniqueOrThrow({
          where: { id: rider.id },
          include: { user: { select: { id: true, fullName: true, phone: true, email: true } } },
        });
        this.assertCanSubmit(current.kycStatus);

        const oldStatus = current.kycStatus;
        const updated = await tx.riderProfile.update({
          where: { id: rider.id },
          data: {
            bikeNumber,
            drivingLicenceObjectKey: drivingLicenceKey,
            vehicleLicenceObjectKey: vehicleLicenceKey,
            kycStatus: KycStatus.KYC_SUBMITTED,
            rejectionReason: null,
            isShiftActive: false,
          },
          include: { user: { select: { id: true, fullName: true, phone: true, email: true } } },
        });
        await this.audit(tx, user, updated.id, 'RIDER_KYC_SUBMIT', {
          from: oldStatus,
          to: KycStatus.KYC_SUBMITTED,
          bikeNumber,
        });
        const notifications = await this.queueStateChange(
          tx,
          updated.user,
          KycStatus.KYC_SUBMITTED,
          'Rider KYC submitted',
          'Your rider documents were received and are awaiting review.',
        );
        return { rider: updated, notifications };
      });
    } catch (error) {
      for (const key of promotedKeys) {
        try {
          await this.storage.removeKycDocument(key);
        } catch (cleanupError) {
          this.logger.error(
            `Failed to clean up uncommitted KYC object ${key}`,
            cleanupError instanceof Error ? cleanupError.stack : undefined,
          );
        }
      }
      throw error;
    }

    for (const key of [dto.drivingLicenceObjectKey, dto.vehicleLicenceObjectKey]) {
      try {
        await this.storage.removeKycDocument(key);
      } catch (cleanupError) {
        this.logger.warn(
          `Temporary KYC upload ${key} could not be removed: ${
            cleanupError instanceof Error ? cleanupError.message : 'unknown storage error'
          }`,
        );
      }
    }
    await this.dispatchStateChange(result.notifications, result.rider.user);
    return this.publicStatus(result.rider);
  }

  async reviewQueue(query: RiderKycReviewQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.riderProfile.findMany({
        where: { kycStatus: KycStatus.KYC_SUBMITTED },
        orderBy: { updatedAt: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          bikeNumber: true,
          kycStatus: true,
          createdAt: true,
          updatedAt: true,
          user: { select: { id: true, fullName: true, phone: true, email: true } },
        },
      }),
      this.prisma.riderProfile.count({ where: { kycStatus: KycStatus.KYC_SUBMITTED } }),
    ]);
    return { items, page, pageSize, total };
  }

  async reviewDetails(riderId: string) {
    const rider = await this.prisma.riderProfile.findUnique({
      where: { id: riderId },
      select: {
        id: true,
        bikeNumber: true,
        kycStatus: true,
        riderType: true,
        assignedStoreId: true,
        rejectionReason: true,
        createdAt: true,
        updatedAt: true,
        drivingLicenceObjectKey: true,
        vehicleLicenceObjectKey: true,
        user: { select: { id: true, fullName: true, phone: true, email: true, isActive: true } },
      },
    });
    if (!rider) throw new NotFoundException('Rider profile not found');
    return {
      ...rider,
      drivingLicenceObjectKey: undefined,
      vehicleLicenceObjectKey: undefined,
      documents: {
        drivingLicenceAvailable: Boolean(rider.drivingLicenceObjectKey),
        vehicleLicenceAvailable: Boolean(rider.vehicleLicenceObjectKey),
      },
    };
  }

  async documentUrl(riderId: string, documentType: string) {
    if (documentType !== 'driving-licence' && documentType !== 'vehicle-licence') {
      throw new BadRequestException('Document type must be driving-licence or vehicle-licence');
    }
    const rider = await this.prisma.riderProfile.findUnique({
      where: { id: riderId },
      select: {
        drivingLicenceObjectKey: true,
        vehicleLicenceObjectKey: true,
      },
    });
    if (!rider) throw new NotFoundException('Rider profile not found');
    const key = documentType === 'driving-licence'
      ? rider.drivingLicenceObjectKey
      : rider.vehicleLicenceObjectKey;
    if (!key) throw new NotFoundException('KYC document not found');
    return this.storage.createKycDownloadUrl(key);
  }

  async approve(riderId: string, dto: ApproveRiderKycDto, user: UserPayload) {
    const result = await this.prisma.$transaction(async (tx) => {
      await this.lockRider(tx, riderId);
      const current = await tx.riderProfile.findUnique({
        where: { id: riderId },
        include: { user: { select: { id: true, fullName: true, phone: true, email: true } } },
      });
      if (!current) throw new NotFoundException('Rider profile not found');
      if (current.kycStatus !== KycStatus.KYC_SUBMITTED) {
        throw new ConflictException('Only submitted KYC can be approved');
      }
      const store = await tx.store.findUnique({
        where: { id: dto.storeId },
        select: { id: true, isActive: true },
      });
      if (!store?.isActive) throw new BadRequestException('An active store must be assigned');

      const updated = await tx.riderProfile.update({
        where: { id: riderId },
        data: {
          kycStatus: KycStatus.APPROVED,
          riderType: dto.riderType,
          assignedStoreId: store.id,
          approvedByUserId: user.id,
          approvedAt: new Date(),
          rejectionReason: null,
        },
        include: { user: { select: { id: true, fullName: true, phone: true, email: true } } },
      });
      await tx.user.update({ where: { id: updated.userId }, data: { isActive: true } });
      await this.audit(tx, user, riderId, 'RIDER_KYC_APPROVE', {
        from: current.kycStatus,
        to: KycStatus.APPROVED,
        assignedStoreId: store.id,
        riderType: dto.riderType,
      });
      const notifications = await this.queueStateChange(
        tx,
        updated.user,
        KycStatus.APPROVED,
        'Rider account approved',
        'Your rider account is approved and assigned to a store. You can now start working.',
      );
      return { rider: updated, notifications };
    });
    await this.dispatchStateChange(result.notifications, result.rider.user);
    return this.publicStatus(result.rider);
  }

  async reject(riderId: string, dto: RejectRiderKycDto, user: UserPayload) {
    const reason = dto.reason.trim();
    if (!reason) throw new BadRequestException('A rejection reason is required');
    const result = await this.prisma.$transaction(async (tx) => {
      await this.lockRider(tx, riderId);
      const current = await tx.riderProfile.findUnique({
        where: { id: riderId },
        include: { user: { select: { id: true, fullName: true, phone: true, email: true } } },
      });
      if (!current) throw new NotFoundException('Rider profile not found');
      if (current.kycStatus !== KycStatus.KYC_SUBMITTED) {
        throw new ConflictException('Only submitted KYC can be rejected');
      }
      const updated = await tx.riderProfile.update({
        where: { id: riderId },
        data: {
          kycStatus: KycStatus.REJECTED,
          rejectionReason: reason,
          isShiftActive: false,
        },
        include: { user: { select: { id: true, fullName: true, phone: true, email: true } } },
      });
      await this.audit(tx, user, riderId, 'RIDER_KYC_REJECT', {
        from: current.kycStatus,
        to: KycStatus.REJECTED,
        reason,
      });
      const notifications = await this.queueStateChange(
        tx,
        updated.user,
        KycStatus.REJECTED,
        'Rider KYC needs changes',
        `Your KYC was rejected: ${reason}. Upload updated licence images and resubmit.`,
      );
      return { rider: updated, notifications };
    });
    await this.dispatchStateChange(result.notifications, result.rider.user);
    return this.publicStatus(result.rider);
  }

  async suspend(riderId: string, dto: SuspendRiderDto, user: UserPayload) {
    const reason = dto.reason.trim();
    if (!reason) throw new BadRequestException('A suspension reason is required');
    const result = await this.prisma.$transaction(async (tx) => {
      await this.lockRider(tx, riderId);
      const current = await tx.riderProfile.findUnique({
        where: { id: riderId },
        include: { user: { select: { id: true, fullName: true, phone: true, email: true } } },
      });
      if (!current) throw new NotFoundException('Rider profile not found');
      if (current.kycStatus !== KycStatus.APPROVED) {
        throw new ConflictException('Only approved riders can be suspended');
      }
      const updated = await tx.riderProfile.update({
        where: { id: riderId },
        data: {
          kycStatus: KycStatus.SUSPENDED,
          rejectionReason: reason,
          isShiftActive: false,
        },
        include: { user: { select: { id: true, fullName: true, phone: true, email: true } } },
      });
      await tx.user.update({ where: { id: updated.userId }, data: { isActive: false } });
      await tx.deviceSession.updateMany({
        where: { userId: updated.userId, isRevoked: false },
        data: { isRevoked: true },
      });
      await this.audit(tx, user, riderId, 'RIDER_SUSPEND', {
        from: current.kycStatus,
        to: KycStatus.SUSPENDED,
        reason,
      });
      const notifications = await this.queueStateChange(
        tx,
        updated.user,
        KycStatus.SUSPENDED,
        'Rider account suspended',
        `Your BuyMe rider account was suspended: ${reason}`,
      );
      return { rider: updated, notifications };
    });
    await this.dispatchStateChange(result.notifications, result.rider.user);
    return this.publicStatus(result.rider);
  }

  private async findRiderByUser(userId: string) {
    const rider = await this.prisma.riderProfile.findUnique({
      where: { userId },
      select: { id: true, kycStatus: true },
    });
    if (!rider) throw new NotFoundException('Rider profile not found');
    return rider;
  }

  private assertCanSubmit(status: KycStatus) {
    if (status !== KycStatus.REGISTERED && status !== KycStatus.REJECTED) {
      throw new ConflictException('KYC can only be submitted for a new or rejected rider');
    }
  }

  private assertDocumentKey(key: string, riderId: string) {
    const prefix = `rider-kyc/${riderId}/uploads/`;
    if (
      !key.startsWith(prefix) ||
      key.slice(prefix.length).includes('/') ||
      key.includes('..') ||
      key.includes('\\')
    ) {
      throw new ForbiddenException('KYC document key does not belong to this rider');
    }
    if (!/\.(jpe?g|png|webp)$/i.test(key)) {
      throw new BadRequestException('KYC documents must be JPEG, PNG, or WebP images');
    }
  }

  private extensionForType(contentType: string) {
    switch (contentType) {
      case 'image/jpeg': return 'jpg';
      case 'image/png': return 'png';
      case 'image/webp': return 'webp';
      default: throw new BadRequestException('KYC documents must be JPEG, PNG, or WebP images');
    }
  }

  private typeForKey(key: string) {
    const extension = key.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'webp': return 'image/webp';
      default: throw new BadRequestException('KYC documents must be JPEG, PNG, or WebP images');
    }
  }

  private async lockRider(tx: Prisma.TransactionClient, riderId: string) {
    const rows = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "RiderProfile" WHERE "id" = ${riderId}::uuid FOR UPDATE
    `;
    if (!rows[0]) throw new NotFoundException('Rider profile not found');
  }

  private async audit(
    tx: Prisma.TransactionClient,
    user: UserPayload,
    riderId: string,
    action: string,
    values: Prisma.InputJsonObject,
  ) {
    return tx.auditLog.create({
      data: {
        userId: user.id,
        userRole: user.role as Role,
        action,
        entityType: 'RiderProfile',
        entityId: riderId,
        newValues: values,
      },
    });
  }

  private queueStateChange(
    tx: Prisma.TransactionClient,
    user: RiderRecord['user'],
    state: KycStatus,
    title: string,
    body: string,
  ): Promise<Notification[]> {
    return this.notifications.queueRiderStateChange(tx, user, state, title, body);
  }

  private async dispatchStateChange(
    notifications: Notification[],
    user: RiderRecord['user'],
  ) {
    await this.notifications.dispatchRiderStateChange(notifications, user);
  }

  private publicStatus(rider: {
    id: string;
    kycStatus: KycStatus;
    riderType: RiderType;
    assignedStoreId: string | null;
    bikeNumber: string | null;
    rejectionReason: string | null;
    drivingLicenceObjectKey: string | null;
    vehicleLicenceObjectKey: string | null;
    user: { id: string; fullName: string; phone: string | null; email: string | null };
  }) {
    return {
      id: rider.id,
      userId: rider.user.id,
      fullName: rider.user.fullName,
      phone: rider.user.phone,
      email: rider.user.email,
      kycStatus: rider.kycStatus,
      riderType: rider.riderType,
      assignedStoreId: rider.assignedStoreId,
      bikeNumber: rider.bikeNumber,
      rejectionReason: rider.rejectionReason,
      documents: {
        drivingLicenceUploaded: Boolean(rider.drivingLicenceObjectKey),
        vehicleLicenceUploaded: Boolean(rider.vehicleLicenceObjectKey),
      },
    };
  }
}
