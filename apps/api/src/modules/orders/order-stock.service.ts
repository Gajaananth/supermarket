import { ConflictException, Injectable } from '@nestjs/common';
import { LocationType, Prisma, StockMovementType } from '@prisma/client';
import { StockLedgerService } from '../inventory/stock-ledger.service';
import { OrderRecord } from './orders.types';

@Injectable()
export class OrderStockService {
  constructor(private readonly ledger: StockLedgerService) {}

  async reserve(
    tx: Prisma.TransactionClient,
    order: OrderRecord,
    userId: string,
  ): Promise<void> {
    for (const item of this.orderedItems(order)) {
      const stock = await this.ledger.lockStoreStock(
        tx,
        order.storeId,
        item.storeProduct.masterProductId,
      );
      const available = stock.quantityOnHand - stock.quantityReserved;
      if (available < item.quantity) {
        throw new ConflictException(
          `Insufficient stock for product ${item.storeProduct.masterProductId}`,
        );
      }

      await tx.storeProduct.update({
        where: { id: stock.id },
        data: { quantityReserved: stock.quantityReserved + item.quantity },
      });
      await this.ledger.recordMovement(tx, {
        type: StockMovementType.ORDER_RESERVATION,
        productId: item.storeProduct.masterProductId,
        quantity: item.quantity,
        fromType: LocationType.STORE,
        fromId: order.storeId,
        toType: LocationType.STORE,
        toId: order.storeId,
        referenceId: order.id,
        reason: `Reserved for order ${order.orderNumber}`,
        unitCost: item.storeProduct.masterProduct.costPrice,
        unitPrice: item.unitPrice,
        userId,
      });
    }
  }

  async releaseReservation(
    tx: Prisma.TransactionClient,
    order: OrderRecord,
    userId: string | undefined,
    reason: string,
  ): Promise<void> {
    for (const item of this.orderedItems(order)) {
      const stock = await this.ledger.lockStoreStock(
        tx,
        order.storeId,
        item.storeProduct.masterProductId,
      );
      if (stock.quantityReserved < item.quantity) {
        throw new ConflictException('Order reservation is inconsistent with store stock');
      }
      await tx.storeProduct.update({
        where: { id: stock.id },
        data: { quantityReserved: stock.quantityReserved - item.quantity },
      });
      await this.ledger.recordMovement(tx, {
        type: StockMovementType.ORDER_RESERVATION,
        productId: item.storeProduct.masterProductId,
        quantity: item.quantity,
        fromType: LocationType.STORE,
        fromId: order.storeId,
        toType: LocationType.STORE,
        toId: order.storeId,
        referenceId: order.id,
        reason: `Released reservation for order ${order.orderNumber}: ${reason}`,
        unitCost: item.storeProduct.masterProduct.costPrice,
        unitPrice: item.unitPrice,
        userId,
      });
    }
  }

  async pickUp(
    tx: Prisma.TransactionClient,
    order: OrderRecord,
    userId: string,
  ): Promise<void> {
    for (const item of this.orderedItems(order)) {
      const stock = await this.ledger.lockStoreStock(
        tx,
        order.storeId,
        item.storeProduct.masterProductId,
      );
      if (
        stock.quantityReserved < item.quantity ||
        stock.quantityOnHand < item.quantity
      ) {
        throw new ConflictException('Reserved order stock is no longer available');
      }
      const updated = await tx.storeProduct.update({
        where: { id: stock.id },
        data: {
          quantityOnHand: stock.quantityOnHand - item.quantity,
          quantityReserved: stock.quantityReserved - item.quantity,
        },
      });
      await this.ledger.recordMovement(tx, {
        type: StockMovementType.ORDER_FULFILLMENT,
        productId: item.storeProduct.masterProductId,
        quantity: item.quantity,
        fromType: LocationType.STORE,
        fromId: order.storeId,
        toType: LocationType.IN_TRANSIT,
        toId: order.id,
        referenceId: order.id,
        reason: `Picked up for order ${order.orderNumber}`,
        unitCost: item.storeProduct.masterProduct.costPrice,
        unitPrice: item.unitPrice,
        userId,
      });
      await this.ledger.refreshStoreLowStockAlert(tx, {
        storeId: order.storeId,
        productId: item.storeProduct.masterProductId,
        quantityOnHand: updated.quantityOnHand,
        reorderLevel: updated.reorderLevel,
        isAvailable: updated.isAvailable,
      });
    }
  }

  async deliver(
    tx: Prisma.TransactionClient,
    order: OrderRecord,
    userId: string,
  ): Promise<void> {
    for (const item of this.orderedItems(order)) {
      await this.ledger.recordMovement(tx, {
        type: StockMovementType.ORDER_FULFILLMENT,
        productId: item.storeProduct.masterProductId,
        quantity: item.quantity,
        fromType: LocationType.IN_TRANSIT,
        fromId: order.id,
        toType: LocationType.CUSTOMER,
        toId: order.customerId,
        referenceId: order.id,
        reason: `Delivered from order ${order.orderNumber}`,
        unitCost: item.storeProduct.masterProduct.costPrice,
        unitPrice: item.unitPrice,
        userId,
      });
    }
  }

  async restockFailedDelivery(
    tx: Prisma.TransactionClient,
    order: OrderRecord,
    userId: string,
    reason: string,
  ): Promise<void> {
    for (const item of this.orderedItems(order)) {
      const stock = await this.ledger.lockStoreStock(
        tx,
        order.storeId,
        item.storeProduct.masterProductId,
      );
      const updated = await tx.storeProduct.update({
        where: { id: stock.id },
        data: { quantityOnHand: stock.quantityOnHand + item.quantity },
      });
      await this.ledger.recordMovement(tx, {
        type: StockMovementType.ORDER_CANCEL_RESTOCK,
        productId: item.storeProduct.masterProductId,
        quantity: item.quantity,
        fromType: LocationType.IN_TRANSIT,
        fromId: order.id,
        toType: LocationType.STORE,
        toId: order.storeId,
        referenceId: order.id,
        reason: `Returned after failed delivery for order ${order.orderNumber}: ${reason}`,
        unitCost: item.storeProduct.masterProduct.costPrice,
        unitPrice: item.unitPrice,
        userId,
      });
      await this.ledger.refreshStoreLowStockAlert(tx, {
        storeId: order.storeId,
        productId: item.storeProduct.masterProductId,
        quantityOnHand: updated.quantityOnHand,
        reorderLevel: updated.reorderLevel,
        isAvailable: updated.isAvailable,
      });
    }
  }

  private orderedItems(order: OrderRecord) {
    return [...order.items].sort((a, b) =>
      a.storeProduct.masterProductId.localeCompare(b.storeProduct.masterProductId),
    );
  }
}
