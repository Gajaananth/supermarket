import { Module } from '@nestjs/common';
import { JobsModule } from '../jobs/jobs.module';
import { CashControlController } from './cash-control.controller';
import { CashControlService } from './cash-control.service';
import { PrivateObjectStorageService } from './private-object-storage.service';
import { CashControlWorker } from './cash-control.worker';

@Module({
  imports: [JobsModule],
  controllers: [CashControlController],
  providers: [CashControlService, PrivateObjectStorageService, CashControlWorker],
  exports: [CashControlService, PrivateObjectStorageService],
})
export class CashControlModule {}
