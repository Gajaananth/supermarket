import { Controller, Get, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('System & Health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'System Health & DB Connectivity Ping' })
  @ApiResponse({ status: 200, description: 'Health check successful' })
  @ApiResponse({ status: 503, description: 'Database connectivity check failed' })
  async check() {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      this.logger.error('Database health check failed');
      throw new ServiceUnavailableException('Database connectivity check failed');
    }

    return {
      status: 'ok',
      service: 'buyme-api',
      framework: 'NestJS',
      database: 'ok',
      dbLatencyMs: Date.now() - start,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }
}
