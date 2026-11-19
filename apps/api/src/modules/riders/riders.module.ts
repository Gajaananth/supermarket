import { Module } from '@nestjs/common';
import { CashControlModule } from '../cash-control/cash-control.module';
import { ClamAvScannerService } from './clamav-scanner.service';
import { RiderOnboardingController } from './rider-onboarding.controller';
import { RiderOnboardingService } from './rider-onboarding.service';

@Module({
  imports: [CashControlModule],
  controllers: [RiderOnboardingController],
  providers: [RiderOnboardingService, ClamAvScannerService],
})
export class RidersModule {}
