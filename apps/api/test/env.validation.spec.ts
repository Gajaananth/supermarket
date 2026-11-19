import { describe, expect, it } from 'vitest';
import {
  accessTokenLifetimeSeconds,
  validateEnv,
} from '../src/config/env.validation';

const validConfig = {
  NODE_ENV: 'development',
  DATABASE_URL: 'postgresql://localhost:5433/buyme',
  JWT_SECRET: 'a'.repeat(32),
  JWT_REFRESH_SECRET: 'b'.repeat(32),
};

describe('Environment validation', () => {
  it('requires distinct access and refresh secrets of at least 32 characters', () => {
    expect(() => validateEnv({
      ...validConfig,
      JWT_REFRESH_SECRET: validConfig.JWT_SECRET,
    })).toThrow(/JWT_REFRESH_SECRET/);

    expect(() => validateEnv({
      ...validConfig,
      JWT_SECRET: 'too-short',
    })).toThrow(/JWT_SECRET/);
  });

  it('rejects OTP development mode in production', () => {
    expect(() => validateEnv({
      ...validConfig,
      NODE_ENV: 'production',
      OTP_DEV_MODE: 'true',
    })).toThrow(/OTP_DEV_MODE/);
  });

  it('allows demo OTP only in production-runtime staging with a six-digit secret', () => {
    const config = validateEnv({
      ...validConfig,
      NODE_ENV: 'production',
      APP_ENV: 'staging',
      CORS_ALLOWED_ORIGINS: 'https://staging.buyme.example',
      OSM_CONTACT_EMAIL: 'ops@example.com',
      FIREBASE_SERVICE_ACCOUNT_JSON: JSON.stringify({
        project_id: 'buyme-staging',
        client_email: 'firebase@example.com',
        private_key: 'private-key',
      }),
      CLAMAV_HOST: 'clamav.internal',
      OBJECT_STORAGE_BUCKET: 'buyme-private',
      DEMO_OTP_ENABLED: 'true',
      DEMO_OTP_CODE: '246810',
    });

    expect(config.DEMO_OTP_ENABLED).toBe(true);
    expect(config.DEMO_OTP_CODE).toBe('246810');

    expect(() => validateEnv({
      ...validConfig,
      DEMO_OTP_ENABLED: 'true',
      DEMO_OTP_CODE: '246810',
    })).toThrow(/DEMO_OTP_ENABLED/);
    expect(() => validateEnv({
      ...validConfig,
      NODE_ENV: 'production',
      APP_ENV: 'staging',
      DEMO_OTP_ENABLED: 'true',
    })).toThrow(/DEMO_OTP_CODE/);
  });

  it('requires Twilio credentials when Twilio SMS delivery is selected', () => {
    expect(() => validateEnv({
      ...validConfig,
      SMS_PROVIDER: 'twilio',
    })).toThrow(/TWILIO_ACCOUNT_SID/);
  });

  it('requires Resend credentials when email notifications are enabled', () => {
    expect(() => validateEnv({
      ...validConfig,
      EMAIL_PROVIDER: 'resend',
    })).toThrow(/RESEND_API_KEY/);
    expect(validateEnv({
      ...validConfig,
      EMAIL_PROVIDER: 'resend',
      RESEND_API_KEY: 'test-key',
      EMAIL_FROM: 'noreply@example.com',
    }).EMAIL_PROVIDER).toBe('resend');
  });

  it('requires paired OneSignal credentials and a production malware scanner', () => {
    expect(() => validateEnv({
      ...validConfig,
      ONESIGNAL_APP_ID: '98adbf14-0f83-4d38-9af7-45e1c0c4189a',
    })).toThrow(/OneSignal/);
    expect(() => validateEnv({
      ...validConfig,
      NODE_ENV: 'production',
      OBJECT_STORAGE_BUCKET: 'buyme-private',
    })).toThrow(/CLAMAV_HOST/);
  });

  it('accepts empty optional Twilio variables when SMS is not configured', () => {
    const config = validateEnv({
      ...validConfig,
      TWILIO_ACCOUNT_SID: '',
      TWILIO_AUTH_TOKEN: '',
      TWILIO_FROM_NUMBER: '',
    });

    expect(config.SMS_PROVIDER).toBe('none');
    expect(config.TWILIO_ACCOUNT_SID).toBeUndefined();
  });

  it('validates S3-compatible private storage settings and credential pairs', () => {
    const config = validateEnv({
      ...validConfig,
      OBJECT_STORAGE_ENDPOINT: 'http://127.0.0.1:9000',
      OBJECT_STORAGE_BUCKET: 'buyme-private',
      OBJECT_STORAGE_ACCESS_KEY_ID: 'test-access-key',
      OBJECT_STORAGE_SECRET_ACCESS_KEY: 'test-secret-key',
      OBJECT_STORAGE_FORCE_PATH_STYLE: 'true',
      OBJECT_STORAGE_PRESIGN_TTL_SECONDS: '300',
    });

    expect(config.OBJECT_STORAGE_FORCE_PATH_STYLE).toBe(true);
    expect(config.OBJECT_STORAGE_PRESIGN_TTL_SECONDS).toBe(300);
    expect(() => validateEnv({
      ...validConfig,
      OBJECT_STORAGE_ENDPOINT: 'http://127.0.0.1:9000',
      OBJECT_STORAGE_BUCKET: 'buyme-private',
    })).toThrow(/credentials/);
  });

  it('requires HTTPS and a configured bucket for production object storage', () => {
    expect(() => validateEnv({
      ...validConfig,
      NODE_ENV: 'production',
      OBJECT_STORAGE_ENDPOINT: 'http://storage.example.invalid',
      OBJECT_STORAGE_BUCKET: 'buyme-private',
      OBJECT_STORAGE_ACCESS_KEY_ID: 'test-access-key',
      OBJECT_STORAGE_SECRET_ACCESS_KEY: 'test-secret-key',
    })).toThrow(/HTTPS/);
  });

  it('coerces and validates numeric settings', () => {
    const config = validateEnv({
      ...validConfig,
      PORT: '5432',
      OTP_TTL_MINUTES: '5',
    });

    expect(config.PORT).toBe(5432);
    expect(config.OTP_TTL_MINUTES).toBe(5);
  });

  it('validates access-token lifetime units and maps them to JWT seconds', () => {
    expect(accessTokenLifetimeSeconds('15m')).toBe(900);
    expect(accessTokenLifetimeSeconds('2h')).toBe(7200);
    expect(() => validateEnv({
      ...validConfig,
      ACCESS_TOKEN_EXPIRES_IN: 'invalid',
    })).toThrow(/ACCESS_TOKEN_EXPIRES_IN/);
  });

  it('parses a CORS origin allowlist and rejects URLs that are not origins', () => {
    expect(validateEnv({
      ...validConfig,
      CORS_ALLOWED_ORIGINS: ' https://admin.example.com,https://shop.example.com ',
    }).CORS_ALLOWED_ORIGINS).toEqual([
      'https://admin.example.com',
      'https://shop.example.com',
    ]);

    expect(() => validateEnv({
      ...validConfig,
      CORS_ALLOWED_ORIGINS: 'https://admin.example.com/path',
    })).toThrow(/CORS_ALLOWED_ORIGINS/);
    expect(() => validateEnv({
      ...validConfig,
      CORS_ALLOWED_ORIGINS: 'http://untrusted.example.com',
    })).toThrow(/CORS_ALLOWED_ORIGINS/);
    expect(() => validateEnv({
      ...validConfig,
      CORS_ALLOWED_ORIGINS: '',
    })).toThrow(/CORS_ALLOWED_ORIGINS/);
  });

  it('rejects localhost CORS origins in production', () => {
    expect(() => validateEnv({
      ...validConfig,
      NODE_ENV: 'production',
      FIREBASE_SERVICE_ACCOUNT_JSON: JSON.stringify({
        project_id: 'buyme',
        client_email: 'firebase@example.com',
        private_key: 'private-key',
      }),
      SMS_PROVIDER: 'twilio',
      TWILIO_ACCOUNT_SID: `AC${'a'.repeat(32)}`,
      TWILIO_AUTH_TOKEN: 'test-token',
      TWILIO_FROM_NUMBER: '+12345678901',
      EMAIL_PROVIDER: 'resend',
      RESEND_API_KEY: 'test-key',
      EMAIL_FROM: 'noreply@example.com',
      CLAMAV_HOST: 'clamav.internal',
      OBJECT_STORAGE_BUCKET: 'buyme-private',
    })).toThrow(/CORS_ALLOWED_ORIGINS/);
  });
});
