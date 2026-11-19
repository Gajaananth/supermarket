import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Server } from 'socket.io';
import { describe, expect, it } from 'vitest';
import { RealtimeGateway } from '../src/modules/realtime/realtime.gateway';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('RealtimeGateway CORS', () => {
  it('uses the configured exact-origin allowlist with credentials', () => {
    const origins = ['https://admin.example.com', 'https://shop.example.com'];
    const gateway = new RealtimeGateway(
      new JwtService({ secret: 'test-secret' }),
      new ConfigService({ CORS_ALLOWED_ORIGINS: origins }),
      {} as PrismaService,
    );
    const server = { engine: { opts: {} } } as unknown as Server;

    gateway.afterInit(server);

    expect(server.engine.opts.cors).toEqual({
      origin: origins,
      credentials: true,
    });
  });
});
