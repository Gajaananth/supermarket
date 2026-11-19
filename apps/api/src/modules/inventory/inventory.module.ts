import { Module } from '@nestjs/common';
import { StoreInventoryController, WarehouseInventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { StockLedgerService } from './stock-ledger.service';

@Module({
  controllers: [
    WarehouseInventoryController,
    StoreInventoryController,
  ],
  providers: [InventoryService, StockLedgerService],
  exports: [InventoryService, StockLedgerService],
})
export class InventoryModule {}
