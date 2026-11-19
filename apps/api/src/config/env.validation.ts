import { z } from 'zod';

export const DEFAULT_CORS_ALLOWED_ORIGINS = 'http://localhost:3000,http://127.0.0.1:3000';

export function parseCorsAllowedOrigins(value?: string): string[] {
  return (value ?? DEFAULT_CORS_ALLOWED_ORIGINS)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function accessTokenLifetimeSeconds(value: string): number {
  const match = /^([1-9]\d*)(s|m|h|d)$/.exec(value);
  if (!match) {
    throw new Error('ACCESS_TOKEN_EXPIRES_IN must be a positive duration in seconds, minutes, hours, or days');
  }

  const amount = Number(match[1]);
  const multiplier = match[2] === 's' ? 1
    : match[2] === 'm' ? 60
      : match[2] === 'h' ? 3600
        : 86400;
  const seconds = amount * multiplier;
  if (!Number.isSafeInteger(seconds)) {
    throw new Error('ACCESS_TOKEN_EXPIRES_IN exceeds the supported duration');
  }
  return seconds;
}

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_ENV: z.enum(['development', 'staging', 'production']).optional(),
  CORS_ALLOWED_ORIGINS: z.string()
    .default(DEFAULT_CORS_ALLOWED_ORIGINS)
    .transform(parseCorsAllowedOrigins)
    .refine((origins) => origins.length > 0, 'At least one CORS origin must be configured')
    .refine(
      (origins) => origins.every((origin) => {
        try {
          const parsed = new URL(origin);
          return parsed.origin === origin &&
            (parsed.protocol === 'https:' ||
              (parsed.protocol === 'http:' &&
                (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')));
        } catch {
          return false;
        }
      }),
      'CORS_ALLOWED_ORIGINS must contain HTTPS origins (HTTP is allowed only for localhost)',
    ),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().min(1),
  ORDER_ACCEPT_TIMEOUT_SECONDS: z.coerce.number().int().min(1).max(3600).default(300),
  ORDER_TIMEOUT_SWEEP_CRON: z.string().min(1).default('* * * * *'),
  PG_BOSS_SCHEMA: z.preprocess(
    (value) => value === '' ? undefined : value,
    z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/).optional(),
  ),
  SOCKET_EVENT_LIMIT: z.coerce.number().int().min(1).max(1000).default(60),
  SOCKET_EVENT_WINDOW_SECONDS: z.coerce.number().int().min(1).max(3600).default(60),
  OSM_CONTACT_EMAIL: z.preprocess(
    (value) => value === '' ? undefined : value,
    z.string().email().optional(),
  ),
  OSM_NOMINATIM_URL: z.string().url().default('https://nominatim.openstreetmap.org'),
  OSM_ROUTING_URL: z.string().url().default('https://router.project-osrm.org'),
  OSM_MIN_INTERVAL_MS: z.coerce.number().int().min(0).max(60000).default(1000),
  MAP_CACHE_TTL_SECONDS: z.coerce.number().int().min(1).max(86400).default(3600),
  MAP_CACHE_MAX_ENTRIES: z.coerce.number().int().min(10).max(10000).default(1000),
  STORAGE_LOCAL_DIR: z.string().min(1).default('E:/buyme-tools/storage'),
  OBJECT_STORAGE_ENDPOINT: z.preprocess(
    (value) => value === '' ? undefined : value,
    z.string().url().optional(),
  ),
  OBJECT_STORAGE_REGION: z.string().min(1).default('us-east-1'),
  OBJECT_STORAGE_BUCKET: z.preprocess(
    (value) => value === '' ? undefined : value,
    z.string().regex(/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/).optional(),
  ),
  OBJECT_STORAGE_ACCESS_KEY_ID: z.preprocess(
    (value) => value === '' ? undefined : value,
    z.string().min(1).optional(),
  ),
  OBJECT_STORAGE_SECRET_ACCESS_KEY: z.preprocess(
    (value) => value === '' ? undefined : value,
    z.string().min(1).optional(),
  ),
  OBJECT_STORAGE_FORCE_PATH_STYLE: z.enum(['true', 'false']).default('false').transform(
    (value) => value === 'true',
  ),
  OBJECT_STORAGE_PRESIGN_TTL_SECONDS: z.coerce.number().int().min(60).max(600).default(600),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_EXPIRES_IN: z.string()
    .regex(/^[1-9]\d*(s|m|h|d)$/)
    .default('15m'),
  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  SMS_PROVIDER: z.enum(['none', 'twilio']).default('none'),
  EMAIL_PROVIDER: z.enum(['none', 'resend']).default('none'),
  RESEND_API_KEY: z.preprocess(
    (value) => value === '' ? undefined : value,
    z.string().min(1).optional(),
  ),
  EMAIL_FROM: z.preprocess(
    (value) => value === '' ? undefined : value,
    z.string().email().optional(),
  ),
  ONESIGNAL_APP_ID: z.preprocess(
    (value) => value === '' ? undefined : value,
    z.string().uuid().optional(),
  ),
  ONESIGNAL_REST_API_KEY: z.preprocess(
    (value) => value === '' ? undefined : value,
    z.string().min(1).optional(),
  ),
  FIREBASE_SERVICE_ACCOUNT_JSON: z.preprocess(
    (value) => value === '' ? undefined : value,
    z.string().min(1).optional(),
  ),
  CLAMAV_HOST: z.preprocess(
    (value) => value === '' ? undefined : value,
    z.string().min(1).optional(),
  ),
  CLAMAV_PORT: z.coerce.number().int().min(1).max(65535).default(3310),
  TWILIO_ACCOUNT_SID: z.preprocess(
    (value) => value === '' ? undefined : value,
    z.string().regex(/^AC[a-f0-9]{32}$/i).optional(),
  ),
  TWILIO_AUTH_TOKEN: z.preprocess(
    (value) => value === '' ? undefined : value,
    z.string().min(1).optional(),
  ),
  TWILIO_FROM_NUMBER: z.preprocess(
    (value) => value === '' ? undefined : value,
    z.string().regex(/^\+[1-9][0-9]{1,14}$/).optional(),
  ),
  OTP_DEV_MODE: z.enum(['true', 'false']).default('false').transform((value) => value === 'true'),
  DEMO_OTP_ENABLED: z.enum(['true', 'false']).default('false').transform((value) => value === 'true'),
  DEMO_OTP_CODE: z.preprocess(
    (value) => value === '' ? undefined : value,
    z.string().regex(/^\d{6}$/).optional(),
  ),
  OTP_TTL_MINUTES: z.coerce.number().int().min(1).max(15).default(5),
  OTP_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(10).default(3),
  THROTTLE_TTL_SECONDS: z.coerce.number().int().min(1).default(60),
  THROTTLE_LIMIT: z.coerce.number().int().min(1).default(100),
}).superRefine((config, context) => {
  const appEnvironment = config.APP_ENV ??
    (config.NODE_ENV === 'production' ? 'production' : 'development');
  const isNonDevelopment = appEnvironment !== 'development';

  if (
    (appEnvironment === 'development' && config.NODE_ENV === 'production') ||
    (isNonDevelopment && config.NODE_ENV !== 'production')
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['APP_ENV'],
      message: 'Staging and production require NODE_ENV=production; development cannot use NODE_ENV=production',
    });
  }

  if (config.JWT_SECRET === config.JWT_REFRESH_SECRET) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['JWT_REFRESH_SECRET'],
      message: 'JWT access and refresh secrets must be different',
    });
  }

  if (config.OTP_DEV_MODE && (config.NODE_ENV !== 'development' || appEnvironment !== 'development')) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['OTP_DEV_MODE'],
      message: 'OTP development mode is allowed only in local development',
    });
  }

  if (config.DEMO_OTP_ENABLED && (config.APP_ENV !== 'staging' || config.NODE_ENV !== 'production')) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['DEMO_OTP_ENABLED'],
      message: 'Demo OTP is allowed only when APP_ENV=staging and NODE_ENV=production',
    });
  }

  if (config.DEMO_OTP_ENABLED && !config.DEMO_OTP_CODE) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['DEMO_OTP_CODE'],
      message: 'A six-digit DEMO_OTP_CODE is required when demo OTP is enabled',
    });
  }

  if (
    isNonDevelopment &&
    config.CORS_ALLOWED_ORIGINS.some((origin) => {
      const { hostname } = new URL(origin);
      return hostname === 'localhost' || hostname === '127.0.0.1';
    })
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['CORS_ALLOWED_ORIGINS'],
      message: 'Production CORS origins must not use localhost',
    });
  }

  if (isNonDevelopment && !config.OSM_CONTACT_EMAIL) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['OSM_CONTACT_EMAIL'],
      message: 'OSM_CONTACT_EMAIL is required in production',
    });
  }

  if (isNonDevelopment && config.OSM_MIN_INTERVAL_MS < 1000) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['OSM_MIN_INTERVAL_MS'],
      message: 'OSM_MIN_INTERVAL_MS must be at least 1000 in production',
    });
  }

  if (isNonDevelopment && !config.FIREBASE_SERVICE_ACCOUNT_JSON) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['FIREBASE_SERVICE_ACCOUNT_JSON'],
      message: 'Firebase service account is required in production',
    });
  }

  if (isNonDevelopment && !config.DEMO_OTP_ENABLED && config.SMS_PROVIDER === 'none') {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['SMS_PROVIDER'],
      message: 'A production SMS provider is required for order notifications',
    });
  }

  if (isNonDevelopment && !config.DEMO_OTP_ENABLED && config.EMAIL_PROVIDER === 'none') {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['EMAIL_PROVIDER'],
      message: 'A production email provider is required for order notifications',
    });
  }

  for (const key of ['OSM_NOMINATIM_URL', 'OSM_ROUTING_URL'] as const) {
    if (isNonDevelopment && config[key].startsWith('http://')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [key],
        message: `${key} must use HTTPS in production`,
      });
    }
  }

  if (config.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const serviceAccount: unknown = JSON.parse(config.FIREBASE_SERVICE_ACCOUNT_JSON);
      if (
        typeof serviceAccount !== 'object' ||
        serviceAccount === null ||
        !('project_id' in serviceAccount) ||
        !('client_email' in serviceAccount) ||
        !('private_key' in serviceAccount)
      ) {
        throw new Error('Missing required service account fields');
      }
    } catch {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['FIREBASE_SERVICE_ACCOUNT_JSON'],
        message: 'FIREBASE_SERVICE_ACCOUNT_JSON must be valid service-account JSON',
      });
    }
  }

  if (Boolean(config.OBJECT_STORAGE_ACCESS_KEY_ID) !== Boolean(config.OBJECT_STORAGE_SECRET_ACCESS_KEY)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['OBJECT_STORAGE_SECRET_ACCESS_KEY'],
      message: 'Object storage access key ID and secret must be configured together',
    });
  }

  if (config.OBJECT_STORAGE_ENDPOINT && !config.OBJECT_STORAGE_BUCKET) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['OBJECT_STORAGE_BUCKET'],
      message: 'OBJECT_STORAGE_BUCKET is required when an object storage endpoint is configured',
    });
  }

  if (
    config.OBJECT_STORAGE_ENDPOINT &&
    (!config.OBJECT_STORAGE_ACCESS_KEY_ID || !config.OBJECT_STORAGE_SECRET_ACCESS_KEY)
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['OBJECT_STORAGE_ACCESS_KEY_ID'],
      message: 'S3-compatible endpoints require explicit access key credentials',
    });
  }

  if (
    isNonDevelopment &&
    config.OBJECT_STORAGE_ENDPOINT?.startsWith('http://')
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['OBJECT_STORAGE_ENDPOINT'],
      message: 'Object storage endpoint must use HTTPS in production',
    });
  }

  if (isNonDevelopment && !config.CLAMAV_HOST) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['CLAMAV_HOST'],
      message: 'CLAMAV_HOST is required in production to accept rider KYC documents',
    });
  }

  if (isNonDevelopment && !config.OBJECT_STORAGE_BUCKET) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['OBJECT_STORAGE_BUCKET'],
      message: 'OBJECT_STORAGE_BUCKET is required in production',
    });
  }

  if (/^C:[\\/]/i.test(config.STORAGE_LOCAL_DIR)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['STORAGE_LOCAL_DIR'],
      message: 'Product image storage cannot use the C: drive',
    });
  }

  if (config.SMS_PROVIDER === 'twilio') {
    for (const key of ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM_NUMBER'] as const) {
      if (!config[key]) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${key} is required when SMS_PROVIDER is twilio`,
        });
      }
    }
  }

  if (config.EMAIL_PROVIDER === 'resend') {
    for (const key of ['RESEND_API_KEY', 'EMAIL_FROM'] as const) {
      if (!config[key]) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${key} is required when EMAIL_PROVIDER is resend`,
        });
      }
    }
  }

  if (Boolean(config.ONESIGNAL_APP_ID) !== Boolean(config.ONESIGNAL_REST_API_KEY)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['ONESIGNAL_REST_API_KEY'],
      message: 'OneSignal app ID and REST API key must be configured together',
    });
  }
});

export type EnvironmentVariables = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Config validation error: ${JSON.stringify(result.error.format())}`);
  }
  return result.data;
}
