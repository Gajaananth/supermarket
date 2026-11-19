import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Campaign, CampaignType, Prisma, Role } from '@prisma/client';
import { UserPayload } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import {
  CampaignListQueryDto,
  CreateCampaignDto,
  UpdateCampaignDto,
} from './dto/campaign.dto';

export type AppliedCampaign = {
  campaignId: string;
  campaignName: string;
  campaignCode: string | null;
  discountAmount: Prisma.Decimal;
  deliveryFeeWaived: boolean;
};

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: CampaignListQueryDto) {
    return this.prisma.campaign.findMany({
      where: {
        ...(query.storeId ? { OR: [{ storeId: query.storeId }, { storeId: null }] } : {}),
        ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      },
      orderBy: [{ startsAt: 'desc' }, { name: 'asc' }],
      take: query.limit ?? 50,
    });
  }

  async create(dto: CreateCampaignDto, user: UserPayload) {
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);
    this.validateCampaign(dto.type, new Prisma.Decimal(dto.value), dto.maxDiscount);
    if (endsAt <= startsAt) {
      throw new BadRequestException('Campaign end time must be after its start time');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const campaign = await tx.campaign.create({
          data: {
            name: dto.name.trim(),
            code: dto.code,
            storeId: dto.storeId,
            type: dto.type,
            value: dto.value,
            minSubtotal: dto.minSubtotal ?? 0,
            maxDiscount: dto.maxDiscount,
            startsAt,
            endsAt,
          },
        });
        await tx.auditLog.create({
          data: {
            userId: user.id,
            userRole: user.role as Role,
            action: 'CAMPAIGN_CREATE',
            entityType: 'Campaign',
            entityId: campaign.id,
            newValues: {
              name: campaign.name,
              code: campaign.code,
              storeId: campaign.storeId,
              type: campaign.type,
              value: campaign.value.toFixed(2),
              startsAt: campaign.startsAt.toISOString(),
              endsAt: campaign.endsAt.toISOString(),
            },
          },
        });
        return campaign;
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('Campaign code is already in use');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateCampaignDto, user: UserPayload) {
    const data: Prisma.CampaignUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.value !== undefined) data.value = dto.value;
    if (dto.minSubtotal !== undefined) data.minSubtotal = dto.minSubtotal;
    if (dto.maxDiscount !== undefined) data.maxDiscount = dto.maxDiscount;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (Object.keys(data).length === 0) {
      throw new BadRequestException('At least one campaign setting must be provided');
    }
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.campaign.findUnique({ where: { id } });
      if (!current) throw new NotFoundException('Campaign not found');
      const startsAt = dto.startsAt ? new Date(dto.startsAt) : current.startsAt;
      const endsAt = dto.endsAt ? new Date(dto.endsAt) : current.endsAt;
      if (endsAt <= startsAt) {
        throw new BadRequestException('Campaign end time must be after its start time');
      }
      if (dto.startsAt !== undefined) data.startsAt = startsAt;
      if (dto.endsAt !== undefined) data.endsAt = endsAt;
      this.validateCampaign(
        current.type,
        new Prisma.Decimal(dto.value ?? current.value),
        dto.maxDiscount === undefined ? current.maxDiscount : dto.maxDiscount,
      );
      const updated = await tx.campaign.update({ where: { id }, data });
      await tx.auditLog.create({
        data: {
          userId: user.id,
          userRole: user.role as Role,
          action: 'CAMPAIGN_UPDATE',
          entityType: 'Campaign',
          entityId: id,
          oldValues: {
            name: current.name,
            value: current.value.toFixed(2),
            minSubtotal: current.minSubtotal.toFixed(2),
            isActive: current.isActive,
          },
          newValues: {
            ...(dto.name === undefined ? {} : { name: dto.name.trim() }),
            ...(dto.value === undefined ? {} : { value: dto.value }),
            ...(dto.minSubtotal === undefined ? {} : { minSubtotal: dto.minSubtotal }),
            ...(dto.maxDiscount === undefined ? {} : { maxDiscount: dto.maxDiscount }),
            ...(dto.startsAt === undefined ? {} : { startsAt: startsAt.toISOString() }),
            ...(dto.endsAt === undefined ? {} : { endsAt: endsAt.toISOString() }),
            ...(dto.isActive === undefined ? {} : { isActive: dto.isActive }),
          },
        },
      });
      return updated;
    });
  }

  async applyToOrder(
    tx: Prisma.TransactionClient,
    storeId: string,
    subtotal: Prisma.Decimal,
    initialDeliveryFee: Prisma.Decimal,
    requestedCodes: string[] = [],
  ) {
    const codes = requestedCodes.map((code) => code.trim().toUpperCase());
    if (
      codes.some((code) => !code) ||
      new Set(codes).size !== codes.length
    ) {
      throw new BadRequestException('Campaign codes must be non-empty and unique');
    }

    const now = new Date();
    const eligible = await tx.campaign.findMany({
      where: {
        isActive: true,
        startsAt: { lte: now },
        endsAt: { gt: now },
        minSubtotal: { lte: subtotal },
        AND: [
          { OR: [{ storeId }, { storeId: null }] },
          {
            OR: [
              { code: null },
              ...(codes.length > 0 ? [{ code: { in: codes } }] : []),
            ],
          },
        ],
      },
      orderBy: [{ startsAt: 'asc' }, { id: 'asc' }],
    });
    const eligibleCodes = new Set(
      eligible.flatMap((campaign) => campaign.code ? [campaign.code] : []),
    );
    const unavailableCode = codes.find((code) => !eligibleCodes.has(code));
    if (unavailableCode) {
      throw new ConflictException(
        `Campaign code ${unavailableCode} is invalid or not eligible for this order`,
      );
    }

    let deliveryFee = initialDeliveryFee;
    let discount = new Prisma.Decimal(0);
    const applied: AppliedCampaign[] = [];
    for (const campaign of eligible) {
      if (campaign.type === CampaignType.FREE_DELIVERY) {
        if (deliveryFee.isZero()) continue;
        deliveryFee = new Prisma.Decimal(0);
        applied.push(this.snapshot(campaign, new Prisma.Decimal(0), true));
        continue;
      }
      const remainingSubtotal = subtotal.minus(discount);
      if (!remainingSubtotal.greaterThan(0)) continue;
      const rawDiscount = this.discountFor(campaign, subtotal)
        .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
      const appliedDiscount = rawDiscount.lessThan(remainingSubtotal)
        ? rawDiscount
        : remainingSubtotal;
      if (!appliedDiscount.greaterThan(0)) continue;
      discount = discount.plus(appliedDiscount);
      applied.push(this.snapshot(campaign, appliedDiscount, false));
    }
    return { deliveryFee, discount, applied };
  }

  private discountFor(campaign: Campaign, subtotal: Prisma.Decimal) {
    const raw = campaign.type === CampaignType.FIXED_DISCOUNT
      ? campaign.value
      : subtotal.mul(campaign.value).div(100);
    return campaign.maxDiscount && raw.greaterThan(campaign.maxDiscount)
      ? campaign.maxDiscount
      : raw;
  }

  private snapshot(
    campaign: Campaign,
    discountAmount: Prisma.Decimal,
    deliveryFeeWaived: boolean,
  ): AppliedCampaign {
    return {
      campaignId: campaign.id,
      campaignName: campaign.name,
      campaignCode: campaign.code,
      discountAmount,
      deliveryFeeWaived,
    };
  }

  private validateCampaign(
    type: CampaignType,
    value: Prisma.Decimal,
    maxDiscount: number | Prisma.Decimal | null | undefined,
  ) {
    if (type === CampaignType.FREE_DELIVERY && !value.isZero()) {
      throw new BadRequestException('Free-delivery campaign value must be zero');
    }
    if (
      type === CampaignType.PERCENTAGE_DISCOUNT &&
      (!value.greaterThan(0) || value.greaterThan(100))
    ) {
      throw new BadRequestException('Percentage campaign value must be greater than 0 and at most 100');
    }
    if (
      type === CampaignType.FIXED_DISCOUNT &&
      !value.greaterThan(0)
    ) {
      throw new BadRequestException('Fixed-discount campaign value must be greater than zero');
    }
    if (
      maxDiscount !== undefined &&
      maxDiscount !== null &&
      type !== CampaignType.FREE_DELIVERY &&
      !new Prisma.Decimal(maxDiscount).greaterThan(0)
    ) {
      throw new BadRequestException('Maximum discount must be greater than zero');
    }
    if (maxDiscount !== undefined && maxDiscount !== null && type === CampaignType.FREE_DELIVERY) {
      throw new BadRequestException('Free-delivery campaigns cannot have a max discount');
    }
  }
}

function isUniqueConstraintError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}
