import 'reflect-metadata';
import 'dotenv/config';
import { ChildProcess, spawn } from 'node:child_process';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { PrismaClient, Role } from '@prisma/client';
import argon2 from 'argon2';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('Catalog and stock APIs (isolated PostgreSQL schema)', () => {
  const baseUrl = 'http://127.0.0.1:4402';
  const prisma = new PrismaClient();
  const suffix = randomUUID().replace(/-/g, '').slice(0, 12);
  const password = `test-${randomUUID()}-Admin!`;
  const superAdminEmail = `stock-super-${suffix}@example.invalid`;
  const storeAdminEmail = `stock-store-${suffix}@example.invalid`;
  let apiProcess: ChildProcess | undefined;
  let warehouseId: string;
  let storeId: string;
  let otherStoreId: string;
  let productId: string;
  let primaryBarcode: string;
  let secondaryBarcode: string;
  let superAdminToken: string;
  let storeAdminToken: string;

  beforeAll(async () => {
    await prisma.$connect();
    const [warehouse, store, otherStore, superAdmin, storeAdmin] = await Promise.all([
      prisma.warehouse.create({
        data: {
          code: 'WH-MAIN',
          name: 'E2E Main Warehouse',
          address: 'Test address',
          latitude: 7.7,
          longitude: 81.7,
          contactPhone: '+94770000001',
        },
      }),
      prisma.store.create({
        data: {
          code: `S-${suffix.slice(0, 8)}`,
          name: 'E2E Store One',
          slug: `e2e-store-one-${suffix}`,
          address: 'Test address',
          locality: 'Test',
          latitude: 7.7,
          longitude: 81.7,
          contactPhone: '+94770000002',
        },
      }),
      prisma.store.create({
        data: {
          code: `T-${suffix.slice(0, 8)}`,
          name: 'E2E Store Two',
          slug: `e2e-store-two-${suffix}`,
          address: 'Test address',
          locality: 'Test',
          latitude: 7.71,
          longitude: 81.71,
          contactPhone: '+94770000003',
        },
      }),
      prisma.user.create({
        data: {
          email: superAdminEmail,
          passwordHash: await argon2.hash(password),
          fullName: 'Stock E2E Super Admin',
          role: Role.SUPER_ADMIN,
        },
      }),
      prisma.user.create({
        data: {
          email: storeAdminEmail,
          passwordHash: await argon2.hash(password),
          fullName: 'Stock E2E Store Admin',
          role: Role.STORE_ADMIN,
        },
      }),
    ]);
    warehouseId = warehouse.id;
    storeId = store.id;
    otherStoreId = otherStore.id;
    await prisma.storeAdmin.create({
      data: { userId: storeAdmin.id, storeId },
    });

    apiProcess = spawn(process.execPath, ['dist/main.js'], {
      cwd: process.cwd(),
      env: { ...process.env, HOST: '127.0.0.1', NODE_ENV: 'test', PORT: '4402' },
      stdio: 'inherit',
      windowsHide: true,
    });
    await waitForApi();

    const superLogin = await request(baseUrl)
      .post('/api/v1/auth/admin/login')
      .send({ email: superAdminEmail, password, deviceId: 'stock-e2e-super' });
    expect(superLogin.status).toBe(200);
    superAdminToken = superLogin.body.data.accessToken;

    const storeLogin = await request(baseUrl)
      .post('/api/v1/auth/admin/login')
      .send({ email: storeAdminEmail, password, deviceId: 'stock-e2e-store' });
    expect(storeLogin.status).toBe(200);
    storeAdminToken = storeLogin.body.data.accessToken;

    const category = await request(baseUrl)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ name: `E2E Category ${suffix}`, slug: `e2e-category-${suffix}` });
    expect(category.status).toBe(201);
    const categoryId = category.body.data.id as string;
    primaryBarcode = `e2e-${suffix}-1`;
    secondaryBarcode = `e2e-${suffix}-2`;

    const product = await request(baseUrl)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        sku: `e2e-${suffix}`,
        barcodes: [primaryBarcode, secondaryBarcode],
        name: `E2E Product ${suffix}`,
        categoryId,
        unit: 'piece',
        costPrice: 1,
        baseSellingPrice: 2,
      });
    expect(product.status).toBe(201);
    productId = product.body.data.id as string;

    const stock = await request(baseUrl)
      .post(`/api/v1/warehouse/stock/${productId}/adjust`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ quantityDelta: 100, reason: 'E2E initial stock' });
    expect(stock.status).toBe(201);
  }, 60_000);

  afterAll(async () => {
    if (apiProcess && apiProcess.exitCode === null) {
      const exited = once(apiProcess, 'exit');
      apiProcess.kill();
      await Promise.race([
        exited,
        new Promise((resolve) => setTimeout(resolve, 5_000)),
      ]);
    }
    await prisma.$disconnect();
  });

  it('serves categories and searches products by primary and additional barcodes', async () => {
    const categories = await request(baseUrl).get('/api/v1/categories');
    expect(categories.status).toBe(200);

    const primary = await request(baseUrl)
      .get(`/api/v1/products/barcode/${primaryBarcode}`);
    expect(primary.status).toBe(200);
    expect(primary.body.data.id).toBe(productId);

    const secondary = await request(baseUrl)
      .get(`/api/v1/products/barcode/${secondaryBarcode}`);
    expect(secondary.status).toBe(200);
    expect(secondary.body.data.id).toBe(productId);

    const search = await request(baseUrl)
      .get('/api/v1/products')
      .query({ query: `E2E Product ${suffix}` });
    expect(search.status).toBe(200);
    expect(search.body.data.some((product: { id: string }) => product.id === productId)).toBe(true);
  });

  it('uploads and serves a validated product image from the configured E: storage', async () => {
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/rTcAAAAASUVORK5CYII=',
      'base64',
    );
    const upload = await request(baseUrl)
      .post(`/api/v1/products/${productId}/image`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .attach('image', png, { filename: 'tiny.png', contentType: 'image/png' });
    expect(upload.status).toBe(201);
    expect(upload.body.data.imageUrl).toMatch(/^\/uploads\/products\/[0-9a-f-]+\.png$/);

    const served = await request(baseUrl).get(upload.body.data.imageUrl);
    expect(served.status).toBe(200);
    expect(served.headers['content-type']).toContain('image/png');
  });

  it('receives partial quantities, raises low-stock alerts, and resolves a discrepancy', async () => {
    const draft = await createTransfer(10);
    const dispatched = await request(baseUrl)
      .post(`/api/v1/transfers/${draft.id}/dispatch`)
      .set('Authorization', `Bearer ${superAdminToken}`);
    expect(dispatched.status).toBe(201);
    expect(dispatched.body.data.status).toBe('DISPATCHED');

    const receipt = await request(baseUrl)
      .post(`/api/v1/transfers/${draft.id}/receive`)
      .set('Authorization', `Bearer ${storeAdminToken}`)
      .send({ items: [{ productId, receivedQuantity: 7, notes: 'Three missing' }] });
    expect(receipt.status).toBe(201);
    expect(receipt.body.data.status).toBe('RECEIVED_PARTIAL');
    expect(receipt.body.data.items[0].discrepancyQuantity).toBe(3);

    const stock = await prisma.storeProduct.findUnique({
      where: { storeId_masterProductId: { storeId, masterProductId: productId } },
    });
    expect(stock?.quantityOnHand).toBe(7);
    const catalog = await request(baseUrl)
      .get(`/api/v1/stores/${storeId}/catalog`)
      .query({ query: `E2E Product ${suffix}` });
    expect(catalog.status).toBe(200);
    expect(catalog.body.data.some((item: { masterProductId: string }) =>
      item.masterProductId === productId,
    )).toBe(true);
    const publicProduct = catalog.body.data.find(
      (item: { masterProductId: string }) => item.masterProductId === productId,
    );
    expect(publicProduct).not.toHaveProperty('quantityOnHand');
    expect(publicProduct).not.toHaveProperty('quantityReserved');
    expect(publicProduct.masterProduct).not.toHaveProperty('costPrice');
    const alerts = await request(baseUrl)
      .get(`/api/v1/stores/${storeId}/alerts`)
      .set('Authorization', `Bearer ${storeAdminToken}`);
    expect(alerts.status).toBe(200);
    expect(alerts.body.data.some((alert: { masterProductId: string }) =>
      alert.masterProductId === productId,
    )).toBe(true);

    const resolved = await request(baseUrl)
      .post(`/api/v1/transfers/${draft.id}/resolve`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        resolutionNote: 'Return the missing units to warehouse stock',
        items: [{ productId, resolution: 'RETURN_TO_WAREHOUSE' }],
      });
    expect(resolved.status).toBe(201);
    expect(resolved.body.data.status).toBe('RESOLVED');
    const warehouseStock = await prisma.masterInventory.findUnique({
      where: {
        warehouseId_masterProductId: {
          warehouseId,
          masterProductId: productId,
        },
      },
    });
    expect(warehouseStock?.quantityOnHand).toBe(93);
  });

  it('records full receipts and allows only super admins to cancel draft transfers', async () => {
    const fullDraft = await createTransfer(4);
    const dispatched = await request(baseUrl)
      .post(`/api/v1/transfers/${fullDraft.id}/dispatch`)
      .set('Authorization', `Bearer ${superAdminToken}`);
    expect(dispatched.status).toBe(201);

    const receipt = await request(baseUrl)
      .post(`/api/v1/transfers/${fullDraft.id}/receive`)
      .set('Authorization', `Bearer ${storeAdminToken}`)
      .send({ items: [{ productId, receivedQuantity: 4 }] });
    expect(receipt.status).toBe(201);
    expect(receipt.body.data.status).toBe('RECEIVED_FULL');

    const outstandingAlerts = await request(baseUrl)
      .get(`/api/v1/stores/${storeId}/alerts`)
      .set('Authorization', `Bearer ${storeAdminToken}`);
    expect(outstandingAlerts.body.data).toHaveLength(0);

    const draft = await createTransfer(1);
    const forbiddenCancel = await request(baseUrl)
      .post(`/api/v1/transfers/${draft.id}/cancel`)
      .set('Authorization', `Bearer ${storeAdminToken}`);
    expect(forbiddenCancel.status).toBe(403);

    const cancelled = await request(baseUrl)
      .post(`/api/v1/transfers/${draft.id}/cancel`)
      .set('Authorization', `Bearer ${superAdminToken}`);
    expect(cancelled.status).toBe(201);
    expect(cancelled.body.data.status).toBe('CANCELLED');
  });

  it('writes off unresolved transit discrepancies without returning them to warehouse stock', async () => {
    const draft = await createTransfer(3);
    const dispatched = await request(baseUrl)
      .post(`/api/v1/transfers/${draft.id}/dispatch`)
      .set('Authorization', `Bearer ${superAdminToken}`);
    expect(dispatched.status).toBe(201);

    const receipt = await request(baseUrl)
      .post(`/api/v1/transfers/${draft.id}/receive`)
      .set('Authorization', `Bearer ${storeAdminToken}`)
      .send({ items: [{ productId, receivedQuantity: 2 }] });
    expect(receipt.status).toBe(201);
    expect(receipt.body.data.status).toBe('RECEIVED_PARTIAL');

    const resolved = await request(baseUrl)
      .post(`/api/v1/transfers/${draft.id}/resolve`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        resolutionNote: 'Write off one damaged unit',
        items: [{ productId, resolution: 'WRITE_OFF' }],
      });
    expect(resolved.status).toBe(201);
    expect(resolved.body.data.items[0].itemStatus).toBe('RESOLVED_WRITE_OFF');

    const writeOffMovements = await prisma.stockMovement.count({
      where: {
        referenceId: draft.id,
        movementType: 'TRANSFER_DISCREPANCY_WRITE_OFF',
        quantity: 1,
      },
    });
    expect(writeOffMovements).toBe(1);
    const warehouseStock = await prisma.masterInventory.findUnique({
      where: {
        warehouseId_masterProductId: {
          warehouseId,
          masterProductId: productId,
        },
      },
    });
    expect(warehouseStock?.quantityOnHand).toBe(86);
  });

  it('rejects double dispatch and permits a super-admin to revert an unreceived transfer once', async () => {
    const draft = await createTransfer(5);
    const first = await request(baseUrl)
      .post(`/api/v1/transfers/${draft.id}/dispatch`)
      .set('Authorization', `Bearer ${superAdminToken}`);
    expect(first.status).toBe(201);

    const duplicate = await request(baseUrl)
      .post(`/api/v1/transfers/${draft.id}/dispatch`)
      .set('Authorization', `Bearer ${superAdminToken}`);
    expect(duplicate.status).toBe(409);

    const unauthorized = await request(baseUrl)
      .post(`/api/v1/transfers/${draft.id}/revert`)
      .set('Authorization', `Bearer ${storeAdminToken}`);
    expect(unauthorized.status).toBe(403);

    const reverted = await request(baseUrl)
      .post(`/api/v1/transfers/${draft.id}/revert`)
      .set('Authorization', `Bearer ${superAdminToken}`);
    expect(reverted.status).toBe(201);
    expect(reverted.body.data.status).toBe('CANCELLED');

    const movements = await prisma.stockMovement.count({
      where: {
        referenceId: draft.id,
        movementType: 'TRANSFER_DISPATCH',
      },
    });
    expect(movements).toBe(1);
  });

  it('prevents negative stock and blocks store admins from accessing other stores', async () => {
    const negative = await request(baseUrl)
      .post(`/api/v1/stores/${storeId}/stock/${productId}/adjust`)
      .set('Authorization', `Bearer ${storeAdminToken}`)
      .send({ quantityDelta: -14, reason: 'E2E negative stock guard' });
    expect(negative.status).toBe(409);

    const crossStoreStock = await request(baseUrl)
      .get(`/api/v1/stores/${otherStoreId}/stock`)
      .set('Authorization', `Bearer ${storeAdminToken}`);
    expect(crossStoreStock.status).toBe(403);

    const crossStoreTransfer = await request(baseUrl)
      .post('/api/v1/transfers')
      .set('Authorization', `Bearer ${storeAdminToken}`)
      .send({
        storeId: otherStoreId,
        items: [{ productId, requestedQuantity: 1 }],
      });
    expect(crossStoreTransfer.status).toBe(403);
  });

  it('rejects stock-movement updates and deletes at the database boundary', async () => {
    const movement = await prisma.stockMovement.findFirstOrThrow({
      where: { masterProductId: productId },
    });
    await expect(
      prisma.stockMovement.update({
        where: { id: movement.id },
        data: { reason: 'attempted mutation' },
      }),
    ).rejects.toThrow(/Stock movements are immutable/);
    await expect(
      prisma.stockMovement.delete({ where: { id: movement.id } }),
    ).rejects.toThrow(/Stock movements are immutable/);
  });

  async function createTransfer(requestedQuantity: number) {
    const response = await request(baseUrl)
      .post('/api/v1/transfers')
      .set('Authorization', `Bearer ${storeAdminToken}`)
      .send({
        storeId,
        items: [{ productId, requestedQuantity }],
      });
    expect(response.status).toBe(201);
    return response.body.data as { id: string };
  }

  async function waitForApi() {
    const deadline = Date.now() + 30_000;
    let lastStatus = 'no response';
    while (Date.now() < deadline) {
      if (apiProcess?.exitCode !== null) {
        throw new Error(`API process exited with code ${apiProcess?.exitCode}`);
      }
      try {
        const response = await fetch(`${baseUrl}/health`);
        const body = await response.json() as { data?: { database?: string } };
        if (response.ok && body.data?.database === 'ok') return;
        lastStatus = `HTTP ${response.status}`;
      } catch {
        lastStatus = 'connection refused';
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
    throw new Error(`Stock E2E API did not become healthy within 30 seconds (${lastStatus})`);
  }
});
