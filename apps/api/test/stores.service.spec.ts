import { NotFoundException } from '@nestjs/common';
import { Store } from '@prisma/client';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { StoresService } from '../src/modules/stores/stores.service';

describe('Nearest open store resolution', () => {
  let rows: Store[];
  let service: StoresService;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T04:00:00.000Z'));
    rows = [];
    const prisma = {
      store: { findMany: vi.fn(async () => rows) },
    } as unknown as PrismaService;
    service = new StoresService(prisma);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('skips closed stores and excludes locations outside a polygon service area', async () => {
    rows = [
      makeStore({
        id: 'closed',
        code: 'A-CLOSED',
        latitude: 7.7,
        longitude: 81.7,
        openingTime: '10:00',
        closingTime: '11:00',
      }),
      makeStore({
        id: 'polygon-miss',
        code: 'B-POLYGON',
        latitude: 7.7,
        longitude: 81.7,
        serviceAreaPolygon: [[
          [81.68, 7.68],
          [81.69, 7.68],
          [81.69, 7.69],
          [81.68, 7.69],
          [81.68, 7.68],
        ]],
      }),
      makeStore({
        id: 'open',
        code: 'C-OPEN',
        latitude: 7.705,
        longitude: 81.7,
        serviceRadiusKm: 5,
      }),
    ];

    await expect(service.findNearest(7.7, 81.7)).resolves.toMatchObject({
      store: { id: 'open' },
    });
  });

  it('rejects points outside every store area', async () => {
    rows = [
      makeStore({
        id: 'limited',
        code: 'LIMITED',
        latitude: 7.7,
        longitude: 81.7,
        serviceRadiusKm: 1,
        serviceAreaPolygon: [[
          [81.69, 7.69],
          [81.71, 7.69],
          [81.71, 7.71],
          [81.69, 7.71],
          [81.69, 7.69],
        ]],
      }),
    ];

    await expect(service.findNearest(7.8, 81.8)).rejects.toThrow(NotFoundException);
  });

  it('uses the store code as a deterministic tie-breaker for equal distances', async () => {
    rows = [
      makeStore({ id: 'z-store', code: 'Z-STORE', latitude: 7.69, longitude: 81.7 }),
      makeStore({ id: 'a-store', code: 'A-STORE', latitude: 7.71, longitude: 81.7 }),
    ];

    await expect(service.findNearest(7.7, 81.7)).resolves.toMatchObject({
      store: { id: 'a-store' },
    });
  });

  it('treats a point on the service-area boundary as inside', async () => {
    rows = [
      makeStore({
        id: 'boundary',
        code: 'BOUNDARY',
        latitude: 7.7,
        longitude: 81.7,
        serviceRadiusKm: 5,
        serviceAreaPolygon: [[
          [81.69, 7.69],
          [81.71, 7.69],
          [81.71, 7.71],
          [81.69, 7.71],
          [81.69, 7.69],
        ]],
      }),
    ];

    await expect(service.findNearest(7.69, 81.7)).resolves.toMatchObject({
      store: { id: 'boundary' },
    });
  });
});

describe('Super Admin store management', () => {
  it('lists inactive stores for the admin inventory', async () => {
    const records = [{ id: 'inactive-store', isActive: false }];
    const findMany = vi.fn().mockResolvedValue(records);
    const service = new StoresService({
      store: { findMany },
    } as unknown as PrismaService);

    await expect(service.findAllForAdmin()).resolves.toBe(records);
    expect(findMany).toHaveBeenCalledWith({
      include: { deliveryZones: { orderBy: { zoneNumber: 'asc' } } },
      orderBy: { code: 'asc' },
    });
  });

  it('updates store status and records an audit event in the same transaction', async () => {
    const tx = {
      store: {
        findUniqueOrThrow: vi.fn().mockResolvedValue({ isActive: true }),
        update: vi.fn().mockResolvedValue({
          id: 'store-1',
          code: 'BM-S01',
          name: 'Batticaloa Town',
          isActive: false,
        }),
      },
      auditLog: { create: vi.fn().mockResolvedValue({ id: 'audit-1' }) },
    };
    const prisma = {
      $transaction: vi.fn(async (callback: (transaction: typeof tx) => unknown) => callback(tx)),
    } as unknown as PrismaService;
    const service = new StoresService(prisma);

    await expect(service.updateStatus(
      'store-1',
      { isActive: false },
      { id: 'admin-1', role: 'SUPER_ADMIN', fullName: 'Test Admin' },
    )).resolves.toMatchObject({ isActive: false });

    expect(tx.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'STORE_STATUS_UPDATE',
        entityType: 'Store',
        entityId: 'store-1',
        oldValues: { isActive: true },
        newValues: { isActive: false },
      }),
    });
  });
});

function makeStore(overrides: Record<string, unknown>): Store {
  return {
    id: 'store',
    code: 'STORE',
    name: 'Test Store',
    slug: 'test-store',
    address: 'Test',
    locality: 'Test',
    latitude: 7.7,
    longitude: 81.7,
    contactPhone: '+94770000000',
    contactEmail: null,
    isActive: true,
    openingTime: '00:00',
    closingTime: '23:59',
    serviceRadiusKm: 10,
    serviceAreaPolygon: null,
    allowPriceOverride: false,
    minOrderAmount: { toString: () => '0' } as Store['minOrderAmount'],
    freeDeliveryThreshold: { toString: () => '0' } as Store['freeDeliveryThreshold'],
    cashHoldThreshold: { toString: () => '10000' } as Store['cashHoldThreshold'],
    cashHoldMaxHours: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Store;
}
