import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { calculateDistanceKm, isPointInPolygon } from '../../common/geo';
import { UserPayload } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import {
  UpdateDeliveryZonePricingDto,
  UpdateStoreSettingsDto,
  UpdateStoreStatusDto,
} from './dto/store-settings.dto';

const storeTimeZone = 'Asia/Colombo';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.store.findMany({
      where: { isActive: true },
      include: {
        deliveryZones: {
          where: { isActive: true },
          orderBy: { zoneNumber: 'asc' },
        },
      },
      orderBy: { code: 'asc' },
    });
  }

  async findAllForAdmin() {
    return this.prisma.store.findMany({
      include: {
        deliveryZones: { orderBy: { zoneNumber: 'asc' } },
      },
      orderBy: { code: 'asc' },
    });
  }

  async updateStatus(
    storeId: string,
    dto: UpdateStoreStatusDto,
    user: UserPayload,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const previous = await tx.store.findUniqueOrThrow({
        where: { id: storeId },
        select: { isActive: true },
      });
      const updated = await tx.store.update({
        where: { id: storeId },
        data: { isActive: dto.isActive },
        select: { id: true, code: true, name: true, isActive: true },
      });
      await tx.auditLog.create({
        data: {
          userId: user.id,
          userRole: user.role as Role,
          action: 'STORE_STATUS_UPDATE',
          entityType: 'Store',
          entityId: storeId,
          oldValues: { isActive: previous.isActive },
          newValues: { isActive: updated.isActive },
        },
      });
      return updated;
    });
  }

  async findOne(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        deliveryZones: {
          where: { isActive: true },
          orderBy: { zoneNumber: 'asc' },
        },
      },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    return store;
  }

  async getSettings(storeId: string, user: UserPayload) {
    await this.assertSettingsAccess(storeId, user);
    return this.prisma.store.findUniqueOrThrow({
      where: { id: storeId },
      select: {
        id: true,
        code: true,
        name: true,
        openingTime: true,
        closingTime: true,
        serviceRadiusKm: true,
        minOrderAmount: true,
        freeDeliveryThreshold: true,
        cashHoldThreshold: true,
        cashHoldMaxHours: true,
        deliveryZones: {
          orderBy: { zoneNumber: 'asc' },
          select: {
            id: true,
            zoneNumber: true,
            name: true,
            baseFee: true,
            minOrderForFreeDelivery: true,
            estimatedDeliveryMins: true,
            isActive: true,
          },
        },
      },
    });
  }

  async updateSettings(
    storeId: string,
    dto: UpdateStoreSettingsDto,
    user: UserPayload,
  ) {
    await this.assertSettingsAccess(storeId, user);
    const data: Prisma.StoreUpdateInput = {};
    if (dto.minOrderAmount !== undefined) data.minOrderAmount = dto.minOrderAmount;
    if (dto.freeDeliveryThreshold !== undefined) {
      data.freeDeliveryThreshold = dto.freeDeliveryThreshold;
    }
    if (dto.cashHoldThreshold !== undefined) data.cashHoldThreshold = dto.cashHoldThreshold;
    if (dto.cashHoldMaxHours !== undefined) data.cashHoldMaxHours = dto.cashHoldMaxHours;
    if (dto.openingTime !== undefined) data.openingTime = dto.openingTime;
    if (dto.closingTime !== undefined) data.closingTime = dto.closingTime;
    if (dto.serviceRadiusKm !== undefined) data.serviceRadiusKm = dto.serviceRadiusKm;
    if (Object.keys(data).length === 0) {
      throw new BadRequestException('At least one store setting must be provided');
    }
    const newValues: Record<string, Prisma.InputJsonValue> = {};
    if (dto.minOrderAmount !== undefined) newValues.minOrderAmount = dto.minOrderAmount;
    if (dto.freeDeliveryThreshold !== undefined) {
      newValues.freeDeliveryThreshold = dto.freeDeliveryThreshold;
    }
    if (dto.cashHoldThreshold !== undefined) {
      newValues.cashHoldThreshold = dto.cashHoldThreshold;
    }
    if (dto.cashHoldMaxHours !== undefined) {
      newValues.cashHoldMaxHours = dto.cashHoldMaxHours;
    }
    if (dto.openingTime !== undefined) newValues.openingTime = dto.openingTime;
    if (dto.closingTime !== undefined) newValues.closingTime = dto.closingTime;
    if (dto.serviceRadiusKm !== undefined) newValues.serviceRadiusKm = dto.serviceRadiusKm;
    return this.prisma.$transaction(async (tx) => {
      const previous = await tx.store.findUniqueOrThrow({
        where: { id: storeId },
        select: {
          openingTime: true,
          closingTime: true,
          serviceRadiusKm: true,
          minOrderAmount: true,
          freeDeliveryThreshold: true,
          cashHoldThreshold: true,
          cashHoldMaxHours: true,
        },
      });
      const openingTime = dto.openingTime ?? previous.openingTime;
      const closingTime = dto.closingTime ?? previous.closingTime;
      if (openingTime >= closingTime) {
        throw new BadRequestException('Store opening time must be before its closing time');
      }
      const updated = await tx.store.update({
        where: { id: storeId },
        data,
        select: {
          id: true,
          code: true,
          openingTime: true,
          closingTime: true,
          serviceRadiusKm: true,
          minOrderAmount: true,
          freeDeliveryThreshold: true,
          cashHoldThreshold: true,
          cashHoldMaxHours: true,
        },
      });
      await tx.auditLog.create({
        data: {
          userId: user.id,
          userRole: user.role as Role,
          action: 'STORE_SETTINGS_UPDATE',
          entityType: 'Store',
          entityId: storeId,
          oldValues: {
            ...previous,
            serviceRadiusKm: previous.serviceRadiusKm.toFixed(2),
            minOrderAmount: previous.minOrderAmount.toFixed(2),
            freeDeliveryThreshold: previous.freeDeliveryThreshold.toFixed(2),
            cashHoldThreshold: previous.cashHoldThreshold.toFixed(2),
          },
          newValues,
        },
      });
      return updated;
    });
  }

  async updateZonePricing(
    storeId: string,
    zoneId: string,
    dto: UpdateDeliveryZonePricingDto,
    user: UserPayload,
  ) {
    await this.assertSettingsAccess(storeId, user);
    const zone = await this.prisma.deliveryZone.findUnique({
      where: { id: zoneId },
      select: { id: true, storeId: true },
    });
    if (!zone || zone.storeId !== storeId) {
      throw new NotFoundException('Delivery zone not found');
    }
    const data: Prisma.DeliveryZoneUpdateInput = {};
    if (dto.baseFee !== undefined) data.baseFee = dto.baseFee;
    if (dto.minOrderForFreeDelivery !== undefined) {
      data.minOrderForFreeDelivery = dto.minOrderForFreeDelivery;
    }
    if (dto.estimatedDeliveryMins !== undefined) {
      data.estimatedDeliveryMins = dto.estimatedDeliveryMins;
    }
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (Object.keys(data).length === 0) {
      throw new BadRequestException('At least one delivery-zone setting must be provided');
    }
    const newValues: Record<string, Prisma.InputJsonValue> = {};
    if (dto.baseFee !== undefined) newValues.baseFee = dto.baseFee;
    if (dto.minOrderForFreeDelivery !== undefined) {
      newValues.minOrderForFreeDelivery = dto.minOrderForFreeDelivery;
    }
    if (dto.estimatedDeliveryMins !== undefined) {
      newValues.estimatedDeliveryMins = dto.estimatedDeliveryMins;
    }
    if (dto.isActive !== undefined) newValues.isActive = dto.isActive;
    return this.prisma.$transaction(async (tx) => {
      const previous = await tx.deliveryZone.findUniqueOrThrow({
        where: { id: zoneId },
        select: {
          baseFee: true,
          minOrderForFreeDelivery: true,
          estimatedDeliveryMins: true,
          isActive: true,
        },
      });
      const updated = await tx.deliveryZone.update({
        where: { id: zoneId },
        data,
        select: {
          id: true,
          storeId: true,
          baseFee: true,
          minOrderForFreeDelivery: true,
          estimatedDeliveryMins: true,
          isActive: true,
        },
      });
      await tx.auditLog.create({
        data: {
          userId: user.id,
          userRole: user.role as Role,
          action: 'DELIVERY_ZONE_PRICING_UPDATE',
          entityType: 'DeliveryZone',
          entityId: zoneId,
          oldValues: {
            baseFee: previous.baseFee.toFixed(2),
            minOrderForFreeDelivery: previous.minOrderForFreeDelivery.toFixed(2),
            estimatedDeliveryMins: previous.estimatedDeliveryMins,
            isActive: previous.isActive,
          },
          newValues,
        },
      });
      return updated;
    });
  }

  async findNearest(lat: number, lng: number) {
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      throw new NotFoundException('No BuyMe stores currently deliver to this location');
    }

    const stores = await this.findAll();
    const timeParts = new Intl.DateTimeFormat('en-GB', {
      timeZone: storeTimeZone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date());
    const currentTime = Number(
      `${timeParts.find((part) => part.type === 'hour')?.value ?? '0'}${
        timeParts.find((part) => part.type === 'minute')?.value ?? '0'
      }`,
    );
    const candidates: Array<{
      store: (typeof stores)[number];
      distanceKm: number;
    }> = [];

    for (const store of stores) {
      if (!isOpenAt(store.openingTime, store.closingTime, currentTime)) continue;
      const storeLat = Number(store.latitude);
      const storeLng = Number(store.longitude);
      if (
        !Number.isFinite(storeLat) ||
        !Number.isFinite(storeLng) ||
        storeLat < -90 ||
        storeLat > 90 ||
        storeLng < -180 ||
        storeLng > 180
      ) continue;
      const distanceKm = calculateDistanceKm(lat, lng, storeLat, storeLng);
      if (distanceKm > Number(store.serviceRadiusKm)) continue;
      if (
        store.serviceAreaPolygon &&
        !isPointInPolygon(lat, lng, store.serviceAreaPolygon)
      ) continue;
      candidates.push({ store, distanceKm });
    }

    if (candidates.length === 0) {
      throw new NotFoundException('No open BuyMe stores currently deliver to this location');
    }

    candidates.sort(
      (a, b) =>
        a.distanceKm - b.distanceKm ||
        compareStable(a.store.code, b.store.code) ||
        compareStable(a.store.id, b.store.id),
    );
    const nearest = candidates[0];
    return { ...nearest, distanceKm: Math.round(nearest.distanceKm * 100) / 100 };
  }

  private async assertSettingsAccess(storeId: string, user: UserPayload) {
    if (user.role === Role.SUPER_ADMIN) {
      const store = await this.prisma.store.findUnique({
        where: { id: storeId },
        select: { id: true },
      });
      if (!store) throw new NotFoundException('Store not found');
      return;
    }
    if (user.role !== Role.STORE_ADMIN) {
      throw new ForbiddenException('Store settings access is not allowed');
    }
    const assignment = await this.prisma.storeAdmin.findUnique({
      where: { userId: user.id },
      select: { storeId: true },
    });
    if (!assignment) throw new ForbiddenException('No store is assigned to this admin');
    if (assignment.storeId !== storeId) {
      throw new ForbiddenException('Store admins can only change settings for their assigned store');
    }
  }
}

function isOpenAt(openingTime: string, closingTime: string, currentTime: number) {
  const opening = parseStoreTime(openingTime);
  const closing = parseStoreTime(closingTime);
  if (opening < 0 || closing < 0) return false;
  if (opening === closing) return true;
  if (opening < closing) return currentTime >= opening && currentTime < closing;
  return currentTime >= opening || currentTime < closing;
}

function parseStoreTime(value: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) return -1;
  return Number(match[1]) * 100 + Number(match[2]);
}

function compareStable(first: string, second: string) {
  return first < second ? -1 : first > second ? 1 : 0;
}
