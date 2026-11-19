import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { validateEnv } from './config/env.validation';
import { PrismaModule } from './modules/prisma/prisma.module';
import { NotificationModule } from './modules/notifications/notification.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { StoresModule } from './modules/stores/stores.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { TransfersModule } from './modules/transfers/transfers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CashControlModule } from './modules/cash-control/cash-control.module';
import { RidersModule } from './modules/riders/riders.module';
import { MapsModule } from './modules/maps/maps.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AddressesModule } from './modules/addresses/addresses.module';

import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    // 1. Config Validation
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),

    // 2. Global Rate Limiter
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL_SECONDS', 60) * 1000,
          limit: config.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
    }),

    // 3. Core & Feature Modules
    PrismaModule,
    NotificationModule,
    AuditModule,
    HealthModule,
    AuthModule,
    StoresModule,
    CategoriesModule,
    ProductsModule,
    InventoryModule,
    TransfersModule,
    OrdersModule,
    CashControlModule,
    RidersModule,
    MapsModule,
    ReportsModule,
    AddressesModule,
  ],
  providers: [
    // Global Throttler
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global JWT Authentication Guard (Bypassed with @Public())
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global Role-Based Access Control Guard
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Global Error Format Envelope
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // Global Success Format Envelope
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    // Global Audit Trail Interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
