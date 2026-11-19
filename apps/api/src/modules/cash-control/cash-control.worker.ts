import { Injectable, OnModuleInit } from '@nestjs/common';
import { Job } from 'pg-boss';
import { PgBossService } from '../jobs/pg-boss.service';
import { CashControlService } from './cash-control.service';

@Injectable()
export class CashControlWorker implements OnModuleInit {
  constructor(
    private readonly bossService: PgBossService,
    private readonly cashControl: CashControlService,
  ) {}

  async onModuleInit() {
    const boss = await this.bossService.start();
    await boss.createQueue('cash-control.lock-sweep', {
      retryLimit: 5,
      retryDelay: 30,
      retryBackoff: true,
    });
    await boss.schedule('cash-control.lock-sweep', '* * * * *', { sweep: true });
    await boss.work<{ sweep: true }>(
      'cash-control.lock-sweep',
      async (jobs: Job<{ sweep: true }>[]) => {
        for (const job of jobs) {
          if (job.data.sweep !== true) {
            throw new Error('Cash-control lock sweep job has invalid data');
          }
          await this.cashControl.sweepOverdueCashLocks();
        }
      },
    );
  }
}
