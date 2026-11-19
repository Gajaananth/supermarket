import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PgBoss } from 'pg-boss';

@Injectable()
export class PgBossService implements OnModuleDestroy {
  private readonly logger = new Logger(PgBossService.name);
  private readonly boss: PgBoss;
  private startPromise?: Promise<PgBoss>;

  constructor(@Inject(ConfigService) config: ConfigService) {
    const databaseUrl = new URL(config.getOrThrow<string>('DATABASE_URL'));
    const prismaSchema = databaseUrl.searchParams.get('schema');
    databaseUrl.searchParams.delete('schema');
    const schema = config.get<string>('PG_BOSS_SCHEMA') ??
      (prismaSchema && prismaSchema !== 'public' ? prismaSchema : 'pgboss');
    this.boss = new PgBoss({
      connectionString: databaseUrl.toString(),
      schema,
      useListenNotify: false,
    });
    this.boss.on('error', (error) => {
      this.logger.error('pg-boss reported an error', error.stack);
    });
    this.boss.on('warning', (warning) => {
      this.logger.warn(`pg-boss warning: ${warning.message}`);
    });
  }

  start() {
    if (!this.startPromise) {
      this.startPromise = this.boss.start().then(async () => this.boss);
    }
    return this.startPromise;
  }

  async scheduleOrderTimeout(orderId: string, dueAt: Date) {
    const boss = await this.start();
    return boss.send(
      'orders.timeout',
      { orderId },
      {
        startAfter: dueAt,
        singletonKey: `order:${orderId}`,
        singletonSeconds: 86400,
      },
    );
  }

  async enqueueNotificationDispatch() {
    const boss = await this.start();
    return boss.send(
      'notifications.dispatch',
      { kind: 'dispatch-pending' },
      { singletonKey: 'notification-outbox', singletonSeconds: 10 },
    );
  }

  onModuleDestroy() {
    if (!this.startPromise) return;
    return this.boss.stop();
  }
}
