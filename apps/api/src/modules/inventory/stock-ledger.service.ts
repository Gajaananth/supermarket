import { Injectable, NotFoundException } from '@nestjs/common';
import { LocationType, Prisma, Role, StockMovementType } from '@prisma/client';

export interface LockedStockRow {
  id: string;
  quantityOnHand: number;
  quantityReserved: number;
  reorderLevel: number;
  isAvailable?: boolean;
}

@Injectable()
export class StockLedgerService {
  async mainWarehouse(tx: Prisma.TransactionClient) {
    const warehouse = await tx.warehouse.findUnique({ where: { code: 'WH-MAIN' } });
    if (!warehouse) throw new NotFoundException('Main warehouse is not configured');
    return warehouse;
  }

  async lockWarehouseStock(
    tx: Prisma.TransactionClient,
    warehouseId: string,
    productId: string,
  ): Promise<LockedStockRow> {
    await tx.$queryRaw`
      SELECT pg_advisory_xact_lock(hashtextextended(${`warehouse:${warehouseId}:${productId}`}, 0)) IS NULL
    `;
    const uniqueKey = { warehouseId_masterProductId: { warehouseId, masterProductId: productId } };
    await tx.masterInventory.upsert({
      where: uniqueKey,
      create: { warehouseId, masterProductId: productId },
      update: {},
    });
    const rows = await tx.$queryRaw<LockedStockRow[]>`
      SELECT "id", "quantityOnHand", "quantityReserved", "reorderLevel"
      FROM "MasterInventory"
      WHERE "warehouseId" = ${warehouseId}::uuid
        AND "masterProductId" = ${productId}::uuid
      FOR UPDATE
    `;
    if (!rows[0]) throw new NotFoundException('Warehouse stock record was not created');
    return rows[0];
  }

  async lockStoreStock(
    tx: Prisma.TransactionClient,
    storeId: string,
    productId: string,
  ): Promise<LockedStockRow> {
    await tx.$queryRaw`
      SELECT pg_advisory_xact_lock(hashtextextended(${`store:${storeId}:${productId}`}, 0)) IS NULL
    `;
    const uniqueKey = { storeId_masterProductId: { storeId, masterProductId: productId } };
    await tx.storeProduct.upsert({
      where: uniqueKey,
      create: { storeId, masterProductId: productId },
      update: {},
    });
    const rows = await tx.$queryRaw<LockedStockRow[]>`
      SELECT "id", "quantityOnHand", "quantityReserved", "reorderLevel", "isAvailable"
      FROM "StoreProduct"
      WHERE "storeId" = ${storeId}::uuid
        AND "masterProductId" = ${productId}::uuid
      FOR UPDATE
    `;
    if (!rows[0]) throw new NotFoundException('Store stock record was not created');
    return rows[0];
  }

  async recordMovement(
    tx: Prisma.TransactionClient,
    input: {
      type: StockMovementType;
      productId: string;
      quantity: number;
      fromType: LocationType;
      fromId?: string;
      toType: LocationType;
      toId?: string;
      unitCost: Prisma.Decimal | number;
      unitPrice?: Prisma.Decimal | number;
      referenceId?: string;
      reason?: string;
      userId?: string;
    },
  ) {
    return tx.stockMovement.create({
      data: {
        movementType: input.type,
        referenceId: input.referenceId,
        fromLocationType: input.fromType,
        fromLocationId: input.fromId,
        toLocationType: input.toType,
        toLocationId: input.toId,
        masterProductId: input.productId,
        quantity: input.quantity,
        unitCost: input.unitCost,
        unitPrice: input.unitPrice,
        reason: input.reason,
        createdByUserId: input.userId,
      },
    });
  }

  async refreshStoreLowStockAlert(
    tx: Prisma.TransactionClient,
    input: {
      storeId: string;
      productId: string;
      quantityOnHand: number;
      reorderLevel: number;
      isAvailable: boolean;
    },
  ) {
    const key = {
      storeId_masterProductId_alertType_isAcknowledged: {
        storeId: input.storeId,
        masterProductId: input.productId,
        alertType: 'LOW_STOCK',
        isAcknowledged: false,
      },
    };

    if (input.isAvailable && input.quantityOnHand <= input.reorderLevel) {
      return tx.storeAlert.upsert({
        where: key,
        create: {
          storeId: input.storeId,
          masterProductId: input.productId,
          alertType: 'LOW_STOCK',
          details: {
            quantityOnHand: input.quantityOnHand,
            reorderLevel: input.reorderLevel,
          },
        },
        update: {
          details: {
            quantityOnHand: input.quantityOnHand,
            reorderLevel: input.reorderLevel,
          },
          createdAt: new Date(),
        },
      });
    }

    await tx.storeAlert.updateMany({
      where: {
        storeId: input.storeId,
        masterProductId: input.productId,
        alertType: 'LOW_STOCK',
        isAcknowledged: false,
      },
      data: { isAcknowledged: true, acknowledgedAt: new Date() },
    });
  }

  audit(
    tx: Prisma.TransactionClient,
    input: {
      userId: string;
      role: Role;
      action: string;
      entityType: string;
      entityId: string;
      values: Prisma.InputJsonObject;
    },
  ) {
    return tx.auditLog.create({
      data: {
        userId: input.userId,
        userRole: input.role,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        newValues: input.values,
      },
    });
  }
}
