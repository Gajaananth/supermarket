import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'pg-boss';
import { PgBossService } from '../jobs/pg-boss.service';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationOutboxWorker implements OnModuleInit {
  constructor(
    private readonly bossService: PgBossService,
    private readonly notifications: NotificationService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const boss = await this.bossService.start();
    await boss.createQueue('notifications.dispatch', {
      retryLimit: 3,
      retryDelay: 30,
      retryBackoff: true,
    });
    await boss.schedule(
      'notifications.dispatch',
      this.config.get<string>('ORDER_TIMEOUT_SWEEP_CRON', '* * * * *'),
      { kind: 'dispatch-pending' },
    );
    await boss.work<{ kind?: string }>(
      'notifications.dispatch',
      async (jobs: Job<{ kind?: string }>[]) => {
        for (const _job of jobs) await this.notifications.dispatchPending();
      },
    );
  }
}
