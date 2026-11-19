import 'reflect-metadata';
import 'dotenv/config';
import { ChildProcess, spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer, Server } from 'node:http';
import { createServer as createTcpServer, Server as TcpServer, Socket } from 'node:net';
import { createHash, randomUUID } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import { KycStatus, NotificationChannel, NotificationStatus, PrismaClient, RiderType, Role } from '@prisma/client';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

type StoredObject = { body: Buffer; contentType: string; etag: string };

describe('Rider registration and KYC (isolated PostgreSQL schema)', () => {
  const baseUrl = 'http://127.0.0.1:4417';
  const prisma = new PrismaClient();
  const jwt = new JwtService({ secret: process.env.JWT_SECRET });
  const suffix = randomUUID().replace(/-/g, '').slice(0, 12);
  const objects = new Map<string, StoredObject>();
  let tamperNextClamScan: (() => void) | undefined;
  const image = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/rTcAAAAASUVORK5CYII=',
    'base64',
  );
  let storageServer: Server;
  let clamServer: TcpServer;
  let apiProcess: ChildProcess | undefined;
  let riderToken: string;
  let riderId: string;
  let riderUserId: string;
  let superAdminToken: string;
  let storeId: string;
  let riderPhone: string;

  beforeAll(async () => {
    await startStorageServer();
    await startClamServer();
    await prisma.$connect();

    const store = await prisma.store.create({
      data: {
        code: `K-${suffix.slice(0, 8)}`,
        name: 'KYC E2E Store',
        slug: `kyc-e2e-${suffix}`,
        address: 'Test address',
        locality: 'Test',
        latitude: 7.7,
        longitude: 81.7,
        contactPhone: '+94770000301',
      },
    });
    storeId = store.id;
    const superAdmin = await prisma.user.create({
      data: {
        role: Role.SUPER_ADMIN,
        fullName: 'KYC E2E Super Admin',
        email: `kyc-super-${suffix}@example.invalid`,
      },
    });
    superAdminToken = jwt.sign({ sub: superAdmin.id, role: Role.SUPER_ADMIN });

    apiProcess = spawn(process.execPath, ['dist/main.js'], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        HOST: '127.0.0.1',
        NODE_ENV: 'test',
        PORT: '4417',
        CLAMAV_HOST: '127.0.0.1',
        CLAMAV_PORT: '4416',
        OBJECT_STORAGE_ENDPOINT: 'http://127.0.0.1:4415',
        OBJECT_STORAGE_REGION: 'us-east-1',
        OBJECT_STORAGE_BUCKET: 'buyme-private-test',
        OBJECT_STORAGE_ACCESS_KEY_ID: 'test-access-key',
        OBJECT_STORAGE_SECRET_ACCESS_KEY: 'test-secret-key',
        OBJECT_STORAGE_FORCE_PATH_STYLE: 'true',
        OBJECT_STORAGE_PRESIGN_TTL_SECONDS: '600',
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
    await closeServer(storageServer);
    await closeServer(clamServer);
    await prisma.$disconnect();
    objects.clear();
  });

  it('registers a rider with a verified OTP and blocks operation before KYC approval', async () => {
    const swagger = await request(baseUrl).get('/docs/');
    expect(swagger.status).toBe(200);
    expect(swagger.text).toContain('Swagger UI');
    const openApi = await request(baseUrl).get('/docs-json');
    expect(openApi.status).toBe(200);
    expect(openApi.body.paths['/api/v1/auth/rider/registration/otp-request']).toBeDefined();
    expect(openApi.body.paths['/api/v1/riders/me/kyc/upload-url']).toBeDefined();
    expect(openApi.body.paths['/api/v1/riders/me/shift/start']).toBeDefined();
    expect(openApi.body.paths['/api/v1/riders/me/shift/stop']).toBeDefined();
    expect(openApi.body.paths['/api/v1/riders/review-queue']).toBeDefined();
    expect(openApi.body.paths['/api/v1/riders/{riderId}/approve']).toBeDefined();

    riderPhone = `+9477${Math.floor(1000000 + Math.random() * 9000000)}`;
    const email = `rider-${suffix}@example.invalid`;
    const registration = { fullName: 'KYC E2E Rider', phone: riderPhone, email };
    const otpRequest = await request(baseUrl)
      .post('/api/v1/auth/rider/registration/otp-request')
      .set('X-Forwarded-For', `198.51.100.${Math.floor(Math.random() * 200) + 1}`)
      .send(registration);
    expect(otpRequest.status).toBe(200);
    expect(otpRequest.body.data.demoCode).toMatch(/^\d{6}$/);

    const verified = await request(baseUrl)
      .post('/api/v1/auth/rider/registration/otp-verify')
      .send({ ...registration, code: otpRequest.body.data.demoCode, deviceId: `kyc-${suffix}` });
    expect(verified.status).toBe(200);
    expect(verified.body.data.user.role).toBe(Role.RIDER);
    expect(verified.body.data.user.riderProfile.kycStatus).toBe(KycStatus.REGISTERED);
    riderToken = verified.body.data.accessToken;
    riderId = verified.body.data.user.riderProfile.id;
    riderUserId = verified.body.data.user.id;

    const cash = await request(baseUrl)
      .get('/api/v1/cash-control/me')
      .set('Authorization', `Bearer ${riderToken}`);
    expect(cash.status).toBe(403);
    const orders = await request(baseUrl)
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${riderToken}`);
    expect(orders.status).toBe(403);
    expect(
      (await request(baseUrl)
        .post('/api/v1/riders/me/shift/start')
        .set('Authorization', `Bearer ${riderToken}`)).status,
    ).toBe(403);
    expect(
      await prisma.auditLog.count({ where: { entityId: riderId, action: 'RIDER_REGISTER' } }),
    ).toBe(1);
  });

  it('rejects invalid and infected images, submits KYC, and supports review, rejection, and resubmission', async () => {
    const invalidType = await request(baseUrl)
      .post('/api/v1/riders/me/kyc/upload-url')
      .set('Authorization', `Bearer ${riderToken}`)
      .send({ contentType: 'application/pdf', contentLength: image.length });
    expect(invalidType.status).toBe(400);
    const oversized = await request(baseUrl)
      .post('/api/v1/riders/me/kyc/upload-url')
      .set('Authorization', `Bearer ${riderToken}`)
      .send({ contentType: 'image/png', contentLength: 5 * 1024 * 1024 + 1 });
    expect(oversized.status).toBe(400);

    const infected = await uploadImage(Buffer.concat([image, Buffer.from('EICAR')]));
    const clean = await uploadImage(image);
    const infectedSubmit = await submit(infected.objectKey, clean.objectKey);
    expect(infectedSubmit.status).toBe(400);
    expect(infectedSubmit.body.error.message).toMatch(/malware/i);

    const invalidImage = await uploadImage(Buffer.from('not an image'));
    const validImage = await uploadImage(image);
    const invalidImageSubmit = await submit(invalidImage.objectKey, validImage.objectKey);
    expect(invalidImageSubmit.status).toBe(400);
    expect(invalidImageSubmit.body.error.message).toMatch(/contents do not match/i);

    const firstDocs = await uploadPair();
    tamperNextClamScan = () => {
      const current = objects.get(firstDocs.drivingLicence.objectKey);
      if (!current) throw new Error('Test KYC upload was not found for race simulation');
      const body = Buffer.concat([current.body, Buffer.from('EICAR')]);
      objects.set(firstDocs.drivingLicence.objectKey, {
        body,
        contentType: current.contentType,
        etag: etagFor(body),
      });
    };
    const changedDuringScan = await submit(
      firstDocs.drivingLicence.objectKey,
      firstDocs.vehicleLicence.objectKey,
    );
    expect(changedDuringScan.status).toBe(409);
    expect(
      (await request(baseUrl)
        .get('/api/v1/riders/me/kyc')
        .set('Authorization', `Bearer ${riderToken}`)).body.data.kycStatus,
    ).toBe(KycStatus.REGISTERED);

    const cleanDocs = await uploadPair();
    const submitted = await submit(
      cleanDocs.drivingLicence.objectKey,
      cleanDocs.vehicleLicence.objectKey,
    );
    expect(submitted.status).toBe(201);
    expect(submitted.body.data.kycStatus).toBe(KycStatus.KYC_SUBMITTED);
    expect(JSON.stringify(submitted.body.data)).not.toContain('rider-kyc/');

    const overwrittenUpload = await fetch(cleanDocs.drivingLicence.uploadUrl, {
      method: 'PUT',
      headers: cleanDocs.drivingLicence.requiredHeaders,
      body: Buffer.concat([image, Buffer.from('EICAR')]),
    });
    expect(overwrittenUpload.status).toBe(200);

    const queue = await request(baseUrl)
      .get('/api/v1/riders/review-queue')
      .set('Authorization', `Bearer ${superAdminToken}`);
    expect(queue.status).toBe(200);
    expect(queue.body.data.items.some((item: { id: string }) => item.id === riderId)).toBe(true);

    const review = await request(baseUrl)
      .get(`/api/v1/riders/review-queue/${riderId}`)
      .set('Authorization', `Bearer ${superAdminToken}`);
    expect(review.status).toBe(200);
    expect(JSON.stringify(review.body.data)).not.toContain('rider-kyc/');

    const documentUrl = await request(baseUrl)
      .get(`/api/v1/riders/${riderId}/kyc/driving-licence/url`)
      .set('Authorization', `Bearer ${superAdminToken}`);
    expect(documentUrl.status).toBe(200);
    const downloaded = await fetch(documentUrl.body.data.url);
    expect(downloaded.status).toBe(200);
    expect(Buffer.from(await downloaded.arrayBuffer())).toEqual(image);

    const rejected = await request(baseUrl)
      .post(`/api/v1/riders/${riderId}/reject`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ reason: 'Vehicle licence image needs to be clearer' });
    expect(rejected.status).toBe(201);
    expect(rejected.body.data.kycStatus).toBe(KycStatus.REJECTED);
    expect(rejected.body.data.rejectionReason).toBe('Vehicle licence image needs to be clearer');

    const secondDocs = await uploadPair();
    const resubmitted = await submit(
      secondDocs.drivingLicence.objectKey,
      secondDocs.vehicleLicence.objectKey,
    );
    expect(resubmitted.status).toBe(201);
    expect(resubmitted.body.data.kycStatus).toBe(KycStatus.KYC_SUBMITTED);
    expect(
      await prisma.auditLog.count({
        where: {
          entityId: riderId,
          action: { in: ['RIDER_KYC_SUBMIT', 'RIDER_KYC_REJECT'] },
        },
      }),
    ).toBe(3);
  });

  it('approves with store and rider type, records notifications, then suspends and revokes sessions', async () => {
    const approved = await request(baseUrl)
      .post(`/api/v1/riders/${riderId}/approve`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ storeId, riderType: RiderType.FREELANCE });
    expect(approved.status).toBe(201);
    expect(approved.body.data.kycStatus).toBe(KycStatus.APPROVED);
    expect(approved.body.data.assignedStoreId).toBe(storeId);
    expect(approved.body.data.riderType).toBe(RiderType.FREELANCE);
    const shiftStarted = await request(baseUrl)
      .post('/api/v1/riders/me/shift/start')
      .set('Authorization', `Bearer ${riderToken}`);
    expect(shiftStarted.status).toBe(201);
    expect(shiftStarted.body.data.isShiftActive).toBe(true);
    const shiftStopped = await request(baseUrl)
      .post('/api/v1/riders/me/shift/stop')
      .set('Authorization', `Bearer ${riderToken}`);
    expect(shiftStopped.status).toBe(201);
    expect(shiftStopped.body.data.isShiftActive).toBe(false);
    const loginOtp = await request(baseUrl)
      .post('/api/v1/auth/rider/otp-request')
      .send({ destination: riderPhone });
    expect(loginOtp.status).toBe(200);
    const login = await request(baseUrl)
      .post('/api/v1/auth/rider/otp-verify')
      .send({
        destination: riderPhone,
        code: loginOtp.body.data.demoCode,
        deviceId: `kyc-login-${suffix}`,
      });
    expect(login.status).toBe(200);
    expect(JSON.stringify(login.body.data.user.riderProfile)).not.toContain('rider-kyc/');
    expect(login.body.data.user.riderProfile.kycStatus).toBe(KycStatus.APPROVED);
    expect(
      (await request(baseUrl)
        .get('/api/v1/cash-control/me')
        .set('Authorization', `Bearer ${riderToken}`)).status,
    ).toBe(200);

    const suspended = await request(baseUrl)
      .post(`/api/v1/riders/${riderId}/suspend`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ reason: 'Policy review required' });
    expect(suspended.status).toBe(201);
    expect(suspended.body.data.kycStatus).toBe(KycStatus.SUSPENDED);
    expect(
      (await request(baseUrl)
        .get('/api/v1/riders/me/kyc')
        .set('Authorization', `Bearer ${riderToken}`)).status,
    ).toBe(401);

    const stateNotifications = await prisma.notification.findMany({
      where: {
        recipientUserId: riderUserId,
        metadata: { path: ['event'], equals: 'RIDER_KYC_STATE_CHANGED' },
      },
    });
    expect(stateNotifications).toHaveLength(18);
    expect(new Set(stateNotifications.map((item) => item.channel))).toEqual(
      new Set([
        NotificationChannel.SMS,
        NotificationChannel.EMAIL,
        NotificationChannel.PUSH,
      ]),
    );
    expect(stateNotifications.every((item) => item.status === NotificationStatus.SENT)).toBe(true);
    expect(
      await prisma.auditLog.count({
        where: {
          entityId: riderId,
          action: {
            in: [
              'RIDER_REGISTER',
              'RIDER_KYC_SUBMIT',
              'RIDER_KYC_REJECT',
              'RIDER_KYC_APPROVE',
              'RIDER_SHIFT_START',
              'RIDER_SHIFT_STOP',
              'RIDER_SUSPEND',
            ],
          },
        },
      }),
    ).toBe(8);
  });

  async function uploadPair() {
    const driving = await uploadImage(image);
    const vehicle = await uploadImage(image);
    return { drivingLicence: driving, vehicleLicence: vehicle };
  }

  async function uploadImage(bytes: Buffer) {
    const response = await request(baseUrl)
      .post('/api/v1/riders/me/kyc/upload-url')
      .set('Authorization', `Bearer ${riderToken}`)
      .send({ contentType: 'image/png', contentLength: bytes.length });
    expect(response.status).toBe(201);
    const data = response.body.data as {
      uploadUrl: string;
      objectKey: string;
      requiredHeaders: Record<string, string>;
    };
    const uploaded = await fetch(data.uploadUrl, {
      method: 'PUT',
      headers: data.requiredHeaders,
      body: bytes,
    });
    expect(uploaded.status).toBe(200);
    return data;
  }

  async function submit(drivingLicenceObjectKey: string, vehicleLicenceObjectKey: string) {
    return request(baseUrl)
      .post('/api/v1/riders/me/kyc/submit')
      .set('Authorization', `Bearer ${riderToken}`)
      .send({
        bikeNumber: 'BATT-1234',
        drivingLicenceObjectKey,
        vehicleLicenceObjectKey,
      });
  }

  async function startStorageServer() {
    storageServer = createServer((req, res) => {
      const parts = new URL(req.url ?? '/', 'http://127.0.0.1').pathname
        .split('/')
        .filter(Boolean);
      parts.shift();
      const key = decodeURIComponent(parts.join('/'));
      if (req.method === 'PUT') {
        const copySource = req.headers['x-amz-copy-source'];
        if (typeof copySource === 'string') {
          const sourceParts = decodeURIComponent(copySource).split('/').filter(Boolean);
          sourceParts.shift();
          const sourceKey = sourceParts.join('/');
          const source = objects.get(sourceKey);
          if (!source) {
            res.writeHead(404);
            res.end();
            return;
          }
          const ifMatch = req.headers['x-amz-copy-source-if-match'];
          if (typeof ifMatch === 'string' && ifMatch !== source.etag) {
            res.writeHead(412);
            res.end();
            return;
          }
          objects.set(key, {
            body: Buffer.from(source.body),
            contentType: req.headers['content-type'] ?? source.contentType,
            etag: source.etag,
          });
          res.writeHead(200, { 'Content-Type': 'application/xml' });
          res.end(
            `<CopyObjectResult><LastModified>2026-11-17T00:00:00.000Z</LastModified><ETag>${source.etag}</ETag></CopyObjectResult>`,
          );
          return;
        }
        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', () => {
          const body = Buffer.concat(chunks);
          const etag = etagFor(body);
          objects.set(key, {
            body,
            contentType: req.headers['content-type'] ?? 'application/octet-stream',
            etag,
          });
          res.writeHead(200, { ETag: etag });
          res.end();
        });
        return;
      }

      if (req.method === 'DELETE') {
        objects.delete(key);
        res.writeHead(204);
        res.end();
        return;
      }

      const stored = objects.get(key);
      if (!stored) {
        res.writeHead(404);
        res.end();
        return;
      }
      if (req.method === 'HEAD') {
        res.writeHead(200, {
          'Content-Length': stored.body.length,
          'Content-Type': stored.contentType,
          ETag: stored.etag,
        });
        res.end();
        return;
      }
      if (req.method === 'GET') {
        const range = req.headers.range?.match(/^bytes=(\d+)-(\d+)$/);
        const start = range ? Number(range[1]) : 0;
        const end = range
          ? Math.min(Number(range[2]), stored.body.length - 1)
          : stored.body.length - 1;
        const body = stored.body.subarray(start, end + 1);
        res.writeHead(range ? 206 : 200, {
          'Content-Length': body.length,
          'Content-Type': stored.contentType,
          ETag: stored.etag,
          ...(range
            ? { 'Content-Range': `bytes ${start}-${end}/${stored.body.length}` }
            : {}),
        });
        res.end(body);
        return;
      }
      res.writeHead(405);
      res.end();
    });
    await listen(storageServer, 4415);
  }

  async function startClamServer() {
    clamServer = createTcpServer((socket: Socket) => {
      const chunks: Buffer[] = [];
      socket.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      socket.on('end', () => {
        const bytes = Buffer.concat(chunks);
        tamperNextClamScan?.();
        tamperNextClamScan = undefined;
        const infected = bytes.includes(Buffer.from('EICAR'));
        socket.end(infected ? 'stream: Eicar-Test-Signature FOUND\0' : 'stream: OK\0');
      });
    });
    await listen(clamServer, 4416);
  }

  async function listen(server: Server | TcpServer, port: number) {
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, '127.0.0.1', resolve);
    });
  }

  function etagFor(bytes: Buffer) {
    return `"${createHash('md5').update(bytes).digest('hex')}"`;
  }

  async function closeServer(server?: Server | TcpServer) {
    if (server?.listening) {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
      });
    }
  }

  async function waitForApi() {
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      if (apiProcess?.exitCode !== null) {
        throw new Error(`Rider onboarding API exited with code ${apiProcess?.exitCode}`);
      }
      try {
        const response = await fetch(`${baseUrl}/health`);
        if (response.ok) return;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
    throw new Error('Rider onboarding API did not become healthy within 30 seconds');
  }
});
