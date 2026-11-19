import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { OrderStatus, Role } from '@prisma/client';
import { Namespace, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { parseCorsAllowedOrigins } from '../../config/env.validation';

type SocketIdentity = {
  id: string;
  role: Role;
};

type AuthenticatedSocket = Socket & {
  data: Socket['data'] & { identity?: SocketIdentity };
};

type RiderLocationInput = {
  latitude: number;
  longitude: number;
  heading?: number;
  speedKmh?: number;
};

const activeOrderStatuses: OrderStatus[] = [
  OrderStatus.RIDER_ASSIGNED,
  OrderStatus.PICKED_UP,
  OrderStatus.ON_THE_WAY,
];

@Injectable()
@WebSocketGateway({
  namespace: '/events',
  cors: { origin: [], credentials: true },
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name);
  private readonly rateWindows = new Map<string, { startedAt: number; count: number }>();
  private readonly eventLimit: number;
  private readonly windowMs: number;
  private readonly allowedOrigins: string[];

  @WebSocketServer()
  private server?: Namespace;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.eventLimit = config.get<number>('SOCKET_EVENT_LIMIT', 60);
    this.windowMs = config.get<number>('SOCKET_EVENT_WINDOW_SECONDS', 60) * 1000;
    this.allowedOrigins = config.get<string[]>(
      'CORS_ALLOWED_ORIGINS',
      parseCorsAllowedOrigins(),
    );
  }

  afterInit(server: Namespace) {
    server.server.engine.opts.cors = {
      origin: this.allowedOrigins,
      credentials: true,
    };
  }

  async handleConnection(socket: AuthenticatedSocket) {
    const token = this.accessToken(socket);
    if (!token) {
      socket.disconnect(true);
      return;
    }
    try {
      const payload = await this.jwt.verifyAsync<{ sub?: string; role?: Role }>(token);
      if (!payload.sub || !payload.role) throw new Error('Invalid access-token claims');
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, role: true, isActive: true },
      });
      if (!user || !user.isActive || user.role !== payload.role) {
        throw new Error('Account is inactive or access token is invalid');
      }
      socket.data.identity = { id: user.id, role: user.role };
    } catch (error) {
      this.logger.warn(
        `Socket authentication rejected: ${error instanceof Error ? error.message : 'invalid token'}`,
      );
      socket.disconnect(true);
    }
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    socket.data.identity = undefined;
  }

  @SubscribeMessage('join.order')
  async joinOrder(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() input: { orderId?: string },
  ) {
    this.consume(socket, 'join.order');
    const identity = this.identity(socket);
    if (!isUuid(input?.orderId)) throw new WsException('A valid order ID is required');
    const order = await this.prisma.order.findUnique({
      where: { id: input.orderId },
      select: { id: true, customerId: true, storeId: true, riderId: true },
    });
    if (!order || !(await this.canAccessOrder(identity, order))) {
      throw new WsException('Order access is not allowed');
    }
    await socket.join(`order:${order.id}`);
    return { joined: true, room: `order:${order.id}` };
  }

  @SubscribeMessage('join.store')
  async joinStore(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() input: { storeId?: string },
  ) {
    this.consume(socket, 'join.store');
    const identity = this.identity(socket);
    if (!isUuid(input?.storeId)) throw new WsException('A valid store ID is required');
    const store = await this.prisma.store.findUnique({
      where: { id: input.storeId },
      select: { id: true, isActive: true },
    });
    if (!store?.isActive || !(await this.canAccessStore(identity, store.id))) {
      throw new WsException('Store room access is not allowed');
    }
    await socket.join(`store:${store.id}`);
    return { joined: true, room: `store:${store.id}` };
  }

  @SubscribeMessage('rider.location')
  async updateRiderLocation(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() input: RiderLocationInput,
  ) {
    this.consume(socket, 'rider.location');
    const identity = this.identity(socket);
    if (identity.role !== Role.RIDER || !isValidLocation(input)) {
      throw new WsException('An approved rider and valid location are required');
    }
    const rider = await this.prisma.riderProfile.findUnique({
      where: { userId: identity.id },
      select: {
        id: true,
        assignedStoreId: true,
        kycStatus: true,
        isShiftActive: true,
        user: { select: { isActive: true } },
      },
    });
    if (
      !rider ||
      !rider.user.isActive ||
      rider.kycStatus !== 'APPROVED' ||
      !rider.assignedStoreId ||
      !rider.isShiftActive
    ) {
      throw new WsException('Rider must be approved, active, and assigned to a store');
    }
    const order = await this.prisma.order.findFirst({
      where: { riderId: rider.id, status: { in: activeOrderStatuses } },
      select: { id: true, storeId: true },
    });
    if (!order || order.storeId !== rider.assignedStoreId) {
      throw new WsException('Rider location is available only during an assigned delivery');
    }

    const recordedAt = new Date();
    await this.prisma.$transaction([
      this.prisma.riderProfile.update({
        where: { id: rider.id },
        data: {
          currentLocationLat: input.latitude,
          currentLocationLng: input.longitude,
          lastLocationUpdate: recordedAt,
        },
      }),
      this.prisma.riderLocationHistory.create({
        data: {
          riderId: rider.id,
          orderId: order.id,
          latitude: input.latitude,
          longitude: input.longitude,
          ...(input.heading === undefined ? {} : { heading: input.heading }),
          ...(input.speedKmh === undefined ? {} : { speedKmh: input.speedKmh }),
          recordedAt,
        },
      }),
    ]);

    const location = {
      orderId: order.id,
      riderId: rider.id,
      latitude: input.latitude,
      longitude: input.longitude,
      heading: input.heading,
      speedKmh: input.speedKmh,
      recordedAt: recordedAt.toISOString(),
    };
    this.server?.to(`order:${order.id}`).emit('rider.location', location);
    this.server?.to(`store:${rider.assignedStoreId}`).emit('rider.location', location);
    return { accepted: true, recordedAt: location.recordedAt };
  }

  publishOrderStatus(order: {
    id: string;
    storeId: string;
    orderNumber: string;
    status: OrderStatus;
    riderId: string | null;
  }) {
    const event = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      storeId: order.storeId,
      status: order.status,
      riderId: order.riderId,
      occurredAt: new Date().toISOString(),
    };
    this.server?.to(`order:${order.id}`).emit('order.status', event);
    this.server?.to(`store:${order.storeId}`).emit('order.status', event);
  }

  publishStoreAlert(storeId: string, alert: { id: string; alertType: string; details: unknown }) {
    this.server?.to(`store:${storeId}`).emit('store.alert', alert);
  }

  private accessToken(socket: AuthenticatedSocket) {
    const authToken = socket.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.length > 0) return authToken;
    const header = socket.handshake.headers.authorization;
    return header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  }

  private identity(socket: AuthenticatedSocket) {
    if (!socket.data.identity) throw new WsException('Authentication is required');
    return socket.data.identity;
  }

  private consume(socket: AuthenticatedSocket, event: string) {
    const identity = this.identity(socket);
    const key = `${identity.id}:${event}`;
    const now = Date.now();
    if (this.rateWindows.size > 10_000) {
      for (const [rateKey, window] of this.rateWindows) {
        if (now - window.startedAt >= this.windowMs) this.rateWindows.delete(rateKey);
      }
    }
    const window = this.rateWindows.get(key);
    if (!window || now - window.startedAt >= this.windowMs) {
      this.rateWindows.set(key, { startedAt: now, count: 1 });
      return;
    }
    if (window.count >= this.eventLimit) throw new WsException('Socket event rate limit exceeded');
    window.count += 1;
  }

  private async canAccessOrder(
    identity: SocketIdentity,
    order: { customerId: string; storeId: string; riderId: string | null },
  ) {
    if (identity.role === Role.SUPER_ADMIN) return true;
    if (identity.role === Role.CUSTOMER) {
      const customer = await this.prisma.customerProfile.findUnique({
        where: { userId: identity.id },
        select: { id: true },
      });
      return customer?.id === order.customerId;
    }
    if (identity.role === Role.STORE_ADMIN) {
      const assignment = await this.prisma.storeAdmin.findUnique({
        where: { userId: identity.id },
        select: { storeId: true },
      });
      return assignment?.storeId === order.storeId;
    }
    if (identity.role === Role.RIDER && order.riderId) {
      const rider = await this.prisma.riderProfile.findUnique({
        where: { userId: identity.id },
        select: { id: true, assignedStoreId: true, kycStatus: true },
      });
      return rider?.id === order.riderId &&
        rider.assignedStoreId === order.storeId &&
        rider.kycStatus === 'APPROVED';
    }
    return false;
  }

  private async canAccessStore(identity: SocketIdentity, storeId: string) {
    if (identity.role === Role.SUPER_ADMIN) return true;
    if (identity.role !== Role.STORE_ADMIN) return false;
    const assignment = await this.prisma.storeAdmin.findUnique({
      where: { userId: identity.id },
      select: { storeId: true },
    });
    return assignment?.storeId === storeId;
  }
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isValidLocation(value: RiderLocationInput) {
  return (
    Number.isFinite(value?.latitude) &&
    value.latitude >= -90 &&
    value.latitude <= 90 &&
    Number.isFinite(value?.longitude) &&
    value.longitude >= -180 &&
    value.longitude <= 180 &&
    (value.heading === undefined ||
      (Number.isFinite(value.heading) && value.heading >= 0 && value.heading < 360)) &&
    (value.speedKmh === undefined ||
      (Number.isFinite(value.speedKmh) && value.speedKmh >= 0 && value.speedKmh <= 300))
  );
}
