import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  LocationType,
  Prisma,
  Role,
  StockMovementType,
  TransferItemStatus,
  TransferStatus,
} from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { UserPayload } from '../../common/decorators/current-user.decorator';
import { InventoryService } from '../inventory/inventory.service';
import { StockLedgerService } from '../inventory/stock-ledger.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTransferDto,
  ReceiveTransferDto,
  ResolveTransferDto,
  TransferListQueryDto,
} from './dto/transfer.dto';

const transferInclude = {
  items: {
    include: { masterProduct: { include: { barcodes: true } } },
    orderBy: { masterProductId: 'asc' as const },
  },
  toStore: true,
  fromWarehouse: true,
};

@Injectable()
export class TransfersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventory: InventoryService,
    private readonly ledger: StockLedgerService,
  ) {}

  async list(query: TransferListQueryDto, user: UserPayload) {
    const where: Prisma.StockTransferWhereInput = {
      ...(query.status ? { status: query.status as TransferStatus } : {}),
    };
    if (user.role === Role.STORE_ADMIN) {
      const assignment = await this.prisma.storeAdmin.findUnique({
        where: { userId: user.id },
        select: { storeId: true },
      });
      if (!assignment) throw new ForbiddenException('No store is assigned to this admin');
      if (query.storeId && query.storeId !== assignment.storeId) {
        throw new ForbiddenException('Store admins can only access their assigned store');
      }
      where.toStoreId = assignment.storeId;
    } else if (query.storeId) {
      where.toStoreId = query.storeId;
    }

    return this.prisma.stockTransfer.findMany({
      where,
      include: transferInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: UserPayload) {
    const transfer = await this.prisma.stockTransfer.findUnique({
      where: { id },
      include: transferInclude,
    });
    if (!transfer) throw new NotFoundException('Stock transfer not found');
    await this.inventory.assertStoreAccess(transfer.toStoreId, user);
    return transfer;
  }

  async create(dto: CreateTransferDto, user: UserPayload) {
    await this.inventory.assertStoreAccess(dto.storeId, user);
    const number = `TRF-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;

    return this.prisma.$transaction(async (tx) => {
      const warehouse = await this.ledger.mainWarehouse(tx);
      const store = await tx.store.findUnique({ where: { id: dto.storeId } });
      if (!store || !store.isActive) throw new NotFoundException('Destination store not found');
      const productIds = dto.items.map((item) => item.productId);
      const products = await tx.masterProduct.findMany({
        where: { id: { in: productIds }, isActive: true },
      });
      if (products.length !== productIds.length) {
        throw new NotFoundException('One or more products do not exist or are inactive');
      }

      const transfer = await tx.stockTransfer.create({
        data: {
          transferNumber: number,
          fromWarehouseId: warehouse.id,
          toStoreId: store.id,
          items: {
            create: dto.items.map((item) => ({
              masterProductId: item.productId,
              requestedQuantity: item.requestedQuantity,
            })),
          },
        },
        include: transferInclude,
      });
      await this.audit(tx, user, 'STOCK_TRANSFER_CREATE', transfer.id, {
        transferNumber: number,
        storeId: store.id,
        itemCount: dto.items.length,
      });
      return transfer;
    });
  }

  async dispatch(id: string, user: UserPayload) {
    this.assertSuperAdmin(user);
    return this.prisma.$transaction(async (tx) => {
      const transfer = await this.lockTransfer(tx, id);
      if (transfer.status !== TransferStatus.DRAFT) {
        throw new ConflictException('Only draft transfers can be dispatched');
      }
      if (transfer.items.length === 0) throw new BadRequestException('Transfer has no items');

      const warehouse = await this.ledger.mainWarehouse(tx);
      for (const item of [...transfer.items].sort((a, b) =>
        a.masterProductId.localeCompare(b.masterProductId),
      )) {
        const stock = await this.ledger.lockWarehouseStock(
          tx,
          warehouse.id,
          item.masterProductId,
        );
        const available = stock.quantityOnHand - stock.quantityReserved;
        if (available < item.requestedQuantity) {
          throw new ConflictException(
            `Insufficient warehouse stock for product ${item.masterProductId}`,
          );
        }
        await tx.masterInventory.update({
          where: { id: stock.id },
          data: { quantityOnHand: stock.quantityOnHand - item.requestedQuantity },
        });
        await tx.stockTransferItem.update({
          where: { id: item.id },
          data: {
            dispatchedQuantity: item.requestedQuantity,
            discrepancyQuantity: 0,
          },
        });
        await this.ledger.recordMovement(tx, {
          type: StockMovementType.TRANSFER_DISPATCH,
          productId: item.masterProductId,
          quantity: item.requestedQuantity,
          fromType: LocationType.WAREHOUSE,
          fromId: warehouse.id,
          toType: LocationType.IN_TRANSIT,
          toId: transfer.id,
          unitCost: item.masterProduct.costPrice,
          unitPrice: item.masterProduct.baseSellingPrice,
          referenceId: transfer.id,
          userId: user.id,
        });
      }

      const dispatched = await tx.stockTransfer.update({
        where: { id },
        data: {
          status: TransferStatus.DISPATCHED,
          dispatchedByUserId: user.id,
          dispatchedAt: new Date(),
        },
        include: transferInclude,
      });
      await this.audit(tx, user, 'STOCK_TRANSFER_DISPATCH', id, {
        transferNumber: transfer.transferNumber,
      });
      return dispatched;
    });
  }

  async receive(id: string, dto: ReceiveTransferDto, user: UserPayload) {
    const existing = await this.prisma.stockTransfer.findUnique({
      where: { id },
      select: { toStoreId: true },
    });
    if (!existing) throw new NotFoundException('Stock transfer not found');
    await this.inventory.assertStoreAccess(existing.toStoreId, user);

    return this.prisma.$transaction(async (tx) => {
      const transfer = await this.lockTransfer(tx, id);
      if (transfer.toStoreId !== existing.toStoreId) {
        throw new ConflictException('Transfer destination changed; retry the receipt');
      }
      if (transfer.status !== TransferStatus.DISPATCHED) {
        throw new ConflictException('Only dispatched transfers can be received');
      }
      this.assertCompleteItemSet(
        transfer.items.map((item) => item.masterProductId),
        dto.items.map((item) => item.productId),
      );

      const receiptByProduct = new Map(dto.items.map((item) => [item.productId, item]));
      let hasDiscrepancy = false;
      for (const item of [...transfer.items].sort((a, b) =>
        a.masterProductId.localeCompare(b.masterProductId),
      )) {
        const receipt = receiptByProduct.get(item.masterProductId)!;
        if (receipt.receivedQuantity > item.dispatchedQuantity) {
          throw new BadRequestException('Received quantity cannot exceed dispatched quantity');
        }
        const stock = await this.inventory.lockStockForTransfer(
          tx,
          transfer.toStoreId,
          item.masterProductId,
        );
        const received = receipt.receivedQuantity;
        const discrepancy = item.dispatchedQuantity - received;
        hasDiscrepancy ||= discrepancy > 0;
        const updatedStock = await this.inventory.updateStoreStock(
          tx,
          stock.id,
          stock.quantityOnHand + received,
        );
        if (received > 0) {
          await this.inventory.recordMovement(tx, {
            type: StockMovementType.TRANSFER_RECEIPT,
            productId: item.masterProductId,
            quantity: received,
            fromType: LocationType.IN_TRANSIT,
            fromId: transfer.id,
            toType: LocationType.STORE,
            toId: transfer.toStoreId,
            unitCost: item.masterProduct.costPrice,
            unitPrice: item.masterProduct.baseSellingPrice,
            referenceId: transfer.id,
            reason: receipt.notes?.trim() || undefined,
            userId: user.id,
          });
        }
        await this.inventory.refreshLowStock(tx, {
          storeId: transfer.toStoreId,
          productId: item.masterProductId,
          quantityOnHand: updatedStock.quantityOnHand,
          reorderLevel: updatedStock.reorderLevel,
          isAvailable: updatedStock.isAvailable,
        });
        await tx.stockTransferItem.update({
          where: { id: item.id },
          data: {
            receivedQuantity: received,
            discrepancyQuantity: discrepancy,
            itemStatus: discrepancy === 0
              ? TransferItemStatus.MATCHED
              : TransferItemStatus.DISCREPANT,
            notes: receipt.notes?.trim() || null,
          },
        });
      }

      const receivedTransfer = await tx.stockTransfer.update({
        where: { id },
        data: {
          status: hasDiscrepancy
            ? TransferStatus.RECEIVED_PARTIAL
            : TransferStatus.RECEIVED_FULL,
          receivedByUserId: user.id,
          receivedAt: new Date(),
        },
        include: transferInclude,
      });
      await this.audit(tx, user, 'STOCK_TRANSFER_RECEIVE', id, {
        status: receivedTransfer.status,
        hasDiscrepancy,
      });
      return receivedTransfer;
    });
  }

  async resolve(id: string, dto: ResolveTransferDto, user: UserPayload) {
    this.assertSuperAdmin(user);
    if (!dto.resolutionNote.trim()) {
      throw new BadRequestException('A resolution note is required');
    }
    return this.prisma.$transaction(async (tx) => {
      const transfer = await this.lockTransfer(tx, id);
      if (transfer.status !== TransferStatus.RECEIVED_PARTIAL) {
        throw new ConflictException('Only partially received transfers can be resolved');
      }
      const discrepant = transfer.items.filter(
        (item) => item.itemStatus === TransferItemStatus.DISCREPANT,
      );
      this.assertCompleteItemSet(
        discrepant.map((item) => item.masterProductId),
        dto.items.map((item) => item.productId),
      );
      const decisions = new Map(dto.items.map((item) => [item.productId, item]));
      const warehouse = await this.ledger.mainWarehouse(tx);

      for (const item of [...discrepant].sort((a, b) =>
        a.masterProductId.localeCompare(b.masterProductId),
      )) {
        const decision = decisions.get(item.masterProductId)!;
        const discrepancy = item.discrepancyQuantity ?? 0;
        if (discrepancy <= 0) {
          throw new ConflictException('Transfer item has no outstanding discrepancy');
        }
        if (decision.resolution === 'RETURN_TO_WAREHOUSE') {
          const stock = await this.ledger.lockWarehouseStock(
            tx,
            warehouse.id,
            item.masterProductId,
          );
          await tx.masterInventory.update({
            where: { id: stock.id },
            data: { quantityOnHand: stock.quantityOnHand + discrepancy },
          });
          await this.ledger.recordMovement(tx, {
            type: StockMovementType.TRANSFER_REVERT,
            productId: item.masterProductId,
            quantity: discrepancy,
            fromType: LocationType.IN_TRANSIT,
            fromId: transfer.id,
            toType: LocationType.WAREHOUSE,
            toId: warehouse.id,
            unitCost: item.masterProduct.costPrice,
            unitPrice: item.masterProduct.baseSellingPrice,
            referenceId: transfer.id,
            reason: dto.resolutionNote.trim(),
            userId: user.id,
          });
          await tx.stockTransferItem.update({
            where: { id: item.id },
            data: {
              itemStatus: TransferItemStatus.RESOLVED_REVERTED,
              notes: [item.notes, dto.resolutionNote.trim()].filter(Boolean).join('\n'),
            },
          });
        } else {
          await this.ledger.recordMovement(tx, {
            type: StockMovementType.TRANSFER_DISCREPANCY_WRITE_OFF,
            productId: item.masterProductId,
            quantity: discrepancy,
            fromType: LocationType.IN_TRANSIT,
            fromId: transfer.id,
            toType: LocationType.WRITE_OFF,
            referenceId: transfer.id,
            reason: dto.resolutionNote.trim(),
            unitCost: item.masterProduct.costPrice,
            unitPrice: item.masterProduct.baseSellingPrice,
            userId: user.id,
          });
          await tx.stockTransferItem.update({
            where: { id: item.id },
            data: {
              itemStatus: TransferItemStatus.RESOLVED_WRITE_OFF,
              notes: [item.notes, dto.resolutionNote.trim()].filter(Boolean).join('\n'),
            },
          });
        }
      }

      const resolved = await tx.stockTransfer.update({
        where: { id },
        data: {
          status: TransferStatus.RESOLVED,
          resolvedByUserId: user.id,
          resolvedAt: new Date(),
          resolutionNote: dto.resolutionNote.trim(),
        },
        include: transferInclude,
      });
      await this.audit(tx, user, 'STOCK_TRANSFER_RESOLVE', id, {
        resolutionNote: dto.resolutionNote.trim(),
        items: dto.items.map(({ productId, resolution }) => ({
          productId,
          resolution,
        })),
      });
      return resolved;
    });
  }

  async revert(id: string, user: UserPayload) {
    this.assertSuperAdmin(user);
    return this.prisma.$transaction(async (tx) => {
      const transfer = await this.lockTransfer(tx, id);
      if (transfer.status !== TransferStatus.DISPATCHED) {
        throw new ConflictException('Only dispatched and unreceived transfers can be reverted');
      }
      const warehouse = await this.ledger.mainWarehouse(tx);
      for (const item of [...transfer.items].sort((a, b) =>
        a.masterProductId.localeCompare(b.masterProductId),
      )) {
        const quantity = item.dispatchedQuantity;
        if (quantity <= 0) continue;
        const stock = await this.ledger.lockWarehouseStock(
          tx,
          warehouse.id,
          item.masterProductId,
        );
        await tx.masterInventory.update({
          where: { id: stock.id },
          data: { quantityOnHand: stock.quantityOnHand + quantity },
        });
        await this.ledger.recordMovement(tx, {
          type: StockMovementType.TRANSFER_REVERT,
          productId: item.masterProductId,
          quantity,
          fromType: LocationType.IN_TRANSIT,
          fromId: transfer.id,
          toType: LocationType.WAREHOUSE,
          toId: warehouse.id,
          unitCost: item.masterProduct.costPrice,
          unitPrice: item.masterProduct.baseSellingPrice,
          referenceId: transfer.id,
          reason: 'Dispatched transfer reverted before receipt',
          userId: user.id,
        });
        await tx.stockTransferItem.update({
          where: { id: item.id },
          data: { itemStatus: TransferItemStatus.RESOLVED_REVERTED },
        });
      }
      const reverted = await tx.stockTransfer.update({
        where: { id },
        data: { status: TransferStatus.CANCELLED },
        include: transferInclude,
      });
      await this.audit(tx, user, 'STOCK_TRANSFER_REVERT', id, {
        transferNumber: transfer.transferNumber,
      });
      return reverted;
    });
  }

  async cancel(id: string, user: UserPayload) {
    this.assertSuperAdmin(user);
    return this.prisma.$transaction(async (tx) => {
      const transfer = await this.lockTransfer(tx, id);
      if (transfer.status !== TransferStatus.DRAFT) {
        throw new ConflictException('Only draft transfers can be cancelled; revert dispatched transfers');
      }
      const cancelled = await tx.stockTransfer.update({
        where: { id },
        data: { status: TransferStatus.CANCELLED },
        include: transferInclude,
      });
      await this.audit(tx, user, 'STOCK_TRANSFER_CANCEL', id, {
        transferNumber: transfer.transferNumber,
      });
      return cancelled;
    });
  }

  private assertSuperAdmin(user: UserPayload) {
    if (user.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can dispatch, resolve, revert, or cancel transfers');
    }
  }

  private async lockTransfer(tx: Prisma.TransactionClient, id: string) {
    const rows = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "StockTransfer" WHERE "id" = ${id}::uuid FOR UPDATE
    `;
    if (!rows[0]) throw new NotFoundException('Stock transfer not found');
    return tx.stockTransfer.findUniqueOrThrow({
      where: { id },
      include: transferInclude,
    });
  }

  private assertCompleteItemSet(expected: string[], actual: string[]) {
    const expectedSet = new Set(expected);
    if (
      actual.length !== expected.length ||
      actual.some((productId) => !expectedSet.has(productId))
    ) {
      throw new BadRequestException('Each transfer item must be included exactly once');
    }
  }

  private audit(
    tx: Prisma.TransactionClient,
    user: UserPayload,
    action: string,
    id: string,
    values: Prisma.InputJsonObject,
  ) {
    return tx.auditLog.create({
      data: {
        userId: user.id,
        userRole: user.role as Role,
        action,
        entityType: 'StockTransfer',
        entityId: id,
        newValues: values,
      },
    });
  }
}
