import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportQueryDto } from './dto/report-query.dto';

interface DailyReportRow {
  day: string;
  orders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  revenue: number;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(query: ReportQueryDto) {
    if (Boolean(query.from) !== Boolean(query.to)) {
      throw new BadRequestException('Both from and to dates are required when filtering a report');
    }

    const to = query.to ? new Date(query.to) : new Date();
    const from = query.from
      ? new Date(query.from)
      : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (from >= to) {
      throw new BadRequestException('The report from date must be before the to date');
    }
    if (to.getTime() - from.getTime() > 90 * 24 * 60 * 60 * 1000) {
      throw new BadRequestException('Report date range cannot exceed 90 days');
    }

    const daily = await this.prisma.$queryRaw<DailyReportRow[]>`
      SELECT
        to_char(date_trunc('day', "createdAt" AT TIME ZONE 'Asia/Colombo'), 'YYYY-MM-DD') AS day,
        COUNT(*)::int AS orders,
        COUNT(*) FILTER (WHERE status = 'DELIVERED')::int AS "deliveredOrders",
        COUNT(*) FILTER (WHERE status IN ('CANCELLED', 'REJECTED', 'FAILED'))::int AS "cancelledOrders",
        COALESCE(SUM("totalAmount") FILTER (WHERE status = 'DELIVERED'), 0)::float8 AS revenue
      FROM "Order"
      WHERE "createdAt" >= ${from}
        AND "createdAt" < ${to}
        AND (${query.storeId ?? null}::uuid IS NULL OR "storeId" = ${query.storeId ?? null}::uuid)
      GROUP BY day
      ORDER BY day ASC
    `;

    const summary = daily.reduce(
      (totals, row) => ({
        orders: totals.orders + Number(row.orders),
        deliveredOrders: totals.deliveredOrders + Number(row.deliveredOrders),
        cancelledOrders: totals.cancelledOrders + Number(row.cancelledOrders),
        revenue: totals.revenue + Number(row.revenue),
      }),
      { orders: 0, deliveredOrders: 0, cancelledOrders: 0, revenue: 0 },
    );

    return {
      from: from.toISOString(),
      to: to.toISOString(),
      storeId: query.storeId ?? null,
      summary,
      daily: daily.map((row) => ({
        day: row.day,
        orders: Number(row.orders),
        deliveredOrders: Number(row.deliveredOrders),
        cancelledOrders: Number(row.cancelledOrders),
        revenue: Number(row.revenue),
      })),
    };
  }
}
