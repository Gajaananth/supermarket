import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DepositStatus,
  DepositVarianceStatus,
  Prisma,
  Role,
  RiderCashEntryType,
} from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { UserPayload } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateRiderDepositDto,
  DepositListQueryDto,
  DepositUploadUrlDto,
  ReconciliationQueryDto,
  ResolveDepositVarianceDto,
  VerifyRiderDepositDto,
  VarianceCaseListQueryDto,
} from './dto/cash-control.dto';
import { PrivateObjectStorageService } from './private-object-storage.service';

const activeOrderStatuses = ['RIDER_ASSIGNED', 'PICKED_UP', 'ON_THE_WAY'] as const;
const riderWithStore = {
  assignedStore: { select: { id: true, cashHoldThreshold: true, cashHoldMaxHours: true } },
} as const;
const depositSelect = {
  id: true,
  depositNumber: true,
  riderId: true,
  storeId: true,
  amount: true,
  bankRefNumber: true,
  status: true,
  submittedAt: true,
  verifiedByUserId: true,
  verifiedAt: true,
  rejectionReason: true,
  receivedAmount: true,
  varianceAmount: true,
  varianceReason: true,
  notes: true,
  varianceCase: {
    select: {
      id: true,
      expectedAmount: true,
      receivedAmount: true,
      varianceAmount: true,
      reason: true,
      status: true,
      openedAt: true,
      resolvedAt: true,
      resolutionNote: true,
    },
  },
  rider: {
    select: {
      id: true,
      user: { select: { fullName: true, phone: true, email: true } },
    },
  },
} satisfies Prisma.RiderDepositSelect;

const varianceCaseSelect = {
  id: true,
  depositId: true,
  riderId: true,
  storeId: true,
  expectedAmount: true,
  receivedAmount: true,
  varianceAmount: true,
  reason: true,
  status: true,
  openedByUserId: true,
  resolvedByUserId: true,
  resolutionNote: true,
  openedAt: true,
  resolvedAt: true,
  rider: {
    select: {
      id: true,
      user: { select: { fullName: true, phone: true, email: true } },
    },
  },
} satisfies Prisma.RiderDepositVarianceCaseSelect;

type RiderWithStore = Prisma.RiderProfileGetPayload<{ include: typeof riderWithStore }>;

