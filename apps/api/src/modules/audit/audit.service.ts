import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

export interface CreateAuditLogDto {
  userId?: string;
  userRole?: Role;
  action: string;
  entityType?: string;
  entityId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(dto: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        userId: dto.userId || undefined,
        userRole: dto.userRole || undefined,
        action: dto.action,
        entityType: dto.entityType || 'SYSTEM',
        entityId: dto.entityId || 'NONE',
        oldValues: dto.oldValues || undefined,
        newValues: dto.newValues || undefined,
        ipAddress: dto.ipAddress || undefined,
        userAgent: dto.userAgent || undefined,
      },
    });
  }

  async getRecentLogs(limit = 50) {
    return this.prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true, email: true, phone: true } },
      },
    });
  }
}
