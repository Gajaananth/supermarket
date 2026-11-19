import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LocationType, Prisma, Role, StockMovementType } from '@prisma/client';
import { UserPayload } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdjustStockDto,
  StoreCatalogQueryDto,
  UpdateReorderLevelDto,
  UpdateStoreCatalogDto,
} from './dto/inventory.dto';
import { LockedStockRow, StockLedgerService } from './stock-ledger.service';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: StockLedgerService,
  ) {}

  async listWarehouseStock() {
    const warehouse = await this.prisma.warehouse.findUnique({ where: { code: 'WH-MAIN' } });
    if (!warehouse) throw new NotFoundException('Main warehouse is not configured');
    return this.prisma.masterInventory.findMany({
      where: { warehouseId: warehouse.id },
      include: { masterProduct: { include: { category: true, barcodes: true } } },
      orderBy: { masterProduct: { name: 'asc' } },
    });
  }

  async listWarehouseLowStock() {
    const warehouse = await this.prisma.warehouse.findUnique({ where: { code: 'WH-MAIN' } });
    if (!warehouse) throw new NotFoundException('Main warehouse is not configured');
    return this.prisma.masterInventory.findMany({
      where: {
        warehouseId: warehouse.id,
        quantityOnHand: { lte: this.prisma.masterInventory.fields.reorderLevel },
      },
      include: { masterProduct: true },
      orderBy: { quantityOnHand: 'asc' },
    });
  }

  async adjustWarehouseStock(
    productId: string,
    dto: AdjustStockDto,
    user: UserPayload,
  ) {
    if (!Number.isInteger(dto.quantityDelta) || dto.quantityDelta === 0) {
      throw new BadRequestException('quantityDelta must be a non-zero integer');
    }
    if (!dto.reason.trim()) throw new BadRequestException('A stock adjustment reason is required');

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.masterProduct.findUnique({ where: { id: productId } });
      if (!product || !product.isActive) throw new NotFoundException('Product not found');
      const warehouse = await this.ledger.mainWarehouse(tx);
      const stock = await this.ledger.lockWarehouseStock(tx, warehouse.id, productId);
      const next = stock.quantityOnHand + dto.quantityDelta;
      if (next < stock.quantityReserved) {
        throw new ConflictException('Adjustment would reduce warehouse stock below reserved quantity');
      }

      const updated = await tx.masterInventory.update({
        where: { id: stock.id },
        data: { quantityOnHand: next },
      });
      await this.ledger.recordMovement(tx, {
        type: dto.quantityDelta > 0
          ? StockMovementType.MASTER_ENTRY
          : StockMovementType.MANUAL_ADJUSTMENT,
        productId,
        quantity: Math.abs(dto.quantityDelta),
        fromType: dto.quantityDelta > 0 ? LocationType.SUPPLIER : LocationType.WAREHOUSE,
        fromId: dto.quantityDelta > 0 ? undefined : warehouse.id,
        toType: dto.quantityDelta > 0 ? LocationType.WAREHOUSE : LocationType.WRITE_OFF,
        toId: dto.quantityDelta > 0 ? warehouse.id : undefined,
        unitCost: product.costPrice,
        unitPrice: product.baseSellingPrice,
        reason: dto.reason.trim(),
        userId: user.id,
      });
      await this.ledger.audit(tx, {
        userId: user.id,
        role: user.role as Role,
        action: 'WAREHOUSE_STOCK_ADJUST',
        entityType: 'MasterInventory',
        entityId: updated.id,
        values: { productId, quantityDelta: dto.quantityDelta, quantityOnHand: next },
      });
      return updated;
    });
  }

  async setWarehouseReorderLevel(
    productId: string,
    dto: UpdateReorderLevelDto,
    user: UserPayload,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.masterProduct.findUnique({
        where: { id: productId },
        select: { isActive: true },
      });
      if (!product || !product.isActive) throw new NotFoundException('Product not found');
      const warehouse = await this.ledger.mainWarehouse(tx);
      const stock = await this.ledger.lockWarehouseStock(tx, warehouse.id, productId);
      const updated = await tx.masterInventory.update({
        where: { id: stock.id },
        data: { reorderLevel: dto.reorderLevel },
      });
      await this.ledger.audit(tx, {
        userId: user.id,
        role: user.role as Role,
        action: 'WAREHOUSE_REORDER_LEVEL_UPDATE',
        entityType: 'MasterInventory',
        entityId: updated.id,
        values: { productId, reorderLevel: dto.reorderLevel },
      });
      return updated;
    });
  }

  async listStoreCatalog(storeId: string, query: StoreCatalogQueryDto) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { isActive: true },
    });
    if (!store || !store.isActive) throw new NotFoundException('Store not found');
    const search = query.query?.trim();
    return this.prisma.storeProduct.findMany({
      where: {
        storeId,
        isAvailable: true,
        masterProduct: {
          isActive: true,
          ...(search
            ? {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { barcode: { equals: search, mode: 'insensitive' } },
                  { barcodes: { some: { barcode: { equals: search, mode: 'insensitive' } } } },
                ],
              }
            : {}),
        },
      },
      select: {
        id: true,
        masterProductId: true,
        customPrice: true,
        isAvailable: true,
        masterProduct: {
          select: {
            id: true,
            barcode: true,
            sku: true,
            name: true,
            nameTa: true,
            description: true,
            unit: true,
            baseSellingPrice: true,
            imageUrl: true,
            category: {
              select: {
                id: true,
                name: true,
                nameTa: true,
                slug: true,
                icon: true,
                imageUrl: true,
              },
            },
            barcodes: { select: { barcode: true } },
          },
        },
      },
      orderBy: { masterProduct: { name: 'asc' } },
    });
  }

  async listStoreStock(storeId: string, user: UserPayload) {
    await this.assertStoreAccess(storeId, user);
    return this.prisma.storeProduct.findMany({
      where: { storeId },
      include: { masterProduct: { include: { category: true, barcodes: true } } },
      orderBy: { masterProduct: { name: 'asc' } },
    });
  }

  async upsertStoreCatalog(
    storeId: string,
    productId: string,
    dto: UpdateStoreCatalogDto,
    user: UserPayload,
  ) {
    await this.assertStoreAccess(storeId, user);
    return this.prisma.$transaction(async (tx) => {
      const [store, product] = await Promise.all([
        tx.store.findUnique({ where: { id: storeId } }),
        tx.masterProduct.findUnique({ where: { id: productId } }),
      ]);
      if (!store) throw new NotFoundException('Store not found');
      if (!product || !product.isActive) throw new NotFoundException('Product not found');
      if (
        dto.customPrice !== undefined &&
        dto.customPrice !== null &&
        !store.allowPriceOverride
      ) {
        throw new ForbiddenException('This store does not allow price overrides');
      }

      const stock = await this.ledger.lockStoreStock(tx, storeId, productId);
      const updated = await tx.storeProduct.update({
        where: { id: stock.id },
        data: {
          ...(dto.customPrice !== undefined ? { customPrice: dto.customPrice } : {}),
          ...(dto.isAvailable !== undefined ? { isAvailable: dto.isAvailable } : {}),
          ...(dto.reorderLevel !== undefined ? { reorderLevel: dto.reorderLevel } : {}),
        },
        include: { masterProduct: true },
      });
      await this.ledger.refreshStoreLowStockAlert(tx, {
        storeId,
        productId,
        quantityOnHand: updated.quantityOnHand,
        reorderLevel: updated.reorderLevel,
        isAvailable: updated.isAvailable,
      });
      await this.ledger.audit(tx, {
        userId: user.id,
        role: user.role as Role,
        action: 'STORE_CATALOG_UPDATE',
        entityType: 'StoreProduct',
        entityId: updated.id,
        values: { storeId, productId, changedFields: Object.keys(dto) },
      });
      return updated;
    });
  }

  async adjustStoreStock(
    storeId: string,
    productId: string,
    dto: AdjustStockDto,
    user: UserPayload,
  ) {
    await this.assertStoreAccess(storeId, user);
    if (!Number.isInteger(dto.quantityDelta) || dto.quantityDelta === 0) {
      throw new BadRequestException('quantityDelta must be a non-zero integer');
    }
    if (!dto.reason.trim()) throw new BadRequestException('A stock adjustment reason is required');

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.masterProduct.findUnique({ where: { id: productId } });
      if (!product || !product.isActive) throw new NotFoundException('Product not found');
      const stock = await this.ledger.lockStoreStock(tx, storeId, productId);
      const next = stock.quantityOnHand + dto.quantityDelta;
      if (next < stock.quantityReserved) {
        throw new ConflictException('Adjustment would reduce store stock below reserved quantity');
      }
      const updated = await tx.storeProduct.update({
        where: { id: stock.id },
        data: { quantityOnHand: next },
      });
      await this.ledger.recordMovement(tx, {
        type: StockMovementType.MANUAL_ADJUSTMENT,
        productId,
        quantity: Math.abs(dto.quantityDelta),
        fromType: dto.quantityDelta > 0 ? LocationType.SUPPLIER : LocationType.STORE,
        fromId: dto.quantityDelta > 0 ? undefined : storeId,
        toType: dto.quantityDelta > 0 ? LocationType.STORE : LocationType.WRITE_OFF,
        toId: dto.quantityDelta > 0 ? storeId : undefined,
        unitCost: product.costPrice,
        unitPrice: product.baseSellingPrice,
        reason: dto.reason.trim(),
        userId: user.id,
      });
      await this.ledger.refreshStoreLowStockAlert(tx, {
        storeId,
        productId,
        quantityOnHand: updated.quantityOnHand,
        reorderLevel: updated.reorderLevel,
        isAvailable: updated.isAvailable,
      });
      await this.ledger.audit(tx, {
        userId: user.id,
        role: user.role as Role,
        action: 'STORE_STOCK_ADJUST',
        entityType: 'StoreProduct',
        entityId: updated.id,
        values: { storeId, productId, quantityDelta: dto.quantityDelta, quantityOnHand: next },
      });
      return updated;
    });
  }

  async listStoreAlerts(storeId: string, user: UserPayload) {
    await this.assertStoreAccess(storeId, user);
    return this.prisma.storeAlert.findMany({
      where: { storeId, isAcknowledged: false },
      include: { masterProduct: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async acknowledgeStoreAlert(
    storeId: string,
    alertId: string,
    user: UserPayload,
  ) {
    await this.assertStoreAccess(storeId, user);
    const result = await this.prisma.storeAlert.updateMany({
      where: { id: alertId, storeId, isAcknowledged: false },
      data: { isAcknowledged: true, acknowledgedAt: new Date() },
    });
    if (result.count !== 1) throw new NotFoundException('Unacknowledged store alert not found');
    return this.prisma.storeAlert.findUnique({ where: { id: alertId } });
  }

  async assertStoreAccess(storeId: string, user: UserPayload) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { isActive: true },
    });
    if (!store || !store.isActive) throw new NotFoundException('Store not found');
    if (user.role === Role.SUPER_ADMIN) return storeId;
    if (user.role !== Role.STORE_ADMIN) {
      throw new ForbiddenException('Store administration role required');
    }
    const assignment = await this.prisma.storeAdmin.findUnique({
      where: { userId: user.id },
      select: { storeId: true },
    });
    if (!assignment) throw new ForbiddenException('No store is assigned to this admin');
    if (assignment.storeId !== storeId) {
      throw new ForbiddenException('Store admins can only access their assigned store');
    }
    return assignment.storeId;
  }

  async lockStockForTransfer(
    tx: Prisma.TransactionClient,
    storeId: string,
    productId: string,
  ): Promise<LockedStockRow> {
    return this.ledger.lockStoreStock(tx, storeId, productId);
  }

  async updateStoreStock(
    tx: Prisma.TransactionClient,
    rowId: string,
    quantityOnHand: number,
  ) {
    return tx.storeProduct.update({
      where: { id: rowId },
      data: { quantityOnHand },
    });
  }

  async refreshLowStock(
    tx: Prisma.TransactionClient,
    input: Parameters<StockLedgerService['refreshStoreLowStockAlert']>[1],
  ) {
    return this.ledger.refreshStoreLowStockAlert(tx, input);
  }

  recordMovement(
    tx: Prisma.TransactionClient,
    input: Parameters<StockLedgerService['recordMovement']>[1],
  ) {
    return this.ledger.recordMovement(tx, input);
  }

  auditStockChange(
    tx: Prisma.TransactionClient,
    input: Parameters<StockLedgerService['audit']>[1],
  ) {
    return this.ledger.audit(tx, input);
  }
}
