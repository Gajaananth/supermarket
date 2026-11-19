import { BadRequestException, Injectable } from '@nestjs/common';
import { DeliveryZone, Prisma, Store } from '@prisma/client';
import { calculateDistanceKm, isPointInPolygon } from '../../common/geo';
import { AppliedCampaign, CampaignsService } from '../campaigns/campaigns.service';

@Injectable()
export class DeliveryZoneService {
  constructor(private readonly campaigns: CampaignsService) {}

  async resolve(
    tx: Prisma.TransactionClient,
    store: Store,
    address: { latitude: Prisma.Decimal; longitude: Prisma.Decimal },
    requestedZoneId: string | undefined,
    subtotal: Prisma.Decimal,
    campaignCodes: string[] = [],
  ): Promise<{
    zone: DeliveryZone;
    fee: Prisma.Decimal;
    discount: Prisma.Decimal;
    campaigns: AppliedCampaign[];
  }> {
    const latitude = Number(address.latitude);
    const longitude = Number(address.longitude);
    const distance = calculateDistanceKm(
      Number(store.latitude),
      Number(store.longitude),
      latitude,
      longitude,
    );

    if (distance > Number(store.serviceRadiusKm)) {
      throw new BadRequestException('Delivery address is outside the store service area');
    }
    if (
      store.serviceAreaPolygon &&
      !isPointInPolygon(latitude, longitude, store.serviceAreaPolygon)
    ) {
      throw new BadRequestException('Delivery address is outside the store service area');
    }

    const zones = await tx.deliveryZone.findMany({
      where: { storeId: store.id, isActive: true },
      orderBy: { zoneNumber: 'asc' },
    });
    const zone = zones.find((candidate) => {
      if (candidate.polygonCoordinates) {
        return isPointInPolygon(latitude, longitude, candidate.polygonCoordinates);
      }
      return candidate.radiusKm !== null && distance <= Number(candidate.radiusKm);
    });
    if (!zone) {
      throw new BadRequestException('Delivery address does not match an active delivery zone');
    }
    if (requestedZoneId && requestedZoneId !== zone.id) {
      throw new BadRequestException('Selected delivery zone does not match the delivery address');
    }

    const freeDeliveryThreshold = store.freeDeliveryThreshold.greaterThan(
      zone.minOrderForFreeDelivery,
    )
      ? store.freeDeliveryThreshold
      : zone.minOrderForFreeDelivery;
    const baseFee = subtotal.greaterThanOrEqualTo(freeDeliveryThreshold)
      ? new Prisma.Decimal(0)
      : zone.baseFee;
    const applied = await this.campaigns.applyToOrder(
      tx,
      store.id,
      subtotal,
      baseFee,
      campaignCodes,
    );
    return {
      zone,
      fee: applied.deliveryFee,
      discount: applied.discount,
      campaigns: applied.applied,
    };
  }
}
