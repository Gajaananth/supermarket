import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ISmsProvider {
  sendSms(to: string, message: string): Promise<boolean>;
}

@Injectable()
export class SmsProviderAdapter implements ISmsProvider {
  private readonly logger = new Logger(SmsProviderAdapter.name);

  constructor(private readonly configService: ConfigService) {}

  async sendSms(to: string, message: string): Promise<boolean> {
    const isDev = this.configService.get<boolean>('OTP_DEV_MODE', false);

    if (isDev && process.env.NODE_ENV === 'development') {
      this.logger.log(`📱 [DEV SMS] To: ${to} | Message: "${message}"`);
      return true;
    }

    if (process.env.NODE_ENV === 'test') return true;

    if (this.configService.get<string>('SMS_PROVIDER', 'none') === 'twilio') {
      return this.sendWithTwilio(to, message);
    }

    throw new ServiceUnavailableException('SMS delivery provider is not configured');
  }

  private async sendWithTwilio(to: string, message: string): Promise<boolean> {
    const accountSid = this.configService.getOrThrow<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.getOrThrow<string>('TWILIO_AUTH_TOKEN');
    const fromNumber = this.configService.getOrThrow<string>('TWILIO_FROM_NUMBER');
    const authorization = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const body = new URLSearchParams({
      To: to,
      From: fromNumber,
      Body: message,
    });
    let response: Response;

    try {
      response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${authorization}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body,
          signal: AbortSignal.timeout(10_000),
        },
      );
    } catch (error) {
      this.logger.error('Twilio SMS request failed', error instanceof Error ? error.stack : undefined);
      throw new ServiceUnavailableException('SMS delivery provider request failed');
    }

    if (!response.ok) {
      this.logger.error(`Twilio returned HTTP ${response.status}`);
      throw new ServiceUnavailableException('SMS provider rejected the message');
    }

    return true;
  }
}
