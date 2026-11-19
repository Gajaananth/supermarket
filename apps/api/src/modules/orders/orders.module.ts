import { Module } from '@nestjs/common';
import { CashControlModule } from '../cash-control/cash-control.module';
import { InventoryModule } from '../inventory/inventory.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderStockService } from './order-stock.service';
import { DeliveryZoneService } from './delivery-zone.service';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { OrderTimeoutWorker } from './order-timeout.worker';
import { JobsModule } from '../jobs/jobs.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { CampaignsModule } from '../campaigns/campaigns.module';

@Module({
  imports: [InventoryModule, CashControlModule, JobsModule, RealtimeModule, CampaignsModule],
  controllers: [OrdersController, CartController],
  providers: [
    OrdersService,
    OrderStockService,
    DeliveryZoneService,
    CartService,
    OrderTimeoutWorker,
  ],
})
export class OrdersModule {}
