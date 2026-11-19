import { Injectable, Logger } from '@nestjs/common';
import { Notification, NotificationChannel, OrderStatus, Prisma, Role } from '@prisma/client';
import { SmsProviderAdapter } from './adapters/sms-provider.adapter';
import { EmailProviderAdapter } from './adapters/email-provider.adapter';
import { PushProviderAdapter } from './adapters/push-provider.adapter';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly smsProvider: SmsProviderAdapter,
    private readonly emailProvider: EmailProviderAdapter,
    private readonly pushProvider: PushProviderAdapter,
    private readonly prisma: PrismaService,
  ) {}

  async sendOtp(destination: string, otpCode: string): Promise<boolean> {
    const isEmail = destination.includes('@');
    const message = `Your BuyMe Supermarket verification code is ${otpCode}. Valid for 5 minutes. Do not share this code.`;

    if (isEmail) {
      return this.emailProvider.sendEmail(
        destination,
        'Your BuyMe Verification Code',
        message
      );
    } else {
      return this.smsProvider.sendSms(destination, message);
    }
  }

  async sendStateChange(
    channel: NotificationChannel,
    userId: string,
    phone: string | null,
    email: string | null,
    title: string,
    body: string,
  ): Promise<boolean> {
    switch (channel) {
      case NotificationChannel.SMS:
        if (!phone) throw new Error('Rider has no phone number for SMS notification');
        return this.smsProvider.sendSms(phone, body);
      case NotificationChannel.EMAIL:
        if (!email) throw new Error('Rider has no email address for email notification');
        return this.emailProvider.sendEmail(email, title, body);
      case NotificationChannel.PUSH:
        return this.pushProvider.sendPush(userId, title, body);
      case NotificationChannel.IN_APP:
        return true;
    }
  }

  async queueRiderStateChange(
    tx: Prisma.TransactionClient,
    rider: { id: string },
    state: string,
    title: string,
    body: string,
  ): Promise<Notification[]> {
    const metadata = { event: 'RIDER_KYC_STATE_CHANGED', riderId: rider.id, state };
    const channels = [
      NotificationChannel.SMS,
      NotificationChannel.EMAIL,
      NotificationChannel.PUSH,
    ];
    const notifications: Notification[] = [];
    for (const channel of channels) {
      notifications.push(await tx.notification.create({
        data: {
          recipientUserId: rider.id,
          channel,
          title,
          body,
          metadata,
        },
      }));
    }
    return notifications;
  }

  async queueOrderStateChange(
    tx: Prisma.TransactionClient,
    order: {
      id: string;
      orderNumber: string;
      customerId: string;
      storeId: string;
      riderId: string | null;
    },
    status: OrderStatus,
    previousRiderId?: string | null,
    notifySuperAdmins = false,
  ) {
    const customer = await tx.customerProfile.findUnique({
      where: { id: order.customerId },
      select: { userId: true },
    });
    const storeAdmins = await tx.storeAdmin.findMany({
      where: { storeId: order.storeId },
      select: { userId: true },
    });
    const riderIds = [...new Set([order.riderId, previousRiderId].filter(
      (id): id is string => !!id,
    ))];
    const riders = riderIds.length > 0
      ? await tx.riderProfile.findMany({
          where: { id: { in: riderIds } },
          select: { userId: true },
        })
      : [];
    const superAdmins = notifySuperAdmins
      ? await tx.user.findMany({
          where: { role: Role.SUPER_ADMIN, isActive: true },
          select: { id: true },
        })
      : [];
    const userIds = [...new Set([
      customer?.userId,
      ...storeAdmins.map(({ userId }) => userId),
      ...riders.map(({ userId }) => userId),
      ...superAdmins.map(({ id }) => id),
    ].filter((id): id is string => !!id))];
    if (userIds.length === 0) return [];

    const users = await tx.user.findMany({
      where: { id: { in: userIds }, isActive: true },
      select: { id: true, phone: true, email: true },
    });
    const pushSessions = await tx.deviceSession.findMany({
      where: {
        userId: { in: userIds },
        isRevoked: false,
        expiresAt: { gt: new Date() },
        pushToken: { not: null },
      },
      select: { userId: true },
      distinct: ['userId'],
    });
    const pushUserIds = new Set(pushSessions.map(({ userId }) => userId));
    const title = `Order ${order.orderNumber} update`;
    const body = `Your order status is now ${status.replaceAll('_', ' ').toLowerCase()}.`;
    const metadata = { event: 'ORDER_STATUS_CHANGED', orderId: order.id, status };
    const notifications: Notification[] = [];

    for (const user of users) {
      const channels = new Set<NotificationChannel>([NotificationChannel.IN_APP]);
      if (user.phone) channels.add(NotificationChannel.SMS);
      if (user.email) channels.add(NotificationChannel.EMAIL);
      if (pushUserIds.has(user.id)) channels.add(NotificationChannel.PUSH);
      for (const channel of channels) {
        notifications.push(await tx.notification.create({
          data: {
            recipientUserId: user.id,
            channel,
            title,
            body,
            metadata,
          },
        }));
      }
    }
    return notifications;
  }

  async dispatchRiderStateChange(
    notifications: Notification[],
    recipient: { id: string; phone: string | null; email: string | null },
  ): Promise<void> {
    for (const notification of notifications) {
      try {
        await this.sendStateChange(
          notification.channel,
          recipient.id,
          recipient.phone,
          recipient.email,
          notification.title,
          notification.body,
        );
        await this.prisma.notification.update({
          where: { id: notification.id },
          data: { status: 'SENT', sentAt: new Date(), failureReason: null },
        });
      } catch (error) {
        const failureReason = error instanceof Error
          ? error.message.slice(0, 1000)
          : 'Notification provider failed';
        this.logger.warn(
          `Rider lifecycle ${notification.channel} notification ${notification.id} failed`,
        );
        await this.prisma.notification.update({
          where: { id: notification.id },
          data: { status: 'FAILED', failureReason },
        });
      }
    }
  }

  async dispatchPending() {
      const ids = await this.prisma.$transaction(async (tx) => {
        const staleBefore = new Date(Date.now() - 5 * 60 * 1000);
        await tx.notification.updateMany({
          where: {
            status: 'PROCESSING',
            processingAt: { lt: staleBefore },
            attemptCount: { gte: 3 },
          },
          data: {
            status: 'FAILED',
            processingAt: null,
            failureReason: 'Notification delivery exceeded its retry limit',
          },
        });
        await tx.notification.updateMany({
          where: {
            status: 'PROCESSING',
            processingAt: { lt: staleBefore },
            attemptCount: { lt: 3 },
          },
          data: {
            status: 'QUEUED',
            processingAt: null,
            failureReason: 'Previous notification worker did not finish',
          },
        });
        const rows = await tx.$queryRaw<Array<{ id: string }>>`
          SELECT "id" FROM "Notification"
          WHERE "status" = 'QUEUED' AND "attemptCount" < 3
          ORDER BY "createdAt"
          LIMIT 50
          FOR UPDATE SKIP LOCKED
        `;
        const notificationIds = rows.map(({ id }) => id);
        if (notificationIds.length > 0) {
          await tx.notification.updateMany({
            where: { id: { in: notificationIds }, status: 'QUEUED' },
            data: {
              status: 'PROCESSING',
              processingAt: new Date(),
              attemptCount: { increment: 1 },
            },
          });
        }
        return notificationIds;
      });

      for (const id of ids) {
        const notification = await this.prisma.notification.findUnique({
          where: { id },
          include: {
            recipient: { select: { id: true, phone: true, email: true } },
          },
        });
        if (!notification || notification.status !== 'PROCESSING') continue;
        try {
          await this.sendStateChange(
            notification.channel,
            notification.recipient.id,
            notification.recipient.phone,
            notification.recipient.email,
            notification.title,
            notification.body,
          );
          await this.prisma.notification.update({
            where: { id },
            data: {
              status: 'SENT',
              sentAt: new Date(),
              processingAt: null,
              failureReason: null,
            },
          });
        } catch (error) {
          const failureReason = error instanceof Error
            ? error.message.slice(0, 1000)
            : 'Notification provider failed';
          this.logger.warn(`Order notification ${notification.channel} ${id} failed`);
          await this.prisma.notification.update({
            where: { id },
            data: {
              status: notification.attemptCount >= 3 ? 'FAILED' : 'QUEUED',
              processingAt: null,
              failureReason,
            },
          });
        }
      }
      return ids.length;
  }
}
