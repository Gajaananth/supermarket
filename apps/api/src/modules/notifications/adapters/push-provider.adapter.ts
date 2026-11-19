import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PushProviderAdapter {
  private readonly logger = new Logger(PushProviderAdapter.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async sendPush(externalUserId: string, title: string, body: string): Promise<boolean> {
    if (process.env.NODE_ENV === 'test') return true;
    if (process.env.NODE_ENV === 'development' && this.config.get<boolean>('OTP_DEV_MODE')) {
      this.logger.log(`[DEV PUSH] User: ${externalUserId} | ${title}: ${body}`);
      return true;
    }

    const firebaseCredentials = this.config.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON');
    if (firebaseCredentials) {
      return this.sendWithFirebase(externalUserId, title, body, firebaseCredentials);
    }

    const appId = this.config.get<string>('ONESIGNAL_APP_ID');
    const apiKey = this.config.get<string>('ONESIGNAL_REST_API_KEY');
    if (!appId || !apiKey) {
      throw new ServiceUnavailableException('Push notification provider is not configured');
    }

    let response: Response;
    try {
      response = await fetch('https://api.onesignal.com/notifications', {
        method: 'POST',
        headers: {
          Authorization: `Key ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: appId,
          target_channel: 'push',
          include_aliases: { external_id: [externalUserId] },
          headings: { en: title },
          contents: { en: body },
        }),
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      this.logger.error(
        'Push provider request failed',
        error instanceof Error ? error.stack : undefined,
      );
      throw new ServiceUnavailableException('Push notification provider request failed');
    }

    if (!response.ok) {
      this.logger.error(`Push provider returned HTTP ${response.status}`);
      throw new ServiceUnavailableException('Push provider rejected the message');
    }
    return true;
  }

  private async sendWithFirebase(
    userId: string,
    title: string,
    body: string,
    credentialsJson: string,
  ) {
    const sessions = await this.prisma.deviceSession.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
        pushToken: { not: null },
      },
      select: { pushToken: true },
    });
    const tokens = [...new Set(
      sessions.map((session) => session.pushToken).filter((token): token is string => !!token),
    )];
    if (tokens.length === 0) {
      throw new ServiceUnavailableException('No active Firebase device tokens are registered');
    }

    let app = getApps().find((candidate) => candidate.name === 'buyme-firebase-push');
    if (!app) {
      try {
        const serviceAccount = JSON.parse(credentialsJson) as Record<string, unknown>;
        if (
          typeof serviceAccount.project_id !== 'string' ||
          typeof serviceAccount.client_email !== 'string' ||
          typeof serviceAccount.private_key !== 'string'
        ) {
          throw new Error('Invalid service account fields');
        }
        app = initializeApp({
          credential: cert({
            projectId: serviceAccount.project_id,
            clientEmail: serviceAccount.client_email,
            privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
          }),
          projectId: serviceAccount.project_id,
        }, 'buyme-firebase-push');
      } catch {
        throw new ServiceUnavailableException('Firebase service account configuration is invalid');
      }
    }

    const messaging = getMessaging(app);
    const invalidTokens: string[] = [];
    let delivered = 0;
    for (let offset = 0; offset < tokens.length; offset += 500) {
      const batch = tokens.slice(offset, offset + 500);
      let response;
      try {
        response = await messaging.sendEachForMulticast({
          tokens: batch,
          notification: { title, body },
        });
      } catch (error) {
        this.logger.error(
          'Firebase push request failed',
          error instanceof Error ? error.stack : undefined,
        );
        throw new ServiceUnavailableException('Firebase push request failed');
      }
      delivered += response.successCount;
      response.responses.forEach((result, index) => {
        if (
          !result.success &&
          result.error &&
          ['messaging/invalid-registration-token', 'messaging/registration-token-not-registered']
            .includes(result.error.code)
        ) {
          invalidTokens.push(batch[index]);
        }
      });
    }

    if (invalidTokens.length > 0) {
      await this.prisma.deviceSession.updateMany({
        where: { pushToken: { in: invalidTokens } },
        data: { pushToken: null },
      });
    }
    if (delivered === 0) {
      throw new ServiceUnavailableException('Firebase rejected all registered device tokens');
    }
    return true;
  }
}
