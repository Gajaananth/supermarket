import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { ReportsService } from '../src/modules/reports/reports.service';

describe('ReportsService', () => {
  const queryRaw = vi.fn();
  const service = new ReportsService({ $queryRaw: queryRaw } as unknown as PrismaService);

  beforeEach(() => {
    queryRaw.mockReset();
  });

  it('rejects a partial date range', async () => {
    await expect(service.overview({ from: '2026-11-01T00:00:00.000Z' }))
      .rejects.toThrow(BadRequestException);
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it('rejects reversed and over-90-day date ranges', async () => {
    await expect(service.overview({
      from: '2026-11-02T00:00:00.000Z',
      to: '2026-11-01T00:00:00.000Z',
    })).rejects.toThrow(/must be before/);

    await expect(service.overview({
      from: '2026-01-01T00:00:00.000Z',
      to: '2026-04-02T00:00:00.000Z',
    })).rejects.toThrow(/cannot exceed 90 days/);
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it('returns daily order counts and delivered revenue from the aggregate query', async () => {
    queryRaw.mockResolvedValue([
      { day: '2026-11-14', orders: 5, deliveredOrders: 3, cancelledOrders: 1, revenue: 4200.5 },
      { day: '2026-11-15', orders: 2, deliveredOrders: 2, cancelledOrders: 0, revenue: 1800 },
    ]);

    await expect(service.overview({
      from: '2026-11-14T00:00:00.000Z',
      to: '2026-11-16T00:00:00.000Z',
    })).resolves.toMatchObject({
      summary: {
        orders: 7,
        deliveredOrders: 5,
        cancelledOrders: 1,
        revenue: 6000.5,
      },
      daily: [
        { day: '2026-11-14', orders: 5, deliveredOrders: 3, revenue: 4200.5 },
        { day: '2026-11-15', orders: 2, deliveredOrders: 2, revenue: 1800 },
      ],
    });
    expect(queryRaw).toHaveBeenCalledTimes(1);
  });
});
