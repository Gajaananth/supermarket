import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface IEmailProvider {
  sendEmail(to: string, subject: string, body: string): Promise<boolean>;
}

@Injectable()
export class EmailProviderAdapter implements IEmailProvider {
  private readonly logger = new Logger(EmailProviderAdapter.name);

  constructor(private readonly configService: ConfigService) {}

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    const isDev = this.configService.get<boolean>('OTP_DEV_MODE', true);

    if (isDev && process.env.NODE_ENV === 'development') {
      this.logger.log(`✉️ [DEV EMAIL] To: ${to} | Subject: "${subject}" | Content: "${body}"`);
      return true;
    }

    if (process.env.NODE_ENV === 'test') return true;

    if (this.configService.get<string>('EMAIL_PROVIDER', 'none') === 'resend') {
      return this.sendWithResend(to, subject, body);
    }

    throw new ServiceUnavailableException('Email delivery provider is not configured');
  }

  private async sendWithResend(to: string, subject: string, body: string): Promise<boolean> {
    const apiKey = this.configService.getOrThrow<string>('RESEND_API_KEY');
    const from = this.configService.getOrThrow<string>('EMAIL_FROM');
    let response: Response;
    try {
      response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to: [to], subject, text: body }),
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      this.logger.error(
        'Email provider request failed',
        error instanceof Error ? error.stack : undefined,
      );
      throw new ServiceUnavailableException('Email provider request failed');
    }

    if (!response.ok) {
      this.logger.error(`Email provider returned HTTP ${response.status}`);
      throw new ServiceUnavailableException('Email provider rejected the message');
    }
    return true;
  }
}
