import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';
import { resolve } from 'node:path';
import { AppModule } from './app.module';
import { StructuredLogger } from './common/logger/structured-logger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'test' ? false : new StructuredLogger(),
  });
  app.enableShutdownHooks();

  if (process.env.NODE_ENV === 'test') {
    app.getHttpAdapter().getInstance().set('trust proxy', true);
  }

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);
  const host = configService.get<string>('HOST', '0.0.0.0');
  const allowedOrigins = configService.get<string[]>('CORS_ALLOWED_ORIGINS', []);
  const productImageDirectory = resolve(
    configService.getOrThrow<string>('STORAGE_LOCAL_DIR'),
    'products',
  );
  app.use('/uploads/products', express.static(productImageDirectory, {
    dotfiles: 'deny',
    index: false,
    immutable: true,
    maxAge: '1y',
  }));

  // Global Prefix
  app.setGlobalPrefix('api/v1', {
    exclude: ['health', 'docs', 'docs-json'],
  });

  // Enable CORS
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Global Request Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // OpenAPI / Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('BuyMe Hyperlocal Delivery Platform API')
    .setDescription(
      'Enterprise NestJS REST API for BuyMe Multi-Store Hyperlocal Grocery Delivery in Batticaloa District, Sri Lanka.\n\n' +
      'Features:\n' +
      '- Customer & Rider Passwordless OTP Auth\n' +
      '- Admin Email + Argon2 Password Login with Super Admin 2FA\n' +
      '- Rotating Refresh Tokens with Replay Detection\n' +
      '- 10 Batticaloa Store Delivery Zone Routing\n' +
      '- Cash Control Meter Enforcement & Audit Logs'
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT access token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addTag('System & Health', 'Health check and connectivity diagnostics')
    .addTag('Authentication & Identity', 'Customer, Rider, and Admin Auth Flows')
    .addTag('Stores & Zones', 'Batticaloa stores, coverage radii, and delivery zones')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port, host);
  logger.log(`🚀 BuyMe API Server running at http://${host}:${port}`);
  logger.log(`📚 OpenAPI / Swagger UI available at: http://localhost:${port}/docs`);
  logger.log(`📋 Health Check endpoint: http://localhost:${port}/health`);
}

bootstrap();
