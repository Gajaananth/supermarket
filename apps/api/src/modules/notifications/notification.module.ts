import { Module, Global } from '@nestjs/common';
import { SmsProviderAdapter } from './adapters/sms-provider.adapter';
import { EmailProviderAdapter } from './adapters/email-provider.adapter';
import { PushProviderAdapter } from './adapters/push-provider.adapter';
import { NotificationService } from './notification.service';
import { JobsModule } from '../jobs/jobs.module';
import { NotificationOutboxWorker } from './notification-outbox.worker';

@Global()
@Module({
  imports: [JobsModule],
  providers: [
    SmsProviderAdapter,
    EmailProviderAdapter,
    PushProviderAdapter,
    NotificationService,
    NotificationOutboxWorker,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
