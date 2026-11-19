import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { EmailProviderAdapter } from '../src/modules/notifications/adapters/email-provider.adapter';
import { SmsProviderAdapter } from '../src/modules/notifications/adapters/sms-provider.adapter';

describe('Notification provider adapters', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('logs OTP delivery only in development mode', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const log = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    const config = new ConfigService({ OTP_DEV_MODE: true });

    await new SmsProviderAdapter(config).sendSms('+94770000000', 'OTP message');
    await new EmailProviderAdapter(config).sendEmail(
      'test@example.invalid',
      'Verification',
      'OTP message',
    );

    expect(log).toHaveBeenCalledTimes(2);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('[DEV SMS]'));
    expect(log).toHaveBeenCalledWith(expect.stringContaining('[DEV EMAIL]'));
  });

  it('fails explicitly when production delivery providers are not configured', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const config = new ConfigService({ OTP_DEV_MODE: false });

    await expect(
      new SmsProviderAdapter(config).sendSms('+94770000000', 'OTP message'),
    ).rejects.toThrow(ServiceUnavailableException);
    await expect(
      new EmailProviderAdapter(config).sendEmail(
        'test@example.invalid',
        'Verification',
        'OTP message',
      ),
    ).rejects.toThrow(ServiceUnavailableException);
  });

  it('sends SMS through Twilio with form-encoded data and HTTP basic auth', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const accountSid = `AC${'a'.repeat(32)}`;
    const authToken = 'test-auth-token';
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        new Response('{}', { status: 201 }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const adapter = new SmsProviderAdapter(new ConfigService({
      OTP_DEV_MODE: false,
      SMS_PROVIDER: 'twilio',
      TWILIO_ACCOUNT_SID: accountSid,
      TWILIO_AUTH_TOKEN: authToken,
      TWILIO_FROM_NUMBER: '+12025550123',
    }));

    await expect(adapter.sendSms('+94770000000', 'OTP message')).resolves.toBe(true);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    );
    expect(options?.headers).toMatchObject({
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
    });
    expect(new URLSearchParams(options?.body as string).get('To')).toBe('+94770000000');
    expect(new URLSearchParams(options?.body as string).get('Body')).toBe('OTP message');
  });

  it('reports Twilio HTTP failures without treating them as successful delivery', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const errorLog = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 401 })),
    );
    const adapter = new SmsProviderAdapter(new ConfigService({
      OTP_DEV_MODE: false,
      SMS_PROVIDER: 'twilio',
      TWILIO_ACCOUNT_SID: `AC${'a'.repeat(32)}`,
      TWILIO_AUTH_TOKEN: 'test-auth-token',
      TWILIO_FROM_NUMBER: '+12025550123',
    }));

    await expect(
      adapter.sendSms('+94770000000', 'OTP message'),
    ).rejects.toThrow(ServiceUnavailableException);
    expect(errorLog).toHaveBeenCalledWith('Twilio returned HTTP 401');
  });
});
