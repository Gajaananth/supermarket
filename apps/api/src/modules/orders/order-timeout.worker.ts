import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'pg-boss';
import { PgBossService } from '../jobs/pg-boss.service';
import { OrdersService } from './orders.service';

type OrderTimeoutJob = { orderId?: string; sweep?: boolean };

@Injectable()
export class OrderTimeoutWorker implements OnModuleInit {
  constructor(
    private readonly bossService: PgBossService,
    private readonly orders: OrdersService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const boss = await this.bossService.start();
    await boss.createQueue('orders.timeout', {
      retryLimit: 5,
      retryDelay: 30,
      retryBackoff: true,
    });
    await boss.schedule(
      'orders.timeout',
      this.config.get<string>('ORDER_TIMEOUT_SWEEP_CRON', '* * * * *'),
      { sweep: true },
    );
    await boss.work<OrderTimeoutJob>(
      'orders.timeout',
      async (jobs: Job<OrderTimeoutJob>[]) => {
        for (const job of jobs) {
          if (job.data.sweep) {
            await this.orders.sweepExpiredStoreOrders();
            continue;
          }
          if (!job.data.orderId) throw new Error('Order timeout job has no order ID');
          const result = await this.orders.processStoreAcceptTimeout(job.data.orderId);
          if (result.state === 'reschedule') {
            await this.bossService.scheduleOrderTimeout(job.data.orderId, result.dueAt);
          }
        }
      },
    );
  }
}
