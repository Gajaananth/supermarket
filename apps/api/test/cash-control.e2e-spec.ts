import 'reflect-metadata';
import 'dotenv/config';
import { ChildProcess, spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer, Server } from 'node:http';
import { randomUUID } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import { DepositStatus, PrismaClient, Role } from '@prisma/client';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

type StoredObject = { body: Buffer; contentType: string };

describe('Rider cash control APIs (isolated PostgreSQL schema, S3-compatible test server)', () => {
  const baseUrl = 'http://127.0.0.1:4406';
  const prisma = new PrismaClient();
  const jwt = new JwtService({ secret: process.env.JWT_SECRET });
  const suffix = randomUUID().replace(/-/g, '').slice(0, 12);
  const objects = new Map<string, StoredObject>();
  const image = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/rTcAAAAASUVORK5CYII=',
    'base64',
  );
  let storageServer: Server;
  let apiProcess: ChildProcess | undefined;
  let storeId: string;
  let otherStoreId: string;
  let riderId: string;
  let riderUserId: string;
  let customerToken: string;
  let riderToken: string;
  let otherRiderToken: string;
  let storeAdminToken: string;
  let otherStoreAdminToken: string;
  let superAdminToken: string;

  beforeAll(async () => {
    await startStorageServer();
    await prisma.$connect();

    const store = await prisma.store.create({
      data: {
        code: `C-${suffix.slice(0, 8)}`,
        name: 'Cash E2E Store',
        slug: `cash-e2e-${suffix}`,
        address: 'Test address',
        locality: 'Test',
        latitude: 7.7,
        longitude: 81.7,
        contactPhone: '+94770000201',
        cashHoldThreshold: 5000,
        cashHoldMaxHours: 4,
      },
    });
    storeId = store.id;
    const otherStore = await prisma.store.create({
      data: {
        code: `Y-${suffix.slice(0, 8)}`,
        name: 'Other Cash E2E Store',
        slug: `other-cash-e2e-${suffix}`,
        address: 'Other test address',
        locality: 'Other',
        latitude: 7.7,
        longitude: 81.7,
        contactPhone: '+94770000202',
      },
    });
    otherStoreId = otherStore.id;

    const riderUser = await prisma.user.create({
      data: {
        role: Role.RIDER,
        fullName: 'Cash E2E Rider',
        phone: `+9474${suffix}`,
      },
    });
    riderUserId = riderUser.id;
    const rider = await prisma.riderProfile.create({
      data: {
        userId: riderUser.id,
        assignedStoreId: storeId,
        kycStatus: 'APPROVED',
        isShiftActive: true,
        cashInHand: 5000,
        oldestCashCollectionTime: new Date(),
      },
    });
    riderId = rider.id;
    await prisma.riderCashLedgerEntry.create({
      data: {
        riderId: rider.id,
        storeId,
        entryType: 'OPENING_BALANCE',
        amount: 5000,
        balanceAfter: 5000,
        note: 'E2E opening cash balance',
      },
    });
    const otherRider = await prisma.user.create({
      data: {
        role: Role.RIDER,
        fullName: 'Other Cash E2E Rider',
        phone: `+9473${suffix}`,
      },
    });
    await prisma.riderProfile.create({
      data: {
        userId: otherRider.id,
        assignedStoreId: otherStoreId,
        kycStatus: 'APPROVED',
        isShiftActive: true,
      },
    });

    const storeAdmin = await prisma.user.create({
      data: {
        role: Role.STORE_ADMIN,
        fullName: 'Cash E2E Store Admin',
        email: `cash-admin-${suffix}@example.invalid`,
      },
    });
    await prisma.storeAdmin.create({ data: { userId: storeAdmin.id, storeId } });
    const otherStoreAdmin = await prisma.user.create({
      data: {
        role: Role.STORE_ADMIN,
        fullName: 'Other Cash E2E Store Admin',
        email: `other-cash-admin-${suffix}@example.invalid`,
      },
    });
    await prisma.storeAdmin.create({
      data: { userId: otherStoreAdmin.id, storeId: otherStoreId },
    });
    const superAdmin = await prisma.user.create({
      data: {
        role: Role.SUPER_ADMIN,
        fullName: 'Cash E2E Super Admin',
        email: `cash-super-${suffix}@example.invalid`,
      },
    });
    const customer = await prisma.user.create({
      data: {
        role: Role.CUSTOMER,
        fullName: 'Cash E2E Customer',
        phone: `+9472${suffix}`,
      },
    });

    riderToken = jwt.sign({ sub: riderUser.id, role: Role.RIDER });
    otherRiderToken = jwt.sign({ sub: otherRider.id, role: Role.RIDER });
    storeAdminToken = jwt.sign({ sub: storeAdmin.id, role: Role.STORE_ADMIN });
    otherStoreAdminToken = jwt.sign({ sub: otherStoreAdmin.id, role: Role.STORE_ADMIN });
    superAdminToken = jwt.sign({ sub: superAdmin.id, role: Role.SUPER_ADMIN });
    customerToken = jwt.sign({ sub: customer.id, role: Role.CUSTOMER });

    apiProcess = spawn(process.execPath, ['dist/main.js'], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        HOST: '127.0.0.1',
        NODE_ENV: 'test',
        PORT: '4406',
      },
      stdio: 'inherit',
      windowsHide: true,
    });
    await waitForApi();
  }, 60_000);

  afterAll(async () => {
    if (apiProcess && apiProcess.exitCode === null) {
      const exited = once(apiProcess, 'exit');
      apiProcess.kill();
      await Promise.race([exited, new Promise((resolve) => setTimeout(resolve, 5_000))]);
    }
    if (storageServer?.listening) {
      await new Promise<void>((resolve, reject) => {
        storageServer.close((error) => error ? reject(error) : resolve());
      });
    }
    await prisma.$disconnect();
    objects.clear();
  });

  it('issues a private upload URL and rejects content that does not match the declared type', async () => {
    const invalidType = await request(baseUrl)
      .post('/api/v1/cash-control/deposits/upload-url')
      .set('Authorization', `Bearer ${riderToken}`)
      .send({ contentType: 'text/html', contentLength: 10 });
    expect(invalidType.status).toBe(400);

    const uploaded = await uploadSlip(Buffer.from('<html>not a PNG</html>'));
    expect(uploaded.response.status).toBe(200);
    expect(uploaded.data.expiresInSeconds).toBe(600);
    expect(uploaded.data.requiredHeaders['Content-Type']).toBe('image/png');
    expect(uploaded.data.contentLength).toBe(Buffer.byteLength('<html>not a PNG</html>'));
    expect(
      new URL(uploaded.data.uploadUrl).searchParams.get('X-Amz-SignedHeaders')?.split(';'),
    ).toContain('content-length');

    const submitted = await submitSlip(uploaded.data.objectKey, 'BANK-REF-INVALID', 5000);
    expect(submitted.status).toBe(400);
    const rider = await prisma.riderProfile.findUniqueOrThrow({ where: { id: riderId } });
    expect(rider.depositPending).toBe(false);
    expect(rider.isCashLocked).toBe(true);
  });

  it('submits full-balance deposits, scopes private slips, and reconciles approval and rejection', async () => {
    const wrongAmountUpload = await uploadSlip(image);
    const wrongAmount = await submitSlip(
      wrongAmountUpload.data.objectKey,
      'BANK-REF-MISMATCH',
      4999.99,
    );
    expect(wrongAmount.status).toBe(409);

    const firstUpload = await uploadSlip(image);
    const firstSubmit = await submitSlip(firstUpload.data.objectKey, 'BANK-REF-0001', 5000);
    expect(firstSubmit.status).toBe(201);
    expect(firstSubmit.body.data.status).toBe(DepositStatus.PENDING);
    expect(firstSubmit.body.data.amount).toBe('5000');
    expect(JSON.stringify(firstSubmit.body.data)).not.toContain('rider-deposits/');

    const riderCash = await request(baseUrl)
      .get('/api/v1/cash-control/me')
      .set('Authorization', `Bearer ${riderToken}`);
    expect(riderCash.status).toBe(200);
    expect(riderCash.body.data.depositPending).toBe(true);
    expect(riderCash.body.data.isCashLocked).toBe(true);

    const duplicatePending = await request(baseUrl)
      .post('/api/v1/cash-control/deposits/upload-url')
      .set('Authorization', `Bearer ${riderToken}`)
      .send({ contentType: 'image/png', contentLength: image.length });
    expect(duplicatePending.status).toBe(409);

    const riderList = await request(baseUrl)
      .get('/api/v1/cash-control/deposits')
      .set('Authorization', `Bearer ${riderToken}`);
    expect(riderList.status).toBe(200);
    expect(riderList.body.data).toHaveLength(1);

    const storeList = await request(baseUrl)
      .get('/api/v1/cash-control/deposits')
      .set('Authorization', `Bearer ${storeAdminToken}`);
    expect(storeList.status).toBe(200);
    expect(storeList.body.data).toHaveLength(1);

    const crossStoreList = await request(baseUrl)
      .get('/api/v1/cash-control/deposits')
      .set('Authorization', `Bearer ${storeAdminToken}`)
      .query({ storeId: otherStoreId });
    expect(crossStoreList.status).toBe(403);

    const otherStoreSlip = await request(baseUrl)
      .get(`/api/v1/cash-control/deposits/${firstSubmit.body.data.id}/slip-url`)
      .set('Authorization', `Bearer ${otherStoreAdminToken}`);
    expect(otherStoreSlip.status).toBe(403);

    const otherRiderSlip = await request(baseUrl)
      .get(`/api/v1/cash-control/deposits/${firstSubmit.body.data.id}/slip-url`)
      .set('Authorization', `Bearer ${otherRiderToken}`);
    expect(otherRiderSlip.status).toBe(404);

    const storeSlip = await request(baseUrl)
      .get(`/api/v1/cash-control/deposits/${firstSubmit.body.data.id}/slip-url`)
      .set('Authorization', `Bearer ${storeAdminToken}`);
    expect(storeSlip.status).toBe(200);
    const downloaded = await fetch(storeSlip.body.data.url);
    expect(downloaded.status).toBe(200);
    expect(Buffer.from(await downloaded.arrayBuffer())).toEqual(image);

    const rejected = await request(baseUrl)
      .post(`/api/v1/cash-control/deposits/${firstSubmit.body.data.id}/verify`)
      .set('Authorization', `Bearer ${storeAdminToken}`)
      .send({ action: 'REJECT', rejectionReason: 'Receipt reference is unreadable' });
    expect(rejected.status).toBe(201);
    expect(rejected.body.data.status).toBe(DepositStatus.REJECTED);
    const afterReject = await prisma.riderProfile.findUniqueOrThrow({
      where: { id: riderId },
    });
    expect(afterReject.cashInHand.toString()).toBe('5000');
    expect(afterReject.isCashLocked).toBe(true);
    expect(afterReject.depositPending).toBe(false);

    const secondUpload = await uploadSlip(image);
    const secondSubmit = await submitSlip(secondUpload.data.objectKey, 'BANK-REF-0003', 5000);
    expect(secondSubmit.status).toBe(201);
    const approved = await request(baseUrl)
      .post(`/api/v1/cash-control/deposits/${secondSubmit.body.data.id}/verify`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ action: 'APPROVE' });
    expect(approved.status).toBe(201);
    expect(approved.body.data.status).toBe(DepositStatus.APPROVED);
    const afterApproval = await prisma.riderProfile.findUniqueOrThrow({
      where: { id: riderId },
    });
    expect(afterApproval.cashInHand.toString()).toBe('0');
    expect(afterApproval.oldestCashCollectionTime).toBeNull();
    expect(afterApproval.isCashLocked).toBe(false);
    expect(afterApproval.depositPending).toBe(false);

    await prisma.riderProfile.update({
      where: { id: riderId },
      data: {
        cashInHand: 3000,
        oldestCashCollectionTime: new Date(),
        isCashLocked: true,
        cashLockReason: 'E2E variance case',
      },
    });
    await prisma.riderCashLedgerEntry.create({
      data: {
        riderId,
        storeId,
        entryType: 'DELIVERY_COLLECTION',
        amount: 3000,
        balanceAfter: 3000,
        note: 'E2E collection for variance case',
      },
    });
    const varianceUpload = await uploadSlip(image);
    const varianceSubmit = await submitSlip(
      varianceUpload.data.objectKey,
      'BANK-REF-VARIANCE',
      3000,
    );
    expect(varianceSubmit.status).toBe(201);
    const openedVariance = await request(baseUrl)
      .post(`/api/v1/cash-control/deposits/${varianceSubmit.body.data.id}/verify`)
      .set('Authorization', `Bearer ${storeAdminToken}`)
      .send({
        action: 'VARIANCE',
        receivedAmount: 2800,
        varianceReason: 'Bank deposit is short by LKR 200',
      });
    expect(openedVariance.status).toBe(201);
    expect(openedVariance.body.data.status).toBe(DepositStatus.VARIANCE);
    expect(openedVariance.body.data.varianceAmount).toBe('-200');
    const lockedForVariance = await prisma.riderProfile.findUniqueOrThrow({
      where: { id: riderId },
    });
    expect(lockedForVariance.isCashLocked).toBe(true);
    expect(lockedForVariance.depositPending).toBe(true);

    const varianceQueue = await request(baseUrl)
      .get('/api/v1/cash-control/deposits/variance-cases')
      .set('Authorization', `Bearer ${storeAdminToken}`)
      .query({ storeId });
    expect(varianceQueue.status).toBe(200);
    expect(varianceQueue.body.data).toHaveLength(1);
    expect(varianceQueue.body.data[0].status).toBe('OPEN');

    const forbiddenResolution = await request(baseUrl)
      .post(`/api/v1/cash-control/deposits/${varianceSubmit.body.data.id}/variance/resolve`)
      .set('Authorization', `Bearer ${storeAdminToken}`)
      .send({ action: 'ACCEPT_VARIANCE', resolutionNote: 'Not permitted' });
    expect(forbiddenResolution.status).toBe(403);
    const resolvedVariance = await request(baseUrl)
      .post(`/api/v1/cash-control/deposits/${varianceSubmit.body.data.id}/variance/resolve`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        action: 'ACCEPT_VARIANCE',
        resolutionNote: 'Accepted bank receipt and recorded the shortage',
      });
    expect(resolvedVariance.status).toBe(201);
    expect(resolvedVariance.body.data.status).toBe(DepositStatus.APPROVED_WITH_VARIANCE);
    expect(resolvedVariance.body.data.varianceCase.status).toBe('RESOLVED_APPROVED');
    const afterVariance = await prisma.riderProfile.findUniqueOrThrow({
      where: { id: riderId },
    });
    expect(afterVariance.cashInHand.toString()).toBe('0');
    expect(afterVariance.isCashLocked).toBe(false);
    expect(afterVariance.depositPending).toBe(false);

    const businessDate = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Colombo',
    }).format(new Date());
    const reconciliation = await request(baseUrl)
      .get(`/api/v1/cash-control/stores/${storeId}/reconciliation`)
      .set('Authorization', `Bearer ${storeAdminToken}`)
      .query({ date: businessDate });
    expect(reconciliation.status).toBe(200);
    expect(reconciliation.body.data).toMatchObject({
      businessDate,
      openingCash: '0.00',
      collections: '3000.00',
      approvedDeposits: '7800.00',
      varianceAdjustments: '-200.00',
      closingCash: '0.00',
    });

    const repeatedApproval = await request(baseUrl)
      .post(`/api/v1/cash-control/deposits/${secondSubmit.body.data.id}/verify`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ action: 'APPROVE' });
    expect(repeatedApproval.status).toBe(409);
    expect(
      await prisma.auditLog.count({
        where: {
          entityId: { in: [firstSubmit.body.data.id, secondSubmit.body.data.id] },
          action: { in: ['RIDER_DEPOSIT_SUBMIT', 'RIDER_DEPOSIT_REJECT', 'RIDER_DEPOSIT_APPROVE'] },
        },
      }),
    ).toBe(4);
  });

  it('persists the four-hour cash lock before returning the rider cash summary', async () => {
    await prisma.riderProfile.update({
      where: { id: riderId },
      data: {
        cashInHand: 100,
        oldestCashCollectionTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
        isCashLocked: false,
        cashLockReason: null,
      },
    });

    const response = await request(baseUrl)
      .get('/api/v1/cash-control/me')
      .set('Authorization', `Bearer ${riderToken}`);
    expect(response.status).toBe(200);
    expect(response.body.data.isCashLocked).toBe(true);
    expect(response.body.data.cashLockReason).toMatch(/at least 4 hours/);

    const locked = await prisma.riderProfile.findUniqueOrThrow({
      where: { id: riderId },
    });
    expect(locked.isCashLocked).toBe(true);
    expect(
      await prisma.auditLog.count({
        where: { entityId: riderId, action: 'RIDER_CASH_LOCK' },
      }),
    ).toBe(2);
  });

  async function uploadSlip(body: Buffer) {
    const response = await request(baseUrl)
      .post('/api/v1/cash-control/deposits/upload-url')
      .set('Authorization', `Bearer ${riderToken}`)
      .send({ contentType: 'image/png', contentLength: Buffer.byteLength(body) });
    expect(response.status).toBe(201);
    const data = response.body.data as {
      uploadUrl: string;
      objectKey: string;
      contentType: string;
      contentLength: number;
      requiredHeaders: Record<string, string>;
      expiresInSeconds: number;
    };
    const uploaded = await fetch(data.uploadUrl, {
      method: 'PUT',
      headers: data.requiredHeaders,
      body,
    });
    return { response: uploaded, data };
  }

  async function submitSlip(objectKey: string, bankRefNumber: string, amount: number) {
    return request(baseUrl)
      .post('/api/v1/cash-control/deposits')
      .set('Authorization', `Bearer ${riderToken}`)
      .send({ objectKey, bankRefNumber, amount });
  }

  async function startStorageServer() {
    storageServer = createServer((request, response) => {
      const parts = new URL(request.url ?? '/', 'http://127.0.0.1').pathname
        .split('/')
        .filter(Boolean);
      parts.shift();
      const key = decodeURIComponent(parts.join('/'));
      if (request.method === 'PUT') {
        const chunks: Buffer[] = [];
        request.on('data', (chunk: Buffer) => chunks.push(chunk));
        request.on('end', () => {
          objects.set(key, {
            body: Buffer.concat(chunks),
            contentType: request.headers['content-type'] ?? 'application/octet-stream',
          });
          response.writeHead(200, { ETag: '"cash-e2e"' });
          response.end();
        });
        return;
      }

      const object = objects.get(key);
      if (!object) {
        response.writeHead(404);
        response.end();
        return;
      }
      if (request.method === 'HEAD') {
        response.writeHead(200, {
          'Content-Length': object.body.length,
          'Content-Type': object.contentType,
        });
        response.end();
        return;
      }
      if (request.method === 'GET') {
        const range = request.headers.range?.match(/^bytes=(\d+)-(\d+)$/);
        const start = range ? Number(range[1]) : 0;
        const end = range
          ? Math.min(Number(range[2]), object.body.length - 1)
          : object.body.length - 1;
        const body = object.body.subarray(start, end + 1);
        response.writeHead(range ? 206 : 200, {
          'Content-Length': body.length,
          'Content-Type': object.contentType,
          ...(range
            ? { 'Content-Range': `bytes ${start}-${end}/${object.body.length}` }
            : {}),
        });
        response.end(body);
        return;
      }
      response.writeHead(405);
      response.end();
    });
    await new Promise<void>((resolve, reject) => {
      storageServer.once('error', reject);
      storageServer.listen(4405, '127.0.0.1', resolve);
    });
  }

  async function waitForApi() {
    const deadline = Date.now() + 30_000;
    let lastStatus = 'no response';
    while (Date.now() < deadline) {
      if (apiProcess?.exitCode !== null) {
        throw new Error(`Cash-control API process exited with code ${apiProcess?.exitCode}`);
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
    throw new Error(`Cash-control API did not become healthy within 30 seconds (${lastStatus})`);
  }
});
