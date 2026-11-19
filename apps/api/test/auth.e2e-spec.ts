import 'reflect-metadata';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import 'dotenv/config';
import { ChildProcess, spawn } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { once } from 'node:events';
import request from 'supertest';
import { PrismaClient, Role } from '@prisma/client';
import argon2 from 'argon2';

describe('Authentication & Security E2E Test Suite', () => {
  const baseUrl = 'http://127.0.0.1:4401';
  const prisma = new PrismaClient();
  const testPhone = `+9477${Math.floor(1000000 + Math.random() * 9000000)}`;
  const attemptLimitPhone = `+9477${Math.floor(1000000 + Math.random() * 9000000)}`;
  const testRiderPhone = `+9477${Math.floor(1000000 + Math.random() * 9000000)}`;
  const testRiderEmail = `e2e-rider-${randomUUID()}@example.invalid`;
  const testAdmin = {
    email: `e2e-admin-${randomUUID()}@example.invalid`,
    password: `test-admin-${randomUUID()}`,
  };
  const testSuperAdmin = {
    email: `e2e-super-admin-${randomUUID()}@example.invalid`,
    password: `test-super-admin-${randomUUID()}`,
  };
  const testIps = new Set<string>();
  const testIp = () => {
    const ip = `198.51.100.${Math.floor(Math.random() * 254) + 1}`;
    testIps.add(ip);
    return ip;
  };
  let testStartedAt: Date;
  let apiProcess: ChildProcess | undefined;

  beforeAll(async () => {
    await prisma.$connect();
    testStartedAt = new Date();
    await prisma.user.create({
      data: {
        email: testAdmin.email,
        passwordHash: await argon2.hash(testAdmin.password),
        fullName: 'E2E Store Admin',
        role: Role.STORE_ADMIN,
      },
    });
    await prisma.user.create({
      data: {
        email: testSuperAdmin.email,
        passwordHash: await argon2.hash(testSuperAdmin.password),
        fullName: 'E2E Super Admin',
        role: Role.SUPER_ADMIN,
        isTwoFactorEnabled: true,
      },
    });
    await prisma.user.create({
      data: {
        phone: testRiderPhone,
        role: Role.RIDER,
        fullName: 'E2E Rider Phone',
        riderProfile: { create: {} },
      },
    });
    await prisma.user.create({
      data: {
        email: testRiderEmail,
        role: Role.RIDER,
        fullName: 'E2E Rider Email',
        riderProfile: { create: {} },
      },
    });

    apiProcess = spawn(process.execPath, ['dist/main.js'], {
      cwd: process.cwd(),
      env: { ...process.env, HOST: '127.0.0.1', NODE_ENV: 'test', PORT: '4401' },
      stdio: 'ignore',
      windowsHide: true,
    });

    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      if (apiProcess.exitCode !== null) {
        throw new Error(`API process exited with code ${apiProcess.exitCode}`);
      }

      try {
        const response = await fetch(`${baseUrl}/health`);
        const body = await response.json() as { data?: { database?: string } };
        if (response.ok && body.data?.database === 'ok') return;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    throw new Error('API did not become healthy within 30 seconds');
  }, 35_000);

  afterAll(async () => {
    if (apiProcess && apiProcess.exitCode === null) {
      const exited = once(apiProcess, 'exit');
      apiProcess.kill();
      await Promise.race([
        exited,
        new Promise((resolve) => setTimeout(resolve, 5_000)),
      ]);
    }

    await prisma.auditLog.deleteMany({
      where: {
        createdAt: { gte: testStartedAt },
        action: { contains: '/api/v1/auth' },
      },
    });
    await prisma.deviceSession.deleteMany({
      where: {
        createdAt: { gte: testStartedAt },
        deviceId: {
          in: [
            'device-test-01',
            'attempt-limit-test',
            'logout-device',
            'rider-phone-01',
            'rider-tablet-01',
            'admin-laptop-01',
            'superadmin-workstation',
            'device-session-test',
            'refresh-race-device',
            'rbac-device',
          ],
        },
      },
    });
    await prisma.otpRequest.deleteMany({
      where: {
        createdAt: { gte: testStartedAt },
        destination: {
          in: [
            testPhone,
            attemptLimitPhone,
            testRiderPhone,
            testRiderEmail,
            testSuperAdmin.email,
          ],
        },
      },
    });
    if (testIps.size > 0) {
      await prisma.rateLimitRecord.deleteMany({
        where: {
          endpoint: { in: ['otp_request_ip', 'otp_request_destination'] },
          OR: [
            { key: { in: [...testIps] } },
            {
              key: {
                in: [testPhone, attemptLimitPhone, testRiderPhone, testRiderEmail],
              },
            },
          ],
        },
      });
    }
    await prisma.user.deleteMany({
      where: {
        createdAt: { gte: testStartedAt },
        OR: [
          { phone: { in: [testPhone, attemptLimitPhone, testRiderPhone] } },
          { email: { in: [testAdmin.email, testSuperAdmin.email, testRiderEmail] } },
        ],
      },
    });
    await prisma.$disconnect();
  });

  describe('1. Health & Documentation Endpoints', () => {
    it('GET /health returns 200 with database connectivity and latency', async () => {
      const res = await request(baseUrl).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ok');
      expect(res.body.data.database).toBe('ok');
      expect(res.body.data.service).toBe('buyme-api');
    });

    it('GET /docs serves the Swagger UI', async () => {
      const res = await request(baseUrl).get('/docs/');
      expect(res.status).toBe(200);
      expect(res.text).toContain('Swagger UI');
    });

    it('GET /docs-json exposes the generated OpenAPI document', async () => {
      const res = await request(baseUrl).get('/docs-json');
      expect(res.status).toBe(200);
      expect(res.body.info.title).toBe('BuyMe Hyperlocal Delivery Platform API');
      expect(res.body.paths['/api/v1/auth/customer/otp-request']).toBeDefined();
    });

    it('rejects coordinates outside valid latitude and longitude ranges', async () => {
      const res = await request(baseUrl)
        .post('/api/v1/stores/find-nearest')
        .send({ latitude: 91, longitude: 81.693 });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

  });

  describe('2. Customer OTP Authentication Flow', () => {
    const forwardedIp = testIp();

    it('requests OTP, rate limits after 3 requests, and verifies code', async () => {
      // Attempt 1
      const res1 = await request(baseUrl)
        .post('/api/v1/auth/customer/otp-request')
        .set('X-Forwarded-For', forwardedIp)
        .send({ phone: testPhone });

      expect(res1.status).toBe(200);
      expect(res1.body.success).toBe(true);
      expect(res1.body.data.demoCode).toBeDefined();

      // Attempt 2
      const res2 = await request(baseUrl)
        .post('/api/v1/auth/customer/otp-request')
        .set('X-Forwarded-For', forwardedIp)
        .send({ phone: testPhone });
      expect(res2.status).toBe(200);

      // Attempt 3
      const res3 = await request(baseUrl)
        .post('/api/v1/auth/customer/otp-request')
        .set('X-Forwarded-For', forwardedIp)
        .send({ phone: testPhone });
      expect(res3.status).toBe(200);
      const demoCode = res3.body.data.demoCode;
      const otpRecord = await prisma.otpRequest.findFirst({
        where: { destination: testPhone },
        orderBy: { createdAt: 'desc' },
      });
      expect(otpRecord?.codeHash).toMatch(/^[a-f0-9]{64}$/);
      expect(otpRecord?.codeHash).not.toBe(demoCode);

      // Attempt 4 -> 429 Too Many Requests
      const res4 = await request(baseUrl)
        .post('/api/v1/auth/customer/otp-request')
        .set('X-Forwarded-For', forwardedIp)
        .send({ phone: testPhone });
      expect(res4.status).toBe(429);
      expect(res4.body.success).toBe(false);

      // Invalid OTP verification attempt -> 400
      const invalidRes = await request(baseUrl)
        .post('/api/v1/auth/customer/otp-verify')
        .send({
          phone: testPhone,
          code: '000000',
          deviceId: 'device-test-01',
        });
      expect(invalidRes.status).toBe(400);

      // Valid OTP verification -> 200 with JWT and rotating refresh token
      const validRes = await request(baseUrl)
        .post('/api/v1/auth/customer/otp-verify')
        .send({
          phone: testPhone,
          code: demoCode,
          deviceId: 'device-test-01',
        });

      expect(validRes.status).toBe(200);
      expect(validRes.body.success).toBe(true);
      expect(validRes.body.data.accessToken).toBeDefined();
      expect(validRes.body.data.refreshToken).toBeDefined();
      expect(validRes.body.data.user.role).toBe('CUSTOMER');
      const refreshTokenHash = createHash('sha256')
        .update(validRes.body.data.refreshToken)
        .digest('hex');
      expect(await prisma.deviceSession.findUnique({
        where: { refreshTokenHash },
      })).not.toBeNull();

      const pushToken = `fcm-test-token-${randomUUID()}`;
      const registeredPushToken = await request(baseUrl)
        .post('/api/v1/auth/push-token')
        .set('Authorization', `Bearer ${validRes.body.data.accessToken}`)
        .send({ deviceId: 'device-test-01', pushToken });
      expect(registeredPushToken.status).toBe(200);
      expect(registeredPushToken.body.data).toEqual({ registered: true });
      expect(await prisma.deviceSession.findFirst({
        where: { pushToken, isRevoked: false },
      })).not.toBeNull();

      const unknownDevice = await request(baseUrl)
        .post('/api/v1/auth/push-token')
        .set('Authorization', `Bearer ${validRes.body.data.accessToken}`)
        .send({ deviceId: 'not-this-device', pushToken: `fcm-test-token-${randomUUID()}` });
      expect(unknownDevice.status).toBe(401);
    });

    it('locks the code after the configured number of failed verification attempts', async () => {
      const forwardedIp = testIp();
      const requestRes = await request(baseUrl)
        .post('/api/v1/auth/customer/otp-request')
        .set('X-Forwarded-For', forwardedIp)
        .send({ phone: attemptLimitPhone });
      expect(requestRes.status).toBe(200);

      for (let attempt = 0; attempt < 3; attempt++) {
        const verifyRes = await request(baseUrl)
          .post('/api/v1/auth/customer/otp-verify')
          .send({
            phone: attemptLimitPhone,
            code: '000000',
            deviceId: 'attempt-limit-test',
          });
        expect(verifyRes.status).toBe(400);
      }

      const verifyRes = await request(baseUrl)
        .post('/api/v1/auth/customer/otp-verify')
        .send({
          phone: attemptLimitPhone,
          code: requestRes.body.data.demoCode,
          deviceId: 'attempt-limit-test',
        });
      expect(verifyRes.status).toBe(400);
      expect(verifyRes.body.error.message).toMatch(/Maximum verification attempts exceeded/);
    });
  });

  describe('3. Rider OTP Authentication Flow (Phone & Email)', () => {
    it('rejects invalid rider phone and email destinations', async () => {
      const reqRes = await request(baseUrl)
        .post('/api/v1/auth/rider/otp-request')
        .set('X-Forwarded-For', testIp())
        .send({ destination: 'not-a-phone-or-email' });

      expect(reqRes.status).toBe(400);
      expect(reqRes.body.success).toBe(false);
    });

    it('authenticates rider via registered phone number', async () => {
      const forwardedIp = testIp();

      const reqRes = await request(baseUrl)
        .post('/api/v1/auth/rider/otp-request')
        .set('X-Forwarded-For', forwardedIp)
        .send({ destination: testRiderPhone });

      expect(reqRes.status).toBe(200);
      const { demoCode } = reqRes.body.data;

      const verifyRes = await request(baseUrl)
        .post('/api/v1/auth/rider/otp-verify')
        .send({
          destination: testRiderPhone,
          code: demoCode,
          deviceId: 'rider-phone-01',
        });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.data.user.role).toBe('RIDER');
      expect(verifyRes.body.data.accessToken).toBeDefined();
    });

    it('authenticates rider via registered email address', async () => {
      const forwardedIp = testIp();

      const reqRes = await request(baseUrl)
        .post('/api/v1/auth/rider/otp-request')
        .set('X-Forwarded-For', forwardedIp)
        .send({ destination: testRiderEmail });

      expect(reqRes.status).toBe(200);
      const { demoCode } = reqRes.body.data;

      const verifyRes = await request(baseUrl)
        .post('/api/v1/auth/rider/otp-verify')
        .send({
          destination: testRiderEmail,
          code: demoCode,
          deviceId: 'rider-tablet-01',
        });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.data.user.role).toBe('RIDER');
      expect(verifyRes.body.data.user.email).toBe(testRiderEmail);
    });
  });

  describe('4. Admin Password (Argon2) & 2FA Flow', () => {
    it('authenticates Store Admin with Email + Argon2 Password directly (no 2FA)', async () => {
      const res = await request(baseUrl)
        .post('/api/v1/auth/admin/login')
        .send({
          email: testAdmin.email,
          password: testAdmin.password,
          deviceId: 'admin-laptop-01',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('STORE_ADMIN');
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('rejects incorrect admin password with 401 Unauthorized', async () => {
      const res = await request(baseUrl)
        .post('/api/v1/auth/admin/login')
        .send({
          email: testAdmin.email,
          password: `wrong-${randomUUID()}`,
          deviceId: 'admin-laptop-01',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('triggers 2FA for Super Admin and authenticates upon 2FA verification', async () => {
      // 1. Initial login returns requires2fa: true
      const loginRes = await request(baseUrl)
        .post('/api/v1/auth/admin/login')
        .send({
          email: testSuperAdmin.email,
          password: testSuperAdmin.password,
          deviceId: 'superadmin-workstation',
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.requires2fa).toBe(true);
      const demo2faCode = loginRes.body.data.demoCode;

      // 2. Verify 2FA code
      const verify2faRes = await request(baseUrl)
        .post('/api/v1/auth/admin/verify-2fa')
        .send({
          email: testSuperAdmin.email,
          code: demo2faCode,
          deviceId: 'superadmin-workstation',
        });

      expect(verify2faRes.status).toBe(200);
      expect(verify2faRes.body.data.user.role).toBe('SUPER_ADMIN');
      expect(verify2faRes.body.data.accessToken).toBeDefined();
      expect(verify2faRes.body.data.refreshToken).toBeDefined();
    });
  });

  describe('5. Rotating Refresh Tokens & Replay Attack Defense', () => {
    it('rotates refresh token and invalidates all sessions upon replay attack', async () => {
      // 1. Login Store Admin
      const loginRes = await request(baseUrl)
        .post('/api/v1/auth/admin/login')
        .send({
          email: testAdmin.email,
          password: testAdmin.password,
          deviceId: 'device-session-test',
        });

      const initialRefreshToken = loginRes.body.data.refreshToken;
      const pushToken = `fcm-refresh-token-${randomUUID()}`;
      const registerPush = await request(baseUrl)
        .post('/api/v1/auth/push-token')
        .set('Authorization', `Bearer ${loginRes.body.data.accessToken}`)
        .send({ deviceId: 'device-session-test', pushToken });
      expect(registerPush.status).toBe(200);

      // 2. Rotate refresh token legitimately
      const rotateRes = await request(baseUrl)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: initialRefreshToken });

      expect(rotateRes.status).toBe(200);
      const rotatedRefreshToken = rotateRes.body.data.refreshToken;
      expect(rotatedRefreshToken).not.toBe(initialRefreshToken);
      expect(await prisma.deviceSession.findFirst({
        where: {
          refreshTokenHash: createHash('sha256').update(rotatedRefreshToken).digest('hex'),
        },
        select: { pushToken: true, isRevoked: true },
      })).toMatchObject({ pushToken, isRevoked: false });

      // 3. Replay Attack: Attacker attempts to reuse the old initialRefreshToken!
      const replayRes = await request(baseUrl)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: initialRefreshToken });

      // Must be rejected with 401 and trigger full session revocation!
      expect(replayRes.status).toBe(401);
      expect(await prisma.deviceSession.count({
        where: { user: { email: testAdmin.email }, pushToken: { not: null } },
      })).toBe(0);

      // 4. Verify that the rotated token is NOW ALSO INVALIDATED because of replay attack!
      const postAttackRes = await request(baseUrl)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: rotatedRefreshToken });

      expect(postAttackRes.status).toBe(401);
    });

    it('allows only one concurrent rotation and revokes the token family on replay', async () => {
      const loginRes = await request(baseUrl)
        .post('/api/v1/auth/admin/login')
        .send({
          email: testAdmin.email,
          password: testAdmin.password,
          deviceId: 'refresh-race-device',
        });
      expect(loginRes.status).toBe(200);

      const refreshToken = loginRes.body.data.refreshToken;
      const rotations = await Promise.all([
        request(baseUrl).post('/api/v1/auth/refresh').send({ refreshToken }),
        request(baseUrl).post('/api/v1/auth/refresh').send({ refreshToken }),
      ]);
      expect(rotations.map((response) => response.status).sort()).toEqual([200, 401]);

      const issuedToken = rotations.find((response) => response.status === 200)!.body.data.refreshToken;
      const reuseRes = await request(baseUrl)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: issuedToken });
      expect(reuseRes.status).toBe(401);
    });
  });

  describe('6. Device Session Logout', () => {
    it('revokes the device refresh token and rejects its reuse', async () => {
      const loginRes = await request(baseUrl)
        .post('/api/v1/auth/admin/login')
        .send({
          email: testAdmin.email,
          password: testAdmin.password,
          deviceId: 'logout-device',
        });
      expect(loginRes.status).toBe(200);

      const refreshToken = loginRes.body.data.refreshToken;
      const logoutRes = await request(baseUrl)
        .post('/api/v1/auth/logout')
        .send({ refreshToken });
      expect(logoutRes.status).toBe(200);

      const reuseRes = await request(baseUrl)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });
      expect(reuseRes.status).toBe(401);
    });
  });

  describe('7. RBAC Guards & Audit Log Trail', () => {
    it('guards /auth/me with JWT and rejects unauthenticated requests', async () => {
      const unauthRes = await request(baseUrl).get('/api/v1/auth/me');
      expect(unauthRes.status).toBe(401);

      // Login Store Admin
      const loginRes = await request(baseUrl)
        .post('/api/v1/auth/admin/login')
        .send({
          email: testAdmin.email,
          password: testAdmin.password,
          deviceId: 'rbac-device',
        });

      const token = loginRes.body.data.accessToken;

      const authRes = await request(baseUrl)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(authRes.status).toBe(200);
      expect(authRes.body.data.user.email).toBe(testAdmin.email);

      // Check Audit Log was recorded
      const recentLogs = await prisma.auditLog.findMany({
        where: { action: { contains: '/api/v1/auth/admin/login' } },
      });
      expect(recentLogs.length).toBeGreaterThan(0);
    });
  });
});