@Injectable()
export class CashControlService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: PrivateObjectStorageService,
  ) {}

  async getMyCash(user: UserPayload) {
    const assignedRider = await this.getAssignedRider(user);
    const riderId = assignedRider.id;
    return this.prisma.$transaction(async (tx) => {
      await this.lockRider(tx, riderId);
      const rider = await tx.riderProfile.findUniqueOrThrow({
        where: { id: riderId },
        include: riderWithStore,
      });
      const updated = await this.applyDueCashLock(tx, rider, user);
      return {
        riderId: updated.id,
        storeId: updated.assignedStoreId,
        cashInHand: updated.cashInHand,
        oldestCashCollectionTime: updated.oldestCashCollectionTime,
        isCashLocked: updated.isCashLocked,
        cashLockReason: updated.cashLockReason,
        depositPending: updated.depositPending,
        cashHoldThreshold: updated.assignedStore?.cashHoldThreshold ?? null,
        cashHoldMaxHours: updated.assignedStore?.cashHoldMaxHours ?? null,
      };
    });
  }

  async enforceCashPolicy(
    tx: Prisma.TransactionClient,
    riderId: string,
    actor: UserPayload,
  ) {
    await this.lockRider(tx, riderId);
    const rider = await tx.riderProfile.findUniqueOrThrow({
      where: { id: riderId },
      include: riderWithStore,
    });
    const updated = await this.applyDueCashLock(tx, rider, actor);
    return {
      isCashLocked: updated.isCashLocked,
      depositPending: updated.depositPending,
      cashLockReason: updated.cashLockReason,
    };
  }

  async sweepOverdueCashLocks() {
    const candidates = await this.prisma.riderProfile.findMany({
      where: {
        assignedStoreId: { not: null },
        isCashLocked: false,
        depositPending: false,
        cashInHand: { gt: 0 },
      },
      select: { id: true },
      orderBy: { updatedAt: 'asc' },
      take: 500,
    });
    let lockedCount = 0;
    for (const candidate of candidates) {
      const locked = await this.prisma.$transaction(async (tx) => {
        await this.lockRider(tx, candidate.id);
        const rider = await tx.riderProfile.findUniqueOrThrow({
          where: { id: candidate.id },
          include: riderWithStore,
        });
        const updated = await this.applyDueCashLock(tx, rider, null);
        return updated.isCashLocked;
      });
      if (locked) lockedCount += 1;
    }
    return lockedCount;
  }

  async recordCodCollection(
    tx: Prisma.TransactionClient,
    order: { id: string; riderId: string | null; storeId: string; totalAmount: Prisma.Decimal },
    user: UserPayload,
  ) {
    if (!order.riderId) {
      throw new ConflictException('Assigned rider profile is no longer available');
    }
    await this.lockRider(tx, order.riderId);
    const rider = await tx.riderProfile.findUnique({
      where: { id: order.riderId },
      include: riderWithStore,
    });
    if (!rider || rider.assignedStoreId !== order.storeId || !rider.assignedStore) {
      throw new ConflictException('Assigned rider is not linked to the order store');
    }

    const collectedAt = new Date();
    const cashInHand = rider.cashInHand.plus(order.totalAmount);
    const oldestCashCollectionTime = rider.oldestCashCollectionTime ?? collectedAt;
    const thresholdReached = cashInHand.greaterThanOrEqualTo(
      rider.assignedStore.cashHoldThreshold,
    );
    const timeExpired =
      collectedAt.getTime() - oldestCashCollectionTime.getTime() >=
      rider.assignedStore.cashHoldMaxHours * 60 * 60 * 1000;
    const shouldLock = rider.isCashLocked || thresholdReached || timeExpired;
    const cashLockReason = thresholdReached
      ? `Cash in hand reached ${cashInHand.toFixed(2)}; deposit required`
      : timeExpired
        ? `Cash has been held for at least ${rider.assignedStore.cashHoldMaxHours} hours`
        : rider.cashLockReason;

    await tx.riderProfile.update({
      where: { id: rider.id },
      data: {
        cashInHand,
        oldestCashCollectionTime,
        ...(shouldLock
          ? {
              isCashLocked: true,
              cashLockReason,
            }
          : {}),
      },
    });
    await tx.riderCashLedgerEntry.create({
      data: {
        riderId: rider.id,
        storeId: order.storeId,
        entryType: 'DELIVERY_COLLECTION',
        amount: order.totalAmount,
        balanceAfter: cashInHand,
        orderId: order.id,
        actorUserId: user.id,
        note: `COD collected for order ${order.id}`,
        createdAt: collectedAt,
      },
    });
    await tx.auditLog.create({
      data: {
        userId: user.id,
        userRole: user.role as Role,
        action: 'RIDER_COD_CASH_COLLECTED',
        entityType: 'RiderProfile',
        entityId: rider.id,
        newValues: {
          orderId: order.id,
          amount: order.totalAmount.toFixed(2),
          cashInHand: cashInHand.toFixed(2),
          isCashLocked: shouldLock,
        },
      },
    });
  }

  async createUploadUrl(dto: DepositUploadUrlDto, user: UserPayload) {
    const rider = await this.getAssignedRider(user);
    await this.prisma.$transaction(async (tx) => {
      await this.lockRider(tx, rider.id);
      const current = await tx.riderProfile.findUniqueOrThrow({
        where: { id: rider.id },
        include: riderWithStore,
      });
      const dueCash = await this.applyDueCashLock(tx, current, user);
      this.assertDepositCanBeSubmitted(dueCash);
      await this.assertNoActiveOrders(tx, current.id);
    });

    const extension = this.extensionForType(dto.contentType);
    const key = `rider-deposits/${rider.id}/${randomUUID()}.${extension}`;
    return this.storage.createUploadUrl(key, dto.contentType, dto.contentLength);
  }

  async submit(dto: CreateRiderDepositDto, user: UserPayload) {
    const rider = await this.getAssignedRider(user);
    this.assertDepositObjectKey(dto.objectKey, rider.id);
    const expectedType = this.typeForExtension(dto.objectKey);
    await this.storage.validateDepositSlip(dto.objectKey, expectedType);

    const deposit = await this.prisma.$transaction(async (tx) => {
      await this.lockRider(tx, rider.id);
      const current = await tx.riderProfile.findUniqueOrThrow({
        where: { id: rider.id },
        include: riderWithStore,
      });
      const dueCash = await this.applyDueCashLock(tx, current, user);
      if (dueCash.kycStatus !== 'APPROVED' || !dueCash.assignedStoreId) {
        throw new ForbiddenException('An approved rider assigned to a store is required');
      }
      this.assertDepositCanBeSubmitted(dueCash);
      await this.assertNoActiveOrders(tx, rider.id);
      if (!dueCash.cashInHand.equals(new Prisma.Decimal(dto.amount))) {
        throw new ConflictException('Deposit amount must equal the rider cash balance');
      }

      const bankRefNumber = dto.bankRefNumber.trim().toUpperCase();
      await tx.$queryRaw`
        SELECT pg_advisory_xact_lock(
          hashtextextended(${`deposit-ref:${dueCash.assignedStoreId}:${bankRefNumber}`}, 0)
        ) IS NULL
      `;
      const duplicateReference = await tx.riderDeposit.findFirst({
        where: {
          storeId: dueCash.assignedStoreId,
          bankRefNumber,
        },
        select: { id: true },
      });
      if (duplicateReference) {
        throw new ConflictException('Bank reference has already been submitted for this store');
      }
      const duplicateObject = await tx.riderDeposit.findFirst({
        where: { slipImageUrl: dto.objectKey },
        select: { id: true },
      });
      if (duplicateObject) throw new ConflictException('Deposit slip has already been submitted');

      const created = await tx.riderDeposit.create({
        data: {
          depositNumber: `DEP-${new Date().getFullYear()}-${randomUUID()
            .replace(/-/g, '')
            .slice(0, 12)
            .toUpperCase()}`,
          riderId: rider.id,
          storeId: dueCash.assignedStoreId,
          amount: dueCash.cashInHand,
          bankRefNumber,
          slipImageUrl: dto.objectKey,
          status: DepositStatus.PENDING,
        },
      });
      await tx.riderProfile.update({
        where: { id: rider.id },
        data: {
          isCashLocked: true,
          cashLockReason: 'Deposit submitted; awaiting verification',
          depositPending: true,
        },
      });
      await this.audit(tx, user, created.id, 'RIDER_DEPOSIT_SUBMIT', {
        depositNumber: created.depositNumber,
        amount: created.amount.toFixed(2),
        bankRefNumber: created.bankRefNumber,
        storeId: created.storeId,
      });
      return created;
    });

    return this.findPublicDeposit(deposit.id);
  }

  async list(query: DepositListQueryDto, user: UserPayload) {
    const where: Prisma.RiderDepositWhereInput = {
      ...(query.status ? { status: query.status } : {}),
    };

    if (user.role === Role.RIDER) {
      const rider = await this.getAssignedRider(user);
      const riderId = rider.id;
      if (query.riderId && query.riderId !== riderId) {
        throw new ForbiddenException('Riders can only view their own deposits');
      }
      where.riderId = riderId;
    } else if (user.role === Role.STORE_ADMIN) {
      const storeId = await this.storeForAdmin(user.id);
      if (query.storeId && query.storeId !== storeId) {
        throw new ForbiddenException('Store admins can only view deposits for their assigned store');
      }
      where.storeId = storeId;
      if (query.riderId) where.riderId = query.riderId;
    } else if (user.role === Role.SUPER_ADMIN) {
      if (query.storeId) where.storeId = query.storeId;
      if (query.riderId) where.riderId = query.riderId;
    } else {
      throw new ForbiddenException('Deposit access is not allowed');
    }

    return this.prisma.riderDeposit.findMany({
      where,
      select: depositSelect,
      orderBy: { submittedAt: 'desc' },
      take: query.limit ?? 50,
    });
  }

  async listVerificationQueue(query: DepositListQueryDto, user: UserPayload) {
    const limit = query.limit ?? 50;
    const [pending, variance] = await Promise.all([
      this.list({ ...query, status: DepositStatus.PENDING, limit }, user),
      this.list({ ...query, status: DepositStatus.VARIANCE, limit }, user),
    ]);
    return [...pending, ...variance]
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
      .slice(0, limit);
  }

  async listVarianceCases(query: VarianceCaseListQueryDto, user: UserPayload) {
    const where: Prisma.RiderDepositVarianceCaseWhereInput = {
      ...(query.status ? { status: query.status } : {}),
    };
    if (user.role === Role.RIDER) {
      const rider = await this.getAssignedRider(user);
      where.riderId = rider.id;
    } else if (user.role === Role.STORE_ADMIN) {
      const storeId = await this.storeForAdmin(user.id);
      if (query.storeId && query.storeId !== storeId) {
        throw new ForbiddenException('Store admins can only view variance cases for their store');
      }
      where.storeId = storeId;
    } else if (user.role === Role.SUPER_ADMIN) {
      if (query.storeId) where.storeId = query.storeId;
    } else {
      throw new ForbiddenException('Deposit variance access is not allowed');
    }

    return this.prisma.riderDepositVarianceCase.findMany({
      where,
      select: varianceCaseSelect,
      orderBy: { openedAt: 'desc' },
      take: query.limit ?? 50,
    });
  }

  async getStoreReconciliation(
    storeId: string,
    query: ReconciliationQueryDto,
    user: UserPayload,
  ) {
    await this.assertStoreReconciliationAccess(storeId, user);
    const { start, end } = this.sriLankaDayRange(query.date);
    const [openingRows, activityRows] = await Promise.all([
      this.prisma.riderCashLedgerEntry.groupBy({
        by: ['riderId'],
        where: { storeId, createdAt: { lt: start } },
        _sum: { amount: true },
      }),
      this.prisma.riderCashLedgerEntry.groupBy({
        by: ['riderId', 'entryType'],
        where: { storeId, createdAt: { gte: start, lt: end } },
        _sum: { amount: true },
      }),
    ]);
    const riderIds = [...new Set([
      ...openingRows.map((row) => row.riderId),
      ...activityRows.map((row) => row.riderId),
    ])];
    const riders = await this.prisma.riderProfile.findMany({
      where: { id: { in: riderIds } },
      select: {
        id: true,
        user: { select: { fullName: true } },
      },
    });
    const names = new Map(riders.map((rider) => [rider.id, rider.user.fullName]));
    const openingByRider = new Map(
      openingRows.map((row) => [row.riderId, row._sum.amount ?? new Prisma.Decimal(0)]),
    );
    const activityByRider = new Map<string, {
      collections: Prisma.Decimal;
      deposits: Prisma.Decimal;
      varianceAdjustments: Prisma.Decimal;
      netChange: Prisma.Decimal;
    }>();
    for (const row of activityRows) {
      const sums = activityByRider.get(row.riderId) ?? {
        collections: new Prisma.Decimal(0),
        deposits: new Prisma.Decimal(0),
        varianceAdjustments: new Prisma.Decimal(0),
        netChange: new Prisma.Decimal(0),
      };
      const amount = row._sum.amount ?? new Prisma.Decimal(0);
      sums.netChange = sums.netChange.plus(amount);
      if (row.entryType === RiderCashEntryType.DELIVERY_COLLECTION) {
        sums.collections = sums.collections.plus(amount);
      } else if (row.entryType === RiderCashEntryType.DEPOSIT_SETTLEMENT) {
        sums.deposits = sums.deposits.plus(amount.abs());
      } else if (row.entryType === RiderCashEntryType.VARIANCE_ADJUSTMENT) {
        sums.varianceAdjustments = sums.varianceAdjustments.plus(amount);
      }
      activityByRider.set(row.riderId, sums);
    }
    const details = riderIds.map((riderId) => {
      const openingCash = openingByRider.get(riderId) ?? new Prisma.Decimal(0);
      const activity = activityByRider.get(riderId);
      const collections = activity?.collections ?? new Prisma.Decimal(0);
      const deposits = activity?.deposits ?? new Prisma.Decimal(0);
      const varianceAdjustments = activity?.varianceAdjustments ?? new Prisma.Decimal(0);
      const closingCash = openingCash.plus(activity?.netChange ?? new Prisma.Decimal(0));
      return {
        riderId,
        riderName: names.get(riderId) ?? null,
        openingCash: openingCash.toFixed(2),
        collections: collections.toFixed(2),
        approvedDeposits: deposits.toFixed(2),
        varianceAdjustments: varianceAdjustments.toFixed(2),
        closingCash: closingCash.toFixed(2),
      };
    });
    const total = (key: 'openingCash' | 'collections' | 'approvedDeposits' |
      'varianceAdjustments' | 'closingCash') =>
      details.reduce(
        (sum, rider) => sum.plus(rider[key]),
        new Prisma.Decimal(0),
      ).toFixed(2);
    return {
      storeId,
      businessDate: query.date,
      timeZone: 'Asia/Colombo',
      openingCash: total('openingCash'),
      collections: total('collections'),
      approvedDeposits: total('approvedDeposits'),
      varianceAdjustments: total('varianceAdjustments'),
      closingCash: total('closingCash'),
      riders: details,
    };
  }

  async createDownloadUrl(id: string, user: UserPayload) {
    if (user.role === Role.RIDER) await this.getAssignedRider(user);
    const deposit = await this.prisma.riderDeposit.findUnique({
      where: { id },
      select: { id: true, riderId: true, storeId: true, slipImageUrl: true },
    });
    if (!deposit) throw new NotFoundException('Deposit not found');
    await this.assertDepositAccess(deposit, user);
    const signed = await this.storage.createDownloadUrl(deposit.slipImageUrl);
    return { depositId: deposit.id, ...signed };
  }

  async verify(id: string, dto: VerifyRiderDepositDto, user: UserPayload) {
    if (dto.action === 'REJECT' && !dto.rejectionReason?.trim()) {
      throw new BadRequestException('A rejection reason is required');
    }
    if (
      dto.action === 'VARIANCE' &&
      (dto.receivedAmount === undefined || !dto.varianceReason?.trim())
    ) {
      throw new BadRequestException('A received amount and variance reason are required');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const depositLock = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "RiderDeposit" WHERE "id" = ${id}::uuid FOR UPDATE
      `;
      if (!depositLock[0]) throw new NotFoundException('Deposit not found');
      const deposit = await tx.riderDeposit.findUniqueOrThrow({ where: { id } });
      await this.assertDepositAccess(deposit, user, tx);
      if (deposit.status !== DepositStatus.PENDING) {
        throw new ConflictException('Only pending deposits can be verified');
      }

      await this.lockRider(tx, deposit.riderId);
      const rider = await tx.riderProfile.findUniqueOrThrow({
        where: { id: deposit.riderId },
      });
      if (!rider.depositPending) {
        throw new ConflictException('Rider deposit state is inconsistent');
      }

      if (dto.action === 'APPROVE') {
        if (!rider.cashInHand.equals(deposit.amount)) {
          throw new ConflictException('Deposit amount no longer matches the rider cash balance');
        }
        const verifiedAt = new Date();
        const updated = await tx.riderDeposit.update({
          where: { id },
          data: {
            status: DepositStatus.APPROVED,
            receivedAmount: deposit.amount,
            verifiedByUserId: user.id,
            verifiedAt,
          },
        });
        await tx.riderCashLedgerEntry.create({
          data: {
            riderId: rider.id,
            storeId: deposit.storeId,
            entryType: RiderCashEntryType.DEPOSIT_SETTLEMENT,
            amount: deposit.amount.negated(),
            balanceAfter: new Prisma.Decimal(0),
            depositId: deposit.id,
            actorUserId: user.id,
            note: `Deposit ${deposit.depositNumber} approved`,
            createdAt: verifiedAt,
          },
        });
        await tx.riderProfile.update({
          where: { id: rider.id },
          data: {
            cashInHand: 0,
            oldestCashCollectionTime: null,
            isCashLocked: false,
            cashLockReason: null,
            depositPending: false,
          },
        });
        await this.audit(tx, user, id, 'RIDER_DEPOSIT_APPROVE', {
          depositNumber: deposit.depositNumber,
          amount: deposit.amount.toFixed(2),
          riderId: rider.id,
        });
        return updated.id;
      }

      if (dto.action === 'VARIANCE') {
        const receivedAmount = new Prisma.Decimal(dto.receivedAmount!);
        if (receivedAmount.equals(deposit.amount)) {
          throw new BadRequestException(
            'A variance case is only required when the received amount differs from the deposit',
          );
        }
        const varianceAmount = receivedAmount.minus(deposit.amount);
        const openedAt = new Date();
        const updated = await tx.riderDeposit.update({
          where: { id },
          data: {
            status: DepositStatus.VARIANCE,
            receivedAmount,
            varianceAmount,
            varianceReason: dto.varianceReason!.trim(),
            verifiedByUserId: user.id,
            verifiedAt: openedAt,
          },
        });
        const varianceCase = await tx.riderDepositVarianceCase.create({
          data: {
            depositId: deposit.id,
            riderId: rider.id,
            storeId: deposit.storeId,
            expectedAmount: deposit.amount,
            receivedAmount,
            varianceAmount,
            reason: dto.varianceReason!.trim(),
            openedByUserId: user.id,
            openedAt,
          },
        });
        await this.audit(tx, user, varianceCase.id, 'RIDER_DEPOSIT_VARIANCE_OPEN', {
          depositId: deposit.id,
          expectedAmount: deposit.amount.toFixed(2),
          receivedAmount: receivedAmount.toFixed(2),
          varianceAmount: varianceAmount.toFixed(2),
          reason: dto.varianceReason!.trim(),
        });
        return updated.id;
      }

      const reason = dto.rejectionReason?.trim() ?? '';
      const updated = await tx.riderDeposit.update({
        where: { id },
        data: {
          status: DepositStatus.REJECTED,
          verifiedByUserId: user.id,
          verifiedAt: new Date(),
          rejectionReason: reason,
        },
      });
      await tx.riderProfile.update({
        where: { id: rider.id },
        data: {
          isCashLocked: true,
          cashLockReason: `Deposit rejected: ${reason}`,
          depositPending: false,
        },
      });
      await this.audit(tx, user, id, 'RIDER_DEPOSIT_REJECT', {
        depositNumber: deposit.depositNumber,
        reason,
        riderId: rider.id,
      });
      return updated.id;
    });

    return this.findPublicDeposit(result);
  }

  async resolveVariance(
    depositId: string,
    dto: ResolveDepositVarianceDto,
    user: UserPayload,
  ) {
    if (user.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only a Super Admin can resolve deposit variance cases');
    }
    const result = await this.prisma.$transaction(async (tx) => {
      const depositLock = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "RiderDeposit" WHERE "id" = ${depositId}::uuid FOR UPDATE
      `;
      if (!depositLock[0]) throw new NotFoundException('Deposit not found');
      const deposit = await tx.riderDeposit.findUniqueOrThrow({ where: { id: depositId } });
      if (deposit.status !== DepositStatus.VARIANCE) {
        throw new ConflictException('Deposit has no open variance case');
      }
      const varianceRows = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "RiderDepositVarianceCase"
        WHERE "depositId" = ${depositId}::uuid AND "status" = 'OPEN'
        FOR UPDATE
      `;
      if (!varianceRows[0]) throw new ConflictException('Deposit variance case is not open');
      const varianceCase = await tx.riderDepositVarianceCase.findUniqueOrThrow({
        where: { id: varianceRows[0].id },
      });

      await this.lockRider(tx, deposit.riderId);
      const rider = await tx.riderProfile.findUniqueOrThrow({
        where: { id: deposit.riderId },
      });
      if (!rider.depositPending || !rider.cashInHand.equals(varianceCase.expectedAmount)) {
        throw new ConflictException('Rider cash state does not match the variance case');
      }

      const resolvedAt = new Date();
      const resolutionNote = dto.resolutionNote.trim();
      if (dto.action === 'ACCEPT_VARIANCE') {
        const remainingAfterBankDeposit = varianceCase.expectedAmount.minus(
          varianceCase.receivedAmount,
        );
        await tx.riderCashLedgerEntry.create({
          data: {
            riderId: rider.id,
            storeId: deposit.storeId,
            entryType: RiderCashEntryType.DEPOSIT_SETTLEMENT,
            amount: varianceCase.receivedAmount.negated(),
            balanceAfter: remainingAfterBankDeposit,
            depositId: deposit.id,
            actorUserId: user.id,
            note: `Bank amount accepted for deposit ${deposit.depositNumber}`,
            createdAt: resolvedAt,
          },
        });
        await tx.riderCashLedgerEntry.create({
          data: {
            riderId: rider.id,
            storeId: deposit.storeId,
            entryType: RiderCashEntryType.VARIANCE_ADJUSTMENT,
            amount: varianceCase.varianceAmount,
            balanceAfter: new Prisma.Decimal(0),
            depositId: deposit.id,
            actorUserId: user.id,
            note: `Variance accepted: ${resolutionNote}`,
            createdAt: resolvedAt,
          },
        });
        await tx.riderProfile.update({
          where: { id: rider.id },
          data: {
            cashInHand: 0,
            oldestCashCollectionTime: null,
            isCashLocked: false,
            cashLockReason: null,
            depositPending: false,
          },
        });
      } else {
        await tx.riderProfile.update({
          where: { id: rider.id },
          data: {
            isCashLocked: true,
            cashLockReason: `Deposit variance rejected: ${resolutionNote}`,
            depositPending: false,
          },
        });
      }

      await tx.riderDeposit.update({
        where: { id: deposit.id },
        data: {
          status: dto.action === 'ACCEPT_VARIANCE'
            ? DepositStatus.APPROVED_WITH_VARIANCE
            : DepositStatus.REJECTED,
          ...(dto.action === 'REJECT_DEPOSIT'
            ? { rejectionReason: `Variance case rejected: ${resolutionNote}` }
            : {}),
        },
      });
      await tx.riderDepositVarianceCase.update({
        where: { id: varianceCase.id },
        data: {
          status: dto.action === 'ACCEPT_VARIANCE'
            ? DepositVarianceStatus.RESOLVED_APPROVED
            : DepositVarianceStatus.RESOLVED_REJECTED,
          resolvedByUserId: user.id,
          resolutionNote,
          resolvedAt,
        },
      });
      await this.audit(tx, user, varianceCase.id, 'RIDER_DEPOSIT_VARIANCE_RESOLVE', {
        depositId: deposit.id,
        action: dto.action,
        resolutionNote,
        receivedAmount: varianceCase.receivedAmount.toFixed(2),
        expectedAmount: varianceCase.expectedAmount.toFixed(2),
        varianceAmount: varianceCase.varianceAmount.toFixed(2),
      });
      return deposit.id;
    });
    return this.findPublicDeposit(result);
  }

  private async getAssignedRider(user: UserPayload): Promise<RiderWithStore> {
    const rider = await this.prisma.riderProfile.findUnique({
      where: { userId: user.id },
      include: riderWithStore,
    });
    if (!rider || rider.kycStatus !== 'APPROVED' || !rider.assignedStoreId) {
      throw new ForbiddenException('An approved rider assigned to a store is required');
    }
    return rider;
  }

  private assertDepositCanBeSubmitted(rider: RiderWithStore) {
    if (rider.depositPending) {
      throw new ConflictException('A deposit is already awaiting verification');
    }
    if (!rider.cashInHand.greaterThan(0)) {
      throw new ConflictException('There is no collected cash to deposit');
    }
    if (!rider.isCashLocked) {
      throw new ConflictException('Cash must reach the store threshold or holding-time limit first');
    }
  }

  private async assertNoActiveOrders(tx: Prisma.TransactionClient, riderId: string) {
    const order = await tx.order.findFirst({
      where: { riderId, status: { in: [...activeOrderStatuses] } },
      select: { id: true },
    });
    if (order) {
      throw new ConflictException('Complete active deliveries before submitting a cash deposit');
    }
  }

  private async applyDueCashLock(
    tx: Prisma.TransactionClient,
    rider: RiderWithStore,
    actor: UserPayload | null,
  ): Promise<RiderWithStore> {
    if (rider.isCashLocked || !rider.assignedStore || !rider.cashInHand.greaterThan(0)) {
      return rider;
    }

    const thresholdReached = rider.cashInHand.greaterThanOrEqualTo(
      rider.assignedStore.cashHoldThreshold,
    );
    const timeExpired =
      rider.oldestCashCollectionTime !== null &&
      Date.now() - rider.oldestCashCollectionTime.getTime() >=
        rider.assignedStore.cashHoldMaxHours * 60 * 60 * 1000;
    if (!thresholdReached && !timeExpired) return rider;

    const reason = thresholdReached
      ? `Cash in hand reached ${rider.cashInHand.toFixed(2)}; deposit required`
      : `Cash has been held for at least ${rider.assignedStore.cashHoldMaxHours} hours`;
    const updated = await tx.riderProfile.update({
      where: { id: rider.id },
      data: { isCashLocked: true, cashLockReason: reason },
      include: riderWithStore,
    });
    await tx.auditLog.create({
      data: {
        userId: actor?.id ?? null,
        userRole: actor ? (actor.role as Role) : Role.SYSTEM,
        action: 'RIDER_CASH_LOCK',
        entityType: 'RiderProfile',
        entityId: rider.id,
        newValues: {
          cashInHand: rider.cashInHand.toFixed(2),
          reason,
        },
      },
    });
    return updated;
  }

  private async assertDepositAccess(
    deposit: { riderId: string; storeId: string },
    user: UserPayload,
    client: PrismaService | Prisma.TransactionClient = this.prisma,
  ) {
    if (user.role === Role.SUPER_ADMIN) return;
    if (user.role === Role.RIDER) {
      const riderId = await this.riderIdForUser(client, user.id);
      if (riderId === deposit.riderId) return;
      throw new NotFoundException('Deposit not found');
    }
    if (user.role === Role.STORE_ADMIN) {
      const storeId = await this.storeForAdmin(user.id, client);
      if (storeId === deposit.storeId) return;
      throw new ForbiddenException('Store admins can only access deposits for their assigned store');
    }
    throw new ForbiddenException('Deposit access is not allowed');
  }

  private async assertStoreReconciliationAccess(storeId: string, user: UserPayload) {
    if (user.role === Role.SUPER_ADMIN) {
      const store = await this.prisma.store.findUnique({
        where: { id: storeId },
        select: { id: true },
      });
      if (!store) throw new NotFoundException('Store not found');
      return;
    }
    if (user.role !== Role.STORE_ADMIN) {
      throw new ForbiddenException('Store reconciliation access is not allowed');
    }
    const assignedStoreId = await this.storeForAdmin(user.id);
    if (assignedStoreId !== storeId) {
      throw new ForbiddenException('Store admins can only reconcile their assigned store');
    }
  }

  private async storeForAdmin(
    userId: string,
    client: PrismaService | Prisma.TransactionClient = this.prisma,
  ) {
    const assignment = await client.storeAdmin.findUnique({
      where: { userId },
      select: { storeId: true },
    });
    if (!assignment) throw new ForbiddenException('No store is assigned to this admin');
    return assignment.storeId;
  }

  private async riderIdForUser(client: PrismaService | Prisma.TransactionClient, userId: string) {
    const rider = await client.riderProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!rider) throw new NotFoundException('Rider profile not found');
    return rider.id;
  }

  private async lockRider(tx: Prisma.TransactionClient, riderId: string) {
    const rows = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "RiderProfile" WHERE "id" = ${riderId}::uuid FOR UPDATE
    `;
    if (!rows[0]) throw new NotFoundException('Rider profile not found');
  }

  private async findPublicDeposit(id: string) {
    const deposit = await this.prisma.riderDeposit.findUnique({
      where: { id },
      select: depositSelect,
    });
    if (!deposit) throw new NotFoundException('Deposit not found');
    return deposit;
  }

  private async audit(
    tx: Prisma.TransactionClient,
    user: UserPayload,
    entityId: string,
    action: string,
    values: Prisma.InputJsonObject,
  ) {
    await tx.auditLog.create({
      data: {
        userId: user.id,
        userRole: user.role as Role,
        action,
        entityType: action.includes('VARIANCE')
          ? 'RiderDepositVarianceCase'
          : action.startsWith('RIDER_CASH')
            ? 'RiderProfile'
            : 'RiderDeposit',
        entityId,
        newValues: values,
      },
    });
  }

  private assertDepositObjectKey(key: string, riderId: string) {
    if (!key.startsWith(`rider-deposits/${riderId}/`)) {
      throw new ForbiddenException('Deposit slip object key is not owned by this rider');
    }
  }

  private sriLankaDayRange(date: string) {
    const parsed = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (!parsed) throw new BadRequestException('Date must use YYYY-MM-DD format');
    const year = Number(parsed[1]);
    const month = Number(parsed[2]);
    const day = Number(parsed[3]);
    const calendarDate = new Date(Date.UTC(year, month - 1, day));
    if (
      calendarDate.getUTCFullYear() !== year ||
      calendarDate.getUTCMonth() !== month - 1 ||
      calendarDate.getUTCDate() !== day
    ) {
      throw new BadRequestException('Reconciliation date is invalid');
    }
    const start = new Date(`${date}T00:00:00.000+05:30`);
    return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
  }

  private extensionForType(contentType: string) {
    if (contentType === 'image/jpeg') return 'jpg';
    if (contentType === 'image/png') return 'png';
    if (contentType === 'application/pdf') return 'pdf';
    throw new BadRequestException('Unsupported deposit slip content type');
  }

  private typeForExtension(key: string) {
    const extension = key.slice(key.lastIndexOf('.') + 1).toLowerCase();
    if (extension === 'jpg') return 'image/jpeg';
    if (extension === 'png') return 'image/png';
    if (extension === 'pdf') return 'application/pdf';
    throw new BadRequestException('Unsupported deposit slip file extension');
  }
}
