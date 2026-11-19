import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../src/modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from '../src/modules/notifications/notification.service';
import argon2 from 'argon2';
import crypto from 'node:crypto';

describe('AuthService (Unit Tests)', () => {
  let authService: AuthService;
  let mockPrisma: any;
  let mockJwtService: any;
  let mockConfigService: any;
  let mockNotificationService: any;

  beforeEach(() => {
    mockPrisma = {
      otpRequest: {
        create: vi.fn().mockResolvedValue({ id: 'otp-1' }),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      rateLimitRecord: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        upsert: vi.fn().mockResolvedValue({ hitCount: 1 }),
      },
      user: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      deviceSession: {
        create: vi.fn().mockResolvedValue({ id: 'sess-1' }),
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
      },
      $transaction: vi.fn(async (callback: (transaction: any) => unknown) => callback(mockPrisma)),
    };

    mockJwtService = {
      sign: vi.fn().mockReturnValue('mock-jwt-token'),
    };

    mockConfigService = {
      get: vi.fn((key: string, defaultVal: any) => defaultVal),
    };

    mockNotificationService = {
      sendOtp: vi.fn().mockResolvedValue(true),
    };

    authService = new AuthService(
      mockPrisma,
      mockJwtService,
      mockConfigService,
      mockNotificationService
    );
  });

  describe('Password Hashing with Argon2', () => {
    it('correctly hashes and verifies passwords using argon2', async () => {
      const password = 'SuperSecret@2026!';
      const hash = await argon2.hash(password);
      expect(hash).toContain('$argon2id$');

      const isValid = await argon2.verify(hash, password);
      expect(isValid).toBe(true);

      const isInvalid = await argon2.verify(hash, 'WrongPassword');
      expect(isInvalid).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('throws 429 when destination requests exceed 3 within 5 minutes', async () => {
      mockPrisma.rateLimitRecord.upsert.mockResolvedValue({ hitCount: 4 });

      await expect(
        authService.requestCustomerOtp({ phone: '+94770001111' })
      ).rejects.toThrow();
    });

    describe('Staging demo OTP', () => {
      it('uses the configured code only for a seeded demo customer and skips delivery', async () => {
        mockPrisma.user.findFirst.mockResolvedValue({
          role: 'CUSTOMER',
          isDemoAccount: true,
        });
        mockConfigService.get.mockImplementation((key: string, defaultVal: any) => {
          if (key === 'DEMO_OTP_ENABLED') return true;
          if (key === 'DEMO_OTP_CODE') return '246810';
          return defaultVal;
        });

        const response = await authService.requestCustomerOtp({
          phone: '+94772220001',
        });

        expect(response.demoCode).toBe('246810');
        expect(mockPrisma.otpRequest.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            codeHash: crypto.createHash('sha256').update('246810').digest('hex'),
          }),
        });
        expect(mockNotificationService.sendOtp).not.toHaveBeenCalled();
      });

      it('does not expose or skip delivery for a non-demo customer', async () => {
        mockPrisma.user.findFirst.mockResolvedValue({
          role: 'CUSTOMER',
          isDemoAccount: false,
        });
        mockConfigService.get.mockImplementation((key: string, defaultVal: any) => {
          if (key === 'DEMO_OTP_ENABLED') return true;
          if (key === 'DEMO_OTP_CODE') return '246810';
          return defaultVal;
        });

        const response = await authService.requestCustomerOtp({
          phone: '+94770001111',
        });

        expect(response).not.toHaveProperty('demoCode');
        expect(mockNotificationService.sendOtp).toHaveBeenCalledWith(
          '+94770001111',
          expect.stringMatching(/^\d{6}$/),
        );
      });

      it('uses a separate rider OTP purpose and shows the code only for a demo rider', async () => {
        mockPrisma.user.findFirst.mockResolvedValue({
          role: 'RIDER',
          isDemoAccount: true,
        });
        mockConfigService.get.mockImplementation((key: string, defaultVal: any) => {
          if (key === 'DEMO_OTP_ENABLED') return true;
          if (key === 'DEMO_OTP_CODE') return '246810';
          return defaultVal;
        });

        const response = await authService.requestRiderOtp({
          destination: '+94771110001',
        });

        expect(response.demoCode).toBe('246810');
        expect(mockPrisma.otpRequest.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            purpose: 'RIDER_LOGIN',
            codeHash: crypto.createHash('sha256').update('246810').digest('hex'),
          }),
        });
        expect(mockNotificationService.sendOtp).not.toHaveBeenCalled();
      });

      it('does not accept a customer LOGIN OTP through the rider verification flow', async () => {
        mockPrisma.otpRequest.findFirst.mockImplementation(({ where }: any) =>
          where.purpose === 'LOGIN'
            ? {
                id: 'customer-login-otp',
                codeHash: crypto.createHash('sha256').update('246810').digest('hex'),
                attemptsCount: 0,
              }
            : null,
        );

        await expect(
          authService.verifyRiderOtp({
            destination: '+94772220001',
            code: '246810',
            deviceId: 'device-1',
          }),
        ).rejects.toThrow(/invalid or has expired/);
        expect(mockPrisma.otpRequest.findFirst).toHaveBeenCalledWith({
          where: expect.objectContaining({ purpose: 'RIDER_LOGIN' }),
          orderBy: { createdAt: 'desc' },
        });
        expect(mockPrisma.otpRequest.update).not.toHaveBeenCalled();
      });

      it('rejects customer OTP requests for non-customer roles', async () => {
        mockPrisma.user.findFirst.mockResolvedValue({
          role: 'RIDER',
          isDemoAccount: true,
        });

        await expect(
          authService.requestCustomerOtp({ phone: '+94771110001' }),
        ).rejects.toThrow(/Customer account not available/);
        expect(mockPrisma.otpRequest.create).not.toHaveBeenCalled();
        expect(mockNotificationService.sendOtp).not.toHaveBeenCalled();
      });

      it('does not consume a customer-purpose OTP to authenticate a different role', async () => {
        mockPrisma.otpRequest.findFirst.mockResolvedValue({
          id: 'otp-role-crossover',
          codeHash: crypto.createHash('sha256').update('246810').digest('hex'),
          attemptsCount: 0,
        });
        mockPrisma.user.findFirst.mockResolvedValue({
          role: 'RIDER',
          isActive: true,
        });

        await expect(
          authService.verifyCustomerOtp({
            phone: '+94771110001',
            code: '246810',
            deviceId: 'device-1',
          }),
        ).rejects.toThrow(/not available for this account/);
        expect(mockPrisma.otpRequest.update).not.toHaveBeenCalled();
      });
    });

    it('applies the per-IP threshold independently of the destination threshold', async () => {
      mockPrisma.rateLimitRecord.upsert
        .mockResolvedValueOnce({ hitCount: 1 })
        .mockResolvedValueOnce({ hitCount: 11 });

      await expect(
        authService.requestCustomerOtp({ phone: '+94770001111' }, '198.51.100.10'),
      ).rejects.toThrow(/Too many requests from this IP address/);
      expect(mockPrisma.rateLimitRecord.upsert).toHaveBeenCalledTimes(2);
    });
  });

  describe('Replay Attack Prevention', () => {
    it('invalidates ALL sessions when a revoked refresh token is re-submitted', async () => {
      mockPrisma.deviceSession.findUnique.mockResolvedValue({
        id: 'sess-compromised',
        userId: 'user-victim-01',
        isRevoked: true, // Already used and rotated!
        expiresAt: new Date(Date.now() + 1000000),
      });

      await expect(
        authService.refreshSession({ refreshToken: 'stolen-token' })
      ).rejects.toThrow(/Refresh token reuse detected/);

      expect(mockPrisma.deviceSession.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-victim-01' },
        data: { isRevoked: true, pushToken: null },
      });
    });
  });

  describe('Logout everywhere', () => {
    it('revokes every active device session and writes an audit event', async () => {
      mockPrisma.deviceSession.updateMany.mockResolvedValue({ count: 3 });

      await expect(authService.logoutAll({
        id: 'admin-1',
        role: 'SUPER_ADMIN',
        fullName: 'Test Admin',
      })).resolves.toEqual({ revokedSessions: 3 });

      expect(mockPrisma.deviceSession.updateMany).toHaveBeenCalledWith({
        where: { userId: 'admin-1', isRevoked: false },
        data: { isRevoked: true, pushToken: null },
      });
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'admin-1',
          action: 'AUTH_LOGOUT_ALL',
          entityType: 'User',
          entityId: 'admin-1',
          newValues: { revokedSessions: 3 },
        }),
      });
    });
  });
});
