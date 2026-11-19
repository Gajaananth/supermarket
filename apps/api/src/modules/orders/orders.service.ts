import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from '../notifications/notification.service';
import { PgBossService } from '../jobs/pg-boss.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  Role,
} from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { UserPayload } from '../../common/decorators/current-user.decorator';
import { CashControlService } from '../cash-control/cash-control.service';
import { PrismaService } from '../prisma/prisma.service';
import { StockLedgerService } from '../inventory/stock-ledger.service';
import {
  AssignOrderRiderDto,
  CreateOrderDto,
  DeliverOrderDto,
  OrderListQueryDto,
  OrderNoteDto,
  OrderReasonDto,
} from './dto/order.dto';
import { DeliveryZoneService } from './delivery-zone.service';
import { OrderStockService } from './order-stock.service';
import { orderInclude, OrderRecord } from './orders.types';

const activeRiderOrderStatuses = [
  OrderStatus.RIDER_ASSIGNED,
  OrderStatus.PICKED_UP,
  OrderStatus.ON_THE_WAY,
];

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: StockLedgerService,
    private readonly deliveryZones: DeliveryZoneService,
    private readonly orderStock: OrderStockService,
    private readonly cashControl: CashControlService,
    private readonly config: ConfigService,
    private readonly notifications: NotificationService,
    private readonly realtime: RealtimeGateway,
    private readonly boss: PgBossService,
  ) {}

  async create(dto: CreateOrderDto, user: UserPayload) {
    const customer = await this.prisma.customerProfile.findUnique({
      where: { userId: user.id },
    });
    if (!customer) throw new NotFoundException('Customer profile not found');

    const order = await this.prisma.$transaction((tx) =>
      this.createOrderInTransaction(tx, dto, user, customer.id),
    );
    await this.afterPlacement(order);
    return order;
  }

  async checkout(
    storeId: string,
    deliveryAddressId: string,
    deliveryZoneId: string | undefined,
    campaignCodes: string[] | undefined,
    user: UserPayload,
  ) {
    const customer = await this.prisma.customerProfile.findUnique({
      where: { userId: user.id },
    });
    if (!customer) throw new NotFoundException('Customer profile not found');

    const order = await this.prisma.$transaction(async (tx) => {
      const cartRef = await tx.cart.findUnique({
        where: { customerId_storeId: { customerId: customer.id, storeId } },
        select: { id: true },
      });
      if (!cartRef) {
        throw new BadRequestException('The store cart is empty');
      }
      await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "Cart" WHERE "id" = ${cartRef.id}::uuid FOR UPDATE
      `;
      const cart = await tx.cart.findUniqueOrThrow({
        where: { id: cartRef.id },
        include: { items: true },
      });
      if (cart.items.length === 0) throw new BadRequestException('The store cart is empty');
      const order = await this.createOrderInTransaction(tx, {
        storeId,
        deliveryAddressId,
        deliveryZoneId,
        campaignCodes,
        items: cart.items.map(({ storeProductId, quantity }) => ({
          storeProductId,
          quantity,
        })),
      }, user, customer.id);
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return order;
    });
    await this.afterPlacement(order);
    return order;
  }

  private async createOrderInTransaction(
    tx: Prisma.TransactionClient,
    dto: CreateOrderDto,
    user: UserPayload,
    customerId: string,
  ) {
    const [store, address] = await Promise.all([
      tx.store.findUnique({ where: { id: dto.storeId } }),
      tx.address.findFirst({
        where: { id: dto.deliveryAddressId, customerId },
      }),
    ]);
    if (!store || !store.isActive) throw new NotFoundException('Active store not found');
    if (!address) throw new NotFoundException('Delivery address not found');

    const storeProductIds = dto.items.map((item) => item.storeProductId);
    const initialRows = await tx.storeProduct.findMany({
      where: { id: { in: storeProductIds }, storeId: store.id },
      include: { masterProduct: true },
    });
    if (initialRows.length !== storeProductIds.length) {
      throw new BadRequestException('Every order item must belong to the selected store');
    }

    for (const row of [...initialRows].sort((a, b) =>
      a.masterProductId.localeCompare(b.masterProductId),
    )) {
      await this.ledger.lockStoreStock(tx, store.id, row.masterProductId);
    }

    const currentRows = await tx.storeProduct.findMany({
      where: { id: { in: storeProductIds }, storeId: store.id },
      include: { masterProduct: true },
    });
    const rowsById = new Map(currentRows.map((row) => [row.id, row]));
    const pricedItems = dto.items.map((item) => {
      const row = rowsById.get(item.storeProductId);
      if (!row || !row.isAvailable || !row.masterProduct.isActive) {
        throw new ConflictException('An order item is no longer available');
      }
      const price = row.customPrice ?? row.masterProduct.baseSellingPrice;
      const total = price.mul(item.quantity);
      return {
        storeProductId: row.id,
        masterProductId: row.masterProductId,
        productName: row.masterProduct.name,
        productUnit: row.masterProduct.unit,
        quantity: item.quantity,
        unitPrice: price,
        totalPrice: total,
        unitCost: row.masterProduct.costPrice,
      };
    });

    const subtotal = pricedItems.reduce(
      (sum, item) => sum.plus(item.totalPrice),
      new Prisma.Decimal(0),
    );
    if (subtotal.greaterThan(99999999.99)) {
      throw new BadRequestException('Order subtotal exceeds the supported maximum');
    }
    if (subtotal.lessThan(store.minOrderAmount)) {
      throw new BadRequestException(
        `Order subtotal must be at least ${store.minOrderAmount.toFixed(2)}`,
      );
    }

    const campaignResolution = await this.deliveryZones.resolve(
      tx,
      store,
      address,
      dto.deliveryZoneId,
      subtotal,
      dto.campaignCodes,
    );
    const { zone, fee, discount } = campaignResolution;
    const totalAmount = subtotal.plus(fee).minus(discount);
    if (totalAmount.greaterThan(99999999.99)) {
      throw new BadRequestException('Order total exceeds the supported maximum');
    }

    for (const item of pricedItems) {
      const stock = await this.ledger.lockStoreStock(
        tx,
        store.id,
        item.masterProductId,
      );
      if (stock.quantityOnHand - stock.quantityReserved < item.quantity) {
        throw new ConflictException(`Insufficient stock for product ${item.masterProductId}`);
      }
    }

    const orderNumber = `ORD-${new Date().getFullYear()}-${randomUUID()
      .slice(0, 8)
      .toUpperCase()}`;
    const order = await tx.order.create({
      data: {
        orderNumber,
        customerId,
        storeId: store.id,
        deliveryAddressId: address.id,
        deliveryAddressSnapshot: {
          label: address.label,
          recipientName: address.recipientName,
          recipientPhone: address.recipientPhone,
          streetAddress: address.streetAddress,
          landmark: address.landmark,
          locality: address.locality,
          latitude: Number(address.latitude),
          longitude: Number(address.longitude),
        },
        deliveryZoneId: zone.id,
        status: OrderStatus.PLACED,
        paymentMethod: PaymentMethod.COD,
        paymentStatus: PaymentStatus.PENDING,
        subtotal,
        deliveryFee: fee,
        discount,
        totalAmount,
        storeAcceptTimeoutAt: new Date(
          Date.now() + this.config.get<number>('ORDER_ACCEPT_TIMEOUT_SECONDS', 300) * 1000,
        ),
        items: {
          create: pricedItems.map((item) => ({
            storeProductId: item.storeProductId,
            productName: item.productName,
            productUnit: item.productUnit,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
        campaigns: {
          create: campaignResolution.campaigns.map((campaign) => ({
            campaign: { connect: { id: campaign.campaignId } },
            campaignName: campaign.campaignName,
            campaignCode: campaign.campaignCode,
            discountAmount: campaign.discountAmount,
            deliveryFeeWaived: campaign.deliveryFeeWaived,
          })),
        },
        timeline: {
          create: {
            status: OrderStatus.PLACED,
            actorRole: Role.CUSTOMER,
            actorId: user.id,
            note: 'Customer placed the order',
          },
        },
      },
      include: orderInclude,
    });

    await this.orderStock.reserve(tx, order, user.id);
    await tx.storeAlert.create({
      data: {
        storeId: store.id,
        orderId: order.id,
        alertType: 'NEW_ORDER',
        details: {
          orderNumber: order.orderNumber,
          itemCount: order.items.length,
          totalAmount: totalAmount.toFixed(2),
        },
      },
    });
    await this.audit(tx, user, order, 'ORDER_CREATE', {
      orderNumber,
      itemCount: order.items.length,
      paymentMethod: PaymentMethod.COD,
    });
    await this.notifications.queueOrderStateChange(tx, order, OrderStatus.PLACED);
    return order;
  }

  async processStoreAcceptTimeout(orderId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const order = await this.lockOrder(tx, orderId);
      if (order.status !== OrderStatus.PLACED || !order.storeAcceptTimeoutAt) {
        return { order: null, dueAt: null };
      }
      if (order.storeAcceptTimeoutAt.getTime() > Date.now()) {
        return { order: null, dueAt: order.storeAcceptTimeoutAt };
      }

      const reason = 'Store did not respond before the acceptance deadline';
      await this.orderStock.releaseReservation(tx, order, undefined, reason);
      const updated = await this.transition(
        tx,
        order,
        OrderStatus.REJECTED,
        null,
        `${reason}; order escalated to administration.`,
        {
          cancellationReason: reason,
          paymentStatus: PaymentStatus.CANCELLED,
        },
      );
      const alert = await tx.storeAlert.create({
        data: {
          storeId: order.storeId,
          orderId: order.id,
          alertType: 'ORDER_TIMEOUT_ESCALATED',
          details: {
            orderNumber: order.orderNumber,
            timeoutAt: order.storeAcceptTimeoutAt.toISOString(),
          },
        },
      });
      return { order: updated, alert, dueAt: null };
    });

    if (result.order) {
      this.realtime.publishOrderStatus(result.order);
      await this.enqueueNotificationDispatch();
      if (result.alert) {
        this.realtime.publishStoreAlert(result.order.storeId, {
          id: result.alert.id,
          alertType: result.alert.alertType,
          details: result.alert.details,
        });
      }
      return { state: 'processed' as const };
    }
    if (result.dueAt) return { state: 'reschedule' as const, dueAt: result.dueAt };
    return { state: 'ignored' as const };
  }

  async sweepExpiredStoreOrders() {
    const orders = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.PLACED,
        storeAcceptTimeoutAt: { lte: new Date() },
      },
      select: { id: true },
      orderBy: { storeAcceptTimeoutAt: 'asc' },
      take: 100,
    });
    for (const order of orders) {
      await this.processStoreAcceptTimeout(order.id);
    }
    return orders.length;
  }

  private async afterPlacement(order: OrderRecord) {
    if (order.storeAcceptTimeoutAt) {
      try {
        await this.boss.scheduleOrderTimeout(order.id, order.storeAcceptTimeoutAt);
      } catch (error) {
        this.logger.error(
          `Could not queue timeout for order ${order.id}; the scheduled timeout sweep will recover it`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
    this.realtime.publishOrderStatus(order);
    await this.enqueueNotificationDispatch();
    this.realtime.publishStoreAlert(order.storeId, {
      id: order.id,
      alertType: 'NEW_ORDER',
      details: {
        orderNumber: order.orderNumber,
        itemCount: order.items.length,
        totalAmount: order.totalAmount.toFixed(2),
      },
    });
  }

  async list(query: OrderListQueryDto, user: UserPayload) {
    const where: Prisma.OrderWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(user.role === Role.SUPER_ADMIN && query.storeId
        ? { storeId: query.storeId }
        : {}),
    };

    if (user.role === Role.CUSTOMER) {
      const customer = await this.customerProfile(user.id);
      where.customerId = customer.id;
      if (query.storeId) where.storeId = query.storeId;
    } else if (user.role === Role.STORE_ADMIN) {
      const storeId = await this.storeAdminStore(query.storeId, user);
      where.storeId = storeId;
    } else if (user.role === Role.RIDER) {
      const rider = await this.prisma.riderProfile.findUnique({
        where: { userId: user.id },
        select: {
          id: true,
          kycStatus: true,
          assignedStoreId: true,
          user: { select: { isActive: true } },
        },
      });
      if (
        !rider ||
        rider.kycStatus !== 'APPROVED' ||
        !rider.assignedStoreId ||
        !rider.user.isActive
      ) {
        throw new ForbiddenException('An approved rider assigned to a store is required');
      }
      where.riderId = rider.id;
    } else if (user.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Order access is not allowed');
    }

    return this.prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
      take: query.limit ?? 50,
    });
  }

  async listEligibleRiders(user: UserPayload) {
    const storeId = await this.storeAdminStore(undefined, user);
    const riders = await this.prisma.riderProfile.findMany({
      where: {
        assignedStoreId: storeId,
        kycStatus: 'APPROVED',
        isShiftActive: true,
        user: { isActive: true, role: Role.RIDER },
        orders: { none: { status: { in: activeRiderOrderStatuses } } },
      },
      select: {
        id: true,
        riderType: true,
        bikeNumber: true,
        user: { select: { fullName: true, phone: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const eligible = [];
    for (const rider of riders) {
      const cashPolicy = await this.prisma.$transaction((tx) =>
        this.cashControl.enforceCashPolicy(tx, rider.id, user),
      );
      if (!cashPolicy.isCashLocked && !cashPolicy.depositPending) {
        eligible.push(rider);
      }
    }

    return eligible;
  }

  async findOne(id: string, user: UserPayload) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });
    if (!order) throw new NotFoundException('Order not found');
    await this.assertOrderAccess(order, user);
    return order;
  }

  async cancel(id: string, dto: OrderReasonDto, user: UserPayload) {
    return this.orderTransaction(async (tx) => {
      const order = await this.lockOrder(tx, id);
      await this.assertCustomerOrder(tx, order, user);
      if (order.status !== OrderStatus.PLACED) {
        throw new ConflictException('Customers can only cancel orders before store acceptance');
      }
      await this.orderStock.releaseReservation(tx, order, user.id, dto.reason.trim());
      return this.transition(tx, order, OrderStatus.CANCELLED, user, dto.reason.trim(), {
        cancelledAt: new Date(),
        cancellationReason: dto.reason.trim(),
        paymentStatus: PaymentStatus.CANCELLED,
      });
    });
  }

  async accept(id: string, dto: OrderNoteDto, user: UserPayload) {
    return this.storeTransition(id, OrderStatus.PLACED, OrderStatus.ACCEPTED, dto.note, user, {
      acceptedAt: new Date(),
    });
  }

  async reject(id: string, dto: OrderReasonDto, user: UserPayload) {
    return this.orderTransaction(async (tx) => {
      const order = await this.lockOrder(tx, id);
      await this.assertStoreAccess(tx, order.storeId, user);
      this.assertStatus(order, OrderStatus.PLACED);
      this.assertBeforeStoreTimeout(order);
      await this.orderStock.releaseReservation(tx, order, user.id, dto.reason.trim());
      return this.transition(tx, order, OrderStatus.REJECTED, user, dto.reason.trim(), {
        cancellationReason: dto.reason.trim(),
        paymentStatus: PaymentStatus.CANCELLED,
      });
    });
  }

  async startPreparing(id: string, dto: OrderNoteDto, user: UserPayload) {
    return this.storeTransition(
      id,
      OrderStatus.ACCEPTED,
      OrderStatus.PREPARING,
      dto.note,
      user,
    );
  }

  async markReady(id: string, dto: OrderNoteDto, user: UserPayload) {
    return this.storeTransition(id, OrderStatus.PREPARING, OrderStatus.READY, dto.note, user);
  }

  async assignRider(id: string, dto: AssignOrderRiderDto, user: UserPayload) {
    const result = await this.orderTransaction(async (tx) => {
      const order = await this.lockOrder(tx, id);
      await this.assertStoreAccess(tx, order.storeId, user);
      this.assertStatus(order, OrderStatus.READY);

      const riderLock = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "RiderProfile" WHERE "id" = ${dto.riderId}::uuid FOR UPDATE
      `;
      if (!riderLock[0]) throw new NotFoundException('Rider profile not found');
      const rider = await tx.riderProfile.findUnique({
        where: { id: dto.riderId },
        include: { user: { select: { isActive: true, role: true } } },
      });
      if (
        !rider ||
        !rider.user.isActive ||
        rider.user.role !== Role.RIDER ||
        rider.kycStatus !== 'APPROVED' ||
        rider.assignedStoreId !== order.storeId ||
        !rider.isShiftActive
      ) {
        throw new ConflictException('Rider is not eligible for this store order');
      }
      const cashPolicy = await this.cashControl.enforceCashPolicy(tx, rider.id, user);
      if (cashPolicy.isCashLocked || cashPolicy.depositPending) {
        return {
          blockedReason:
            cashPolicy.cashLockReason ?? 'Rider cash deposit is awaiting verification',
        };
      }
      const activeOrder = await tx.order.findFirst({
        where: { riderId: rider.id, status: { in: activeRiderOrderStatuses } },
        select: { id: true },
      });
      if (activeOrder) throw new ConflictException('Rider already has an active delivery');

      return {
        order: await this.transition(tx, order, OrderStatus.RIDER_ASSIGNED, user, undefined, {
          riderId: rider.id,
          assignedAt: new Date(),
        }),
      };
    });
    if ('blockedReason' in result) throw new ConflictException(result.blockedReason);
    return result.order;
  }

  async riderReject(id: string, dto: OrderReasonDto, user: UserPayload) {
    return this.orderTransaction(async (tx) => {
      const order = await this.lockOrder(tx, id);
      await this.assertAssignedRider(tx, order, user);
      this.assertStatus(order, OrderStatus.RIDER_ASSIGNED);
      return this.transition(tx, order, OrderStatus.READY, user, dto.reason.trim(), {
        riderId: null,
        assignedAt: null,
      });
    });
  }

  async pickUp(id: string, dto: OrderNoteDto, user: UserPayload) {
    return this.orderTransaction(async (tx) => {
      const order = await this.lockOrder(tx, id);
      await this.assertAssignedRider(tx, order, user);
      this.assertStatus(order, OrderStatus.RIDER_ASSIGNED);
      await this.orderStock.pickUp(tx, order, user.id);
      return this.transition(tx, order, OrderStatus.PICKED_UP, user, dto.note, {
        pickedUpAt: new Date(),
      });
    });
  }

  async startDelivery(id: string, dto: OrderNoteDto, user: UserPayload) {
    return this.riderTransition(
      id,
      OrderStatus.PICKED_UP,
      OrderStatus.ON_THE_WAY,
      dto.note,
      user,
    );
  }

  async deliver(id: string, dto: DeliverOrderDto, user: UserPayload) {
    return this.orderTransaction(async (tx) => {
      const order = await this.lockOrder(tx, id);
      await this.assertAssignedRider(tx, order, user);
      this.assertStatus(order, OrderStatus.ON_THE_WAY);
      if (!new Prisma.Decimal(dto.collectedAmount).equals(order.totalAmount)) {
        throw new BadRequestException('Collected COD amount must equal the order total');
      }
      await this.orderStock.deliver(tx, order, user.id);
      await this.cashControl.recordCodCollection(tx, order, user);
      return this.transition(tx, order, OrderStatus.DELIVERED, user, 'COD collected in full', {
        deliveredAt: new Date(),
        paymentStatus: PaymentStatus.COLLECTED_BY_RIDER,
      });
    });
  }

  async fail(id: string, dto: OrderReasonDto, user: UserPayload) {
    return this.orderTransaction(async (tx) => {
      const order = await this.lockOrder(tx, id);
      await this.assertAssignedRider(tx, order, user);
      this.assertStatus(order, OrderStatus.ON_THE_WAY);
      await this.orderStock.restockFailedDelivery(tx, order, user.id, dto.reason.trim());
      return this.transition(tx, order, OrderStatus.FAILED, user, dto.reason.trim(), {
        cancellationReason: dto.reason.trim(),
      });
    });
  }

  private async storeTransition(
    id: string,
    current: OrderStatus,
    next: OrderStatus,
    note: string | undefined,
    user: UserPayload,
    extra: Prisma.OrderUncheckedUpdateInput = {},
  ) {
    return this.orderTransaction(async (tx) => {
      const order = await this.lockOrder(tx, id);
      await this.assertStoreAccess(tx, order.storeId, user);
      this.assertStatus(order, current);
      if (current === OrderStatus.PLACED) this.assertBeforeStoreTimeout(order);
      return this.transition(tx, order, next, user, note, extra);
    });
  }

  private async riderTransition(
    id: string,
    current: OrderStatus,
    next: OrderStatus,
    note: string | undefined,
    user: UserPayload,
  ) {
    return this.orderTransaction(async (tx) => {
      const order = await this.lockOrder(tx, id);
      await this.assertAssignedRider(tx, order, user);
      this.assertStatus(order, current);
      return this.transition(tx, order, next, user, note);
    });
  }

  private async transition(
    tx: Prisma.TransactionClient,
    order: OrderRecord,
    status: OrderStatus,
    user: UserPayload | null,
    note?: string,
    extra: Prisma.OrderUncheckedUpdateInput = {},
  ) {
    const updated = await tx.order.update({
      where: { id: order.id },
      data: { ...extra, status },
      include: orderInclude,
    });
    await tx.orderTimeline.create({
      data: {
        orderId: order.id,
        status,
        actorRole: user ? user.role as Role : Role.SYSTEM,
        actorId: user?.id ?? null,
        note: note?.trim() || null,
      },
    });
    await this.audit(tx, user, order, `ORDER_${status}`, {
      fromStatus: order.status,
      toStatus: status,
      note: note?.trim() || null,
    });
    await this.notifications.queueOrderStateChange(
      tx,
      updated,
      status,
      order.riderId,
      user === null,
    );
    return updated;
  }

  private async orderTransaction<T>(
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    const result = await this.prisma.$transaction(operation);
    if (isOrderRecord(result)) {
      this.realtime.publishOrderStatus(result);
      await this.enqueueNotificationDispatch();
    } else if (
      typeof result === 'object' &&
      result !== null &&
      'order' in result &&
      isOrderRecord(result.order)
    ) {
      this.realtime.publishOrderStatus(result.order);
      await this.enqueueNotificationDispatch();
    }
    return result;
  }

  private async enqueueNotificationDispatch() {
    try {
      await this.boss.enqueueNotificationDispatch();
    } catch (error) {
      this.logger.error(
        'Could not queue notification delivery; the scheduled outbox sweep will recover it',
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private async lockOrder(tx: Prisma.TransactionClient, id: string): Promise<OrderRecord> {
    const rows = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "Order" WHERE "id" = ${id}::uuid FOR UPDATE
    `;
    if (!rows[0]) throw new NotFoundException('Order not found');
    return tx.order.findUniqueOrThrow({ where: { id }, include: orderInclude });
  }

  private assertStatus(order: OrderRecord, expected: OrderStatus) {
    if (order.status !== expected) {
      throw new ConflictException(`Order must be ${expected} before this action`);
    }
  }

  private assertBeforeStoreTimeout(order: OrderRecord) {
    if (order.storeAcceptTimeoutAt && order.storeAcceptTimeoutAt.getTime() <= Date.now()) {
      throw new ConflictException('The store acceptance deadline has passed');
    }
  }

  private async assertStoreAccess(
    tx: Prisma.TransactionClient,
    storeId: string,
    user: UserPayload,
  ) {
    const store = await tx.store.findUnique({
      where: { id: storeId },
      select: { isActive: true },
    });
    if (!store || !store.isActive) throw new NotFoundException('Store not found');
    if (user.role === Role.SUPER_ADMIN) return;
    if (user.role !== Role.STORE_ADMIN) {
      throw new ForbiddenException('Store administration role required');
    }
    const assignment = await tx.storeAdmin.findUnique({
      where: { userId: user.id },
      select: { storeId: true },
    });
    if (!assignment) throw new ForbiddenException('No store is assigned to this admin');
    if (assignment.storeId !== storeId) {
      throw new ForbiddenException('Store admins can only access their assigned store');
    }
  }

  private async storeAdminStore(storeId: string | undefined, user: UserPayload) {
    const assignment = await this.prisma.storeAdmin.findUnique({
      where: { userId: user.id },
      select: { storeId: true },
    });
    if (!assignment) throw new ForbiddenException('No store is assigned to this admin');
    if (storeId && storeId !== assignment.storeId) {
      throw new ForbiddenException('Store admins can only access their assigned store');
    }
    return assignment.storeId;
  }

  private async assertCustomerOrder(
    tx: Prisma.TransactionClient,
    order: OrderRecord,
    user: UserPayload,
  ) {
    const customer = await tx.customerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!customer || customer.id !== order.customerId) {
      throw new NotFoundException('Order not found');
    }
  }

  private async assertAssignedRider(
    tx: Prisma.TransactionClient,
    order: OrderRecord,
    user: UserPayload,
  ) {
    const rider = await tx.riderProfile.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        kycStatus: true,
        assignedStoreId: true,
        user: { select: { isActive: true, role: true } },
      },
    });
    if (
      !rider ||
      rider.id !== order.riderId ||
      rider.kycStatus !== 'APPROVED' ||
      rider.assignedStoreId !== order.storeId ||
      !rider.user.isActive ||
      rider.user.role !== Role.RIDER
    ) {
      throw new NotFoundException('Order not found');
    }
  }

  private async assertOrderAccess(order: OrderRecord, user: UserPayload) {
    if (user.role === Role.SUPER_ADMIN) return;
    if (user.role === Role.CUSTOMER) {
      await this.assertCustomerOrder(this.prisma, order, user);
      return;
    }
    if (user.role === Role.STORE_ADMIN) {
      await this.assertStoreAccess(this.prisma, order.storeId, user);
      return;
    }
    if (user.role === Role.RIDER) {
      const rider = await this.prisma.riderProfile.findUnique({
        where: { userId: user.id },
        select: {
          id: true,
          kycStatus: true,
          assignedStoreId: true,
          user: { select: { isActive: true, role: true } },
        },
      });
      if (
        rider &&
        rider.id === order.riderId &&
        rider.kycStatus === 'APPROVED' &&
        rider.assignedStoreId === order.storeId &&
        rider.user.isActive &&
        rider.user.role === Role.RIDER
      ) return;
      throw new NotFoundException('Order not found');
    }
    throw new ForbiddenException('Order access is not allowed');
  }

  private async customerProfile(userId: string) {
    const customer = await this.prisma.customerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!customer) throw new NotFoundException('Customer profile not found');
    return customer;
  }

  private async audit(
    tx: Prisma.TransactionClient,
    user: UserPayload | null,
    order: Pick<OrderRecord, 'id'>,
    action: string,
    values: Prisma.InputJsonObject,
  ) {
    return tx.auditLog.create({
      data: {
        userId: user?.id,
        userRole: user ? user.role as Role : Role.SYSTEM,
        action,
        entityType: 'Order',
        entityId: order.id,
        newValues: values,
      },
    });
  }
}

function isOrderRecord(value: unknown): value is OrderRecord {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Partial<OrderRecord>;
  return (
    typeof record.id === 'string' &&
    typeof record.orderNumber === 'string' &&
    typeof record.storeId === 'string' &&
    typeof record.status === 'string' &&
    (record.riderId === null || typeof record.riderId === 'string')
  );
}
