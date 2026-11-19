import 'reflect-metadata';
import 'dotenv/config';
import { ChildProcess, spawn } from 'node:child_process';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import { PgBoss } from 'pg-boss';
import { OrderStatus, PaymentStatus, PrismaClient, Role } from '@prisma/client';
import { io, Socket } from 'socket.io-client';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('Orders and COD APIs (isolated PostgreSQL schema)', () => {
  const baseUrl = 'http://127.0.0.1:4404';
  const prisma = new PrismaClient();
  const suffix = randomUUID().replace(/-/g, '').slice(0, 12);
  const jwt = new JwtService({ secret: process.env.JWT_SECRET });
  let apiProcess: ChildProcess | undefined;
  const apiOutput: string[] = [];
  let storeId: string;
  let otherStoreId: string;
  let addressId: string;
  let customerId: string;
  let storeProductId: string;
  let riderId: string;
  let secondRiderId: string;
  let lockedRiderId: string;
  let customerToken: string;
  let otherCustomerToken: string;
  let storeAdminToken: string;
  let superAdminToken: string;
  let riderToken: string;
  let secondRiderToken: string;

  beforeAll(async () => {
    await prisma.$connect();
    const store = await prisma.store.create({
      data: {
        code: `O-${suffix.slice(0, 8)}`,
        name: 'Orders E2E Store',
        slug: `orders-e2e-${suffix}`,
        address: 'Test address',
        locality: 'Test',
        latitude: 7.7,
        longitude: 81.7,
        contactPhone: '+94770000101',
        minOrderAmount: 10,
        freeDeliveryThreshold: 100,
        cashHoldThreshold: 175,
      },
    });
    storeId = store.id;
    const otherStore = await prisma.store.create({
      data: {
        code: `X-${suffix.slice(0, 8)}`,
        name: 'Other Orders E2E Store',
        slug: `other-orders-e2e-${suffix}`,
        address: 'Other test address',
        locality: 'Other',
        latitude: 7.7,
        longitude: 81.7,
        contactPhone: '+94770000102',
      },
    });
    otherStoreId = otherStore.id;
    const zone = await prisma.deliveryZone.create({
      data: {
        storeId,
        zoneNumber: 1,
        name: 'Nearby zone',
        radiusKm: 3,
        baseFee: 25,
        minOrderForFreeDelivery: 200,
      },
    });

    const category = await prisma.category.create({
      data: { name: `Orders E2E ${suffix}`, slug: `orders-e2e-${suffix}` },
    });
    const product = await prisma.masterProduct.create({
      data: {
        barcode: `orders-${suffix}`,
        sku: `orders-${suffix}`,
        name: `Orders E2E Product ${suffix}`,
        categoryId: category.id,
        unit: 'piece',
        costPrice: 20,
        baseSellingPrice: 50,
      },
    });
    const storeProduct = await prisma.storeProduct.create({
      data: {
        storeId,
        masterProductId: product.id,
        quantityOnHand: 100,
        quantityReserved: 0,
        reorderLevel: 0,
      },
    });
    storeProductId = storeProduct.id;

    const customerUser = await prisma.user.create({
      data: { role: Role.CUSTOMER, fullName: 'Orders E2E Customer', phone: `+9478${suffix}` },
    });
    const customer = await prisma.customerProfile.create({
      data: { userId: customerUser.id },
    });
    customerId = customer.id;
    const address = await prisma.address.create({
      data: {
        customerId,
        label: 'Home',
        recipientName: 'Orders E2E Customer',
        recipientPhone: `+9478${suffix}`,
        streetAddress: 'Test street',
        locality: 'Test',
        latitude: 7.71,
        longitude: 81.7,
      },
    });
    addressId = address.id;

    const otherCustomer = await prisma.user.create({
      data: {
        role: Role.CUSTOMER,
        fullName: 'Other Orders E2E Customer',
        phone: `+9479${suffix}`,
      },
    });
    await prisma.customerProfile.create({ data: { userId: otherCustomer.id } });
    const admin = await prisma.user.create({
      data: {
        role: Role.STORE_ADMIN,
        fullName: 'Orders E2E Store Admin',
        email: `orders-admin-${suffix}@example.invalid`,
      },
    });
    await prisma.storeAdmin.create({ data: { userId: admin.id, storeId } });
    const superAdmin = await prisma.user.create({
      data: {
        role: Role.SUPER_ADMIN,
        fullName: 'Orders E2E Super Admin',
        email: `orders-super-${suffix}@example.invalid`,
      },
    });

    const riderUser = await prisma.user.create({
      data: {
        role: Role.RIDER,
        fullName: 'Orders E2E Rider',
        phone: `+9476${suffix}`,
      },
    });
    const rider = await prisma.riderProfile.create({
      data: {
        userId: riderUser.id,
        assignedStoreId: storeId,
        kycStatus: 'APPROVED',
        isShiftActive: true,
      },
    });
    riderId = rider.id;
    const secondRiderUser = await prisma.user.create({
      data: {
        role: Role.RIDER,
        fullName: 'Second Orders E2E Rider',
        phone: `+9475${suffix}`,
      },
    });
    const secondRider = await prisma.riderProfile.create({
      data: {
        userId: secondRiderUser.id,
        assignedStoreId: storeId,
        kycStatus: 'APPROVED',
        isShiftActive: true,
      },
    });
    secondRiderId = secondRider.id;
    const lockedRiderUser = await prisma.user.create({
      data: {
        role: Role.RIDER,
        fullName: 'Cash-locked Orders E2E Rider',
        phone: `+9474${suffix}`,
      },
    });
    const lockedRider = await prisma.riderProfile.create({
      data: {
        userId: lockedRiderUser.id,
        assignedStoreId: storeId,
        kycStatus: 'APPROVED',
        isShiftActive: true,
        isCashLocked: true,
        cashLockReason: 'Deposit required',
      },
    });
    lockedRiderId = lockedRider.id;
    const otherStoreRiderUser = await prisma.user.create({
      data: {
        role: Role.RIDER,
        fullName: 'Other-store Orders E2E Rider',
        phone: `+9473${suffix}`,
      },
    });
    await prisma.riderProfile.create({
      data: {
        userId: otherStoreRiderUser.id,
        assignedStoreId: otherStoreId,
        kycStatus: 'APPROVED',
        isShiftActive: true,
      },
    });

    customerToken = jwt.sign({ sub: customerUser.id, role: Role.CUSTOMER });
    otherCustomerToken = jwt.sign({ sub: otherCustomer.id, role: Role.CUSTOMER });
    storeAdminToken = jwt.sign({ sub: admin.id, role: Role.STORE_ADMIN });
    superAdminToken = jwt.sign({ sub: superAdmin.id, role: Role.SUPER_ADMIN });
    riderToken = jwt.sign({ sub: riderUser.id, role: Role.RIDER });
    secondRiderToken = jwt.sign({ sub: secondRiderUser.id, role: Role.RIDER });

    apiProcess = spawn(process.execPath, ['dist/main.js'], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        HOST: '127.0.0.1',
        NODE_ENV: 'test',
        PORT: '4404',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    apiProcess.stdout?.on('data', (chunk: Buffer) => apiOutput.push(chunk.toString()));
    apiProcess.stderr?.on('data', (chunk: Buffer) => apiOutput.push(chunk.toString()));
    await waitForApi();
    expect(zone.storeId).toBe(storeId);
  }, 60_000);

  afterAll(async () => {
    if (apiProcess && apiProcess.exitCode === null) {
      const exited = once(apiProcess, 'exit');
      apiProcess.kill();
      await Promise.race([exited, new Promise((resolve) => setTimeout(resolve, 5_000))]);
    }
    await prisma.$disconnect();
  });

  it('lists only eligible riders for the assigned store admin', async () => {
    const activeOrder = await prisma.order.create({
      data: {
        orderNumber: `ORD-ELIG-${suffix}`,
        customerId,
        storeId,
        deliveryAddressSnapshot: {},
        subtotal: 10,
        totalAmount: 10,
        status: OrderStatus.RIDER_ASSIGNED,
        riderId: secondRiderId,
      },
    });
    try {
      const response = await request(baseUrl)
        .get('/api/v1/orders/eligible-riders')
        .set('Authorization', `Bearer ${storeAdminToken}`);

      expect(response.status).toBe(200);
      const riderIds = response.body.data.map((rider: { id: string }) => rider.id);
      expect(riderIds).toEqual([riderId]);
      expect(riderIds).not.toContain(secondRiderId);
      expect(riderIds).not.toContain(lockedRiderId);

      const superAdminResponse = await request(baseUrl)
        .get('/api/v1/orders/eligible-riders')
        .set('Authorization', `Bearer ${superAdminToken}`);
      expect(superAdminResponse.status).toBe(403);
    } finally {
      await prisma.order.delete({ where: { id: activeOrder.id } });
    }
  });

  it('creates customer-scoped addresses and keeps a single default under concurrent writes', async () => {
    const makeAddress = (label: string) =>
      request(baseUrl)
        .post('/api/v1/addresses')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          label,
          recipientName: 'Orders E2E Customer',
          recipientPhone: '+94779990000',
          streetAddress: `${label} address`,
          locality: 'Puliyanthivu',
          latitude: 7.71,
          longitude: 81.7,
          isDefault: true,
        });

    const [first, second] = await Promise.all([
      makeAddress(`Home ${suffix}`),
      makeAddress(`Work ${suffix}`),
    ]);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    const listed = await request(baseUrl)
      .get('/api/v1/addresses')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(listed.status).toBe(200);
    expect(listed.body.data).toHaveLength(2);
    expect(listed.body.data.filter((address: { isDefault: boolean }) => address.isDefault))
      .toHaveLength(1);

    const foreignRead = await request(baseUrl)
      .get('/api/v1/addresses')
      .set('Authorization', `Bearer ${otherCustomerToken}`);
    expect(foreignRead.status).toBe(200);
    expect(foreignRead.body.data).toEqual([]);

    const foreignUpdate = await request(baseUrl)
      .patch(`/api/v1/addresses/${first.body.data.id}`)
      .set('Authorization', `Bearer ${otherCustomerToken}`)
      .send({ label: 'Stolen' });
    expect(foreignUpdate.status).toBe(404);

    await prisma.address.deleteMany({
      where: { id: { in: [first.body.data.id, second.body.data.id] } },
    });
  });

  it('auto-matches zones, applies the higher free-delivery threshold, and scopes access', async () => {
    const wrongZone = await prisma.deliveryZone.create({
      data: {
        storeId,
        zoneNumber: 2,
        name: 'Second zone',
        radiusKm: 5,
        baseFee: 50,
        minOrderForFreeDelivery: 500,
      },
    });
    const mismatch = await createOrder(3, wrongZone.id);
    expect(mismatch.status).toBe(400);

    const response = await createOrder(3);
    expect(response.status).toBe(201);
    expect(response.body.data.deliveryZoneId).not.toBe(wrongZone.id);
    expect(response.body.data.subtotal).toBe('150');
    expect(response.body.data.deliveryFee).toBe('25');
    expect(response.body.data.totalAmount).toBe('175');
    expect(response.body.data.paymentMethod).toBe('COD');
    expect(response.body.data.paymentStatus).toBe('PENDING');

    const stock = await prisma.storeProduct.findUniqueOrThrow({
      where: { id: storeProductId },
    });
    expect(stock.quantityReserved).toBe(3);

    const crossStore = await request(baseUrl)
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${storeAdminToken}`)
      .query({ storeId: otherStoreId });
    expect(crossStore.status).toBe(403);

    const crossCustomer = await request(baseUrl)
      .get(`/api/v1/orders/${response.body.data.id}`)
      .set('Authorization', `Bearer ${otherCustomerToken}`);
    expect(crossCustomer.status).toBe(404);

    const cancelled = await request(baseUrl)
      .post(`/api/v1/orders/${response.body.data.id}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ reason: 'Customer changed their mind' });
    expect(cancelled.status).toBe(201);
    expect(cancelled.body.data.status).toBe(OrderStatus.CANCELLED);
    expect(cancelled.body.data.paymentStatus).toBe(PaymentStatus.CANCELLED);
    const released = await prisma.storeProduct.findUniqueOrThrow({
      where: { id: storeProductId },
    });
    expect(released.quantityReserved).toBe(0);
  });

  it('stacks automatic delivery and code discounts, caps discounts, and rejects unavailable codes', async () => {
    const freeDelivery = await createCampaign({
      name: `Free delivery ${suffix}`,
      type: 'FREE_DELIVERY',
      value: 0,
    });
    const saveTen = await createCampaign({
      name: `Ten percent ${suffix}`,
      code: `SAVE${suffix.slice(0, 6).toUpperCase()}`,
      type: 'PERCENTAGE_DISCOUNT',
      value: 10,
      maxDiscount: 10,
    });
    const extraFive = await createCampaign({
      name: `Extra five ${suffix}`,
      code: `FIVE${suffix.slice(0, 6).toUpperCase()}`,
      type: 'FIXED_DISCOUNT',
      value: 5,
    });
    const capped = await createCampaign({
      name: `Capped ${suffix}`,
      code: `CAP${suffix.slice(0, 6).toUpperCase()}`,
      type: 'FIXED_DISCOUNT',
      value: 500,
      maxDiscount: 20,
    });

    const stackedOrder = await createOrder(3, undefined, addressId, [
      saveTen.code,
      extraFive.code,
    ]);
    expect(stackedOrder.status).toBe(201);
    expect(stackedOrder.body.data.deliveryFee).toBe('0');
    expect(stackedOrder.body.data.discount).toBe('15');
    expect(stackedOrder.body.data.totalAmount).toBe('135');
    expect(stackedOrder.body.data.campaigns).toHaveLength(3);
    expect(stackedOrder.body.data.campaigns.map((campaign: { campaignId: string }) =>
      campaign.campaignId,
    )).toContain(freeDelivery.id);

    const cartItem = await request(baseUrl)
      .post(`/api/v1/cart/${storeId}/items`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ storeProductId, quantity: 3 });
    expect(cartItem.status).toBe(201);
    const cartCheckout = await request(baseUrl)
      .post('/api/v1/orders/checkout')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        storeId,
        deliveryAddressId: addressId,
        campaignCodes: [saveTen.code],
      });
    expect(cartCheckout.status).toBe(201);
    expect(cartCheckout.body.data.discount).toBe('10');
    expect(cartCheckout.body.data.totalAmount).toBe('140');

    const unavailableCode = await createOrder(1, undefined, addressId, ['NOTAVAILABLE']);
    expect(unavailableCode.status).toBe(409);

    const cappedOrder = await createOrder(3, undefined, addressId, [capped.code]);
    expect(cappedOrder.status).toBe(201);
    expect(cappedOrder.body.data.discount).toBe('20');
    expect(cappedOrder.body.data.totalAmount).toBe('130');

    for (const order of [stackedOrder, cartCheckout, cappedOrder]) {
      const cancelled = await request(baseUrl)
        .post(`/api/v1/orders/${order.body.data.id}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ reason: 'Campaign test cleanup' });
      expect(cancelled.status).toBe(201);
    }
    for (const campaign of [freeDelivery, saveTen, extraFive, capped]) {
      const deactivated = await request(baseUrl)
        .patch(`/api/v1/campaigns/${campaign.id}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ isActive: false });
      expect(deactivated.status).toBe(200);
    }

    const auditEntries = await prisma.auditLog.count({
      where: {
        action: 'CAMPAIGN_CREATE',
        entityId: { in: [freeDelivery.id, saveTen.id, extraFive.id, capped.id] },
      },
    });
    expect(auditEntries).toBe(4);
  });

  it('scopes store settings and records old and new values in the audit log', async () => {
    const settings = await request(baseUrl)
      .get(`/api/v1/stores/${storeId}/settings`)
      .set('Authorization', `Bearer ${storeAdminToken}`);
    expect(settings.status).toBe(200);
    expect(settings.body.data.minOrderAmount).toBe('10');

    const updated = await request(baseUrl)
      .patch(`/api/v1/stores/${storeId}/settings`)
      .set('Authorization', `Bearer ${storeAdminToken}`)
      .send({ minOrderAmount: 12, serviceRadiusKm: 8 });
    expect(updated.status).toBe(200);
    expect(updated.body.data.minOrderAmount).toBe('12');
    const invalidHours = await request(baseUrl)
      .patch(`/api/v1/stores/${storeId}/settings`)
      .set('Authorization', `Bearer ${storeAdminToken}`)
      .send({ openingTime: '22:00', closingTime: '07:00' });
    expect(invalidHours.status).toBe(400);

    const crossStore = await request(baseUrl)
      .get(`/api/v1/stores/${otherStoreId}/settings`)
      .set('Authorization', `Bearer ${storeAdminToken}`);
    expect(crossStore.status).toBe(403);
    const blockedCrossStoreUpdate = await request(baseUrl)
      .patch(`/api/v1/stores/${otherStoreId}/settings`)
      .set('Authorization', `Bearer ${storeAdminToken}`)
      .send({ minOrderAmount: 12 });
    expect(blockedCrossStoreUpdate.status).toBe(403);

    const audit = await prisma.auditLog.findFirstOrThrow({
      where: { action: 'STORE_SETTINGS_UPDATE', entityId: storeId },
      orderBy: { createdAt: 'desc' },
    });
    expect(audit.oldValues).toMatchObject({ minOrderAmount: '10.00' });
    expect(audit.newValues).toMatchObject({ minOrderAmount: 12, serviceRadiusKm: 8 });

    const zone = await prisma.deliveryZone.findFirstOrThrow({ where: { storeId } });
    const zonePricing = await request(baseUrl)
      .patch(`/api/v1/stores/${storeId}/zones/${zone.id}/pricing`)
      .set('Authorization', `Bearer ${storeAdminToken}`)
      .send({ baseFee: 30, estimatedDeliveryMins: 45 });
    expect(zonePricing.status).toBe(200);
    expect(zonePricing.body.data.baseFee).toBe('30');
    const zoneAudit = await prisma.auditLog.findFirstOrThrow({
      where: { action: 'DELIVERY_ZONE_PRICING_UPDATE', entityId: zone.id },
    });
    expect(zoneAudit.oldValues).toMatchObject({ baseFee: '25.00' });
    expect(zoneAudit.newValues).toMatchObject({ baseFee: 30, estimatedDeliveryMins: 45 });
    const restoredZonePricing = await request(baseUrl)
      .patch(`/api/v1/stores/${storeId}/zones/${zone.id}/pricing`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ baseFee: 25, estimatedDeliveryMins: 30 });
    expect(restoredZonePricing.status).toBe(200);

    const restored = await request(baseUrl)
      .patch(`/api/v1/stores/${storeId}/settings`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ minOrderAmount: 10, serviceRadiusKm: 10 });
    expect(restored.status).toBe(200);
    const superAdminUpdate = await request(baseUrl)
      .patch(`/api/v1/stores/${otherStoreId}/settings`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ minOrderAmount: 510 });
    expect(superAdminUpdate.status).toBe(200);
    const restoreOtherStore = await request(baseUrl)
      .patch(`/api/v1/stores/${otherStoreId}/settings`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ minOrderAmount: 500 });
    expect(restoreOtherStore.status).toBe(200);
  });

  it('matches polygon-based delivery zones outside the nearer radial tiers', async () => {
    const polygonZone = await prisma.deliveryZone.create({
      data: {
        storeId,
        zoneNumber: 3,
        name: 'Polygon zone',
        polygonCoordinates: [[
          [81.69, 7.74],
          [81.71, 7.74],
          [81.71, 7.76],
          [81.69, 7.76],
          [81.69, 7.74],
        ]],
        baseFee: 40,
        minOrderForFreeDelivery: 300,
      },
    });
    const address = await prisma.address.create({
      data: {
        customerId,
        label: 'Work',
        recipientName: 'Orders E2E Customer',
        recipientPhone: `+9478${suffix}`,
        streetAddress: 'Polygon test street',
        locality: 'Test',
        latitude: 7.75,
        longitude: 81.7,
      },
    });
    const response = await createOrder(3, undefined, address.id);
    expect(response.status).toBe(201);
    expect(response.body.data.deliveryZoneId).toBe(polygonZone.id);
    expect(response.body.data.deliveryFee).toBe('40');
    expect(response.body.data.totalAmount).toBe('190');

    const cancelled = await request(baseUrl)
      .post(`/api/v1/orders/${response.body.data.id}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ reason: 'Polygon zone test complete' });
    expect(cancelled.status).toBe(201);
  });

  it('releases rejected reservations and prevents negative stock', async () => {
    const order = await createOrder(2);
    expect(order.status).toBe(201);

    const outsiderRead = await request(baseUrl)
      .get(`/api/v1/orders/${order.body.data.id}`)
      .set('Authorization', `Bearer ${secondRiderToken}`);
    expect(outsiderRead.status).toBe(404);

    const rejected = await request(baseUrl)
      .post(`/api/v1/orders/${order.body.data.id}/reject`)
      .set('Authorization', `Bearer ${storeAdminToken}`)
      .send({ reason: 'Product unavailable for this order' });
    expect(rejected.status).toBe(201);
    expect(rejected.body.data.status).toBe(OrderStatus.REJECTED);
    expect(rejected.body.data.paymentStatus).toBe(PaymentStatus.CANCELLED);

    const stock = await prisma.storeProduct.findUniqueOrThrow({
      where: { id: storeProductId },
    });
    expect(stock.quantityReserved).toBe(0);

    const unavailable = await createOrder(101);
    expect(unavailable.status).toBe(409);
    const unchanged = await prisma.storeProduct.findUniqueOrThrow({
      where: { id: storeProductId },
    });
    expect(unchanged.quantityOnHand).toBe(100);
    expect(unchanged.quantityReserved).toBe(0);
  });

  it('keeps a per-store cart and checks it out with a single stock reservation', async () => {
      const added = await request(baseUrl)
        .post(`/api/v1/cart/${storeId}/items`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ storeProductId, quantity: 1 });
      expect(added.status).toBe(201);
      const increased = await request(baseUrl)
        .post(`/api/v1/cart/${storeId}/items`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ storeProductId, quantity: 2 });
      expect(increased.status).toBe(201);
      expect(increased.body.data.items[0].quantity).toBe(3);
      expect(increased.body.data.items[0]).not.toHaveProperty('storeProduct.quantityOnHand');
      expect(increased.body.data.items[0].product).not.toHaveProperty('costPrice');

      const checkout = await request(baseUrl)
        .post('/api/v1/orders/checkout')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ storeId, deliveryAddressId: addressId });
      expect(checkout.status).toBe(201);
      expect(checkout.body.data.paymentMethod).toBe('COD');
      expect(checkout.body.data.items[0].quantity).toBe(3);
      expect(await prisma.cartItem.count()).toBe(0);

      const reserved = await prisma.storeProduct.findUniqueOrThrow({
        where: { id: storeProductId },
      });
      expect(reserved.quantityReserved).toBe(3);
      const cancelled = await request(baseUrl)
        .post(`/api/v1/orders/${checkout.body.data.id}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ reason: 'Cart checkout test cleanup' });
      expect(cancelled.status).toBe(201);
      expect((await prisma.storeProduct.findUniqueOrThrow({
        where: { id: storeProductId },
      })).quantityReserved).toBe(0);
  });

  it('escalates an unanswered store order and releases its reservation through pg-boss', async () => {
      const response = await createOrder(2);
      expect(response.status).toBe(201);
      const orderId = response.body.data.id as string;
      await prisma.order.update({
        where: { id: orderId },
        data: { storeAcceptTimeoutAt: new Date(Date.now() - 1000) },
      });

      const dbUrl = new URL(process.env.DATABASE_URL!);
      const schema = dbUrl.searchParams.get('schema');
      dbUrl.searchParams.delete('schema');
      const boss = new PgBoss({
        connectionString: dbUrl.toString(),
        schema: schema ?? 'public',
        useListenNotify: false,
      });
      try {
        await boss.start();
        await boss.send('orders.timeout', { sweep: true });
      } finally {
        await boss.stop();
      }

      const deadline = Date.now() + 15_000;
      let order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
      while (order.status === OrderStatus.PLACED && Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
      }
      expect(order.status).toBe(OrderStatus.REJECTED);
      expect(order.paymentStatus).toBe(PaymentStatus.CANCELLED);
      expect(order.cancellationReason).toMatch(/did not respond/);
      expect(await prisma.storeAlert.findFirst({
        where: { orderId, alertType: 'ORDER_TIMEOUT_ESCALATED' },
      })).not.toBeNull();
      expect(await prisma.orderTimeline.findFirst({
        where: { orderId, status: OrderStatus.REJECTED, actorRole: Role.SYSTEM },
      })).not.toBeNull();
      expect(await prisma.stockMovement.count({
        where: { referenceId: orderId, reason: { contains: 'Released reservation' } },
      })).toBe(1);
      expect((await prisma.storeProduct.findUniqueOrThrow({
        where: { id: storeProductId },
      })).quantityReserved).toBe(0);
  });

  it('completes COD lifecycle, checks rider/store ownership, and locks at the cash threshold', async () => {
    const order = await createOrder(4);
    expect(order.status).toBe(201);
    expect(order.body.data.deliveryFee).toBe('0');
    expect(order.body.data.totalAmount).toBe('200');
    const orderId = order.body.data.id as string;

    const forbidden = await request(baseUrl)
      .post(`/api/v1/orders/${orderId}/accept`)
      .set('Authorization', `Bearer ${otherCustomerToken}`)
      .send({});
    expect(forbidden.status).toBe(403);

    const customerSocket = await connectSocket(customerToken);
    const storeSocket = await connectSocket(storeAdminToken);
    try {
      await emitSocketAck(customerSocket, 'join.order', { orderId });
      await emitSocketAck(storeSocket, 'join.store', { storeId });
      const placedStatus = waitForSocketEvent<{ status: OrderStatus }>(
        customerSocket,
        'order.status',
      );
      const accepted = await storeAction(orderId, 'accept');
      expect(accepted.status).toBe(201);
      expect((await placedStatus).status).toBe(OrderStatus.ACCEPTED);
      console.log(`ORDER_DEMO ${orderId}: PLACED -> ACCEPTED`);
    } finally {
      customerSocket.disconnect();
      storeSocket.disconnect();
    }
    expect((await storeAction(orderId, 'preparing')).status).toBe(201);
    console.log(`ORDER_DEMO ${orderId}: ACCEPTED -> PREPARING`);
    expect((await storeAction(orderId, 'ready')).status).toBe(201);
    console.log(`ORDER_DEMO ${orderId}: PREPARING -> READY`);

    const assigned = await request(baseUrl)
      .post(`/api/v1/orders/${orderId}/assign-rider`)
      .set('Authorization', `Bearer ${storeAdminToken}`)
      .send({ riderId });
    expect(assigned.status).toBe(201);
    console.log(`ORDER_DEMO ${orderId}: READY -> RIDER_ASSIGNED`);
    const trackingSocket = await connectSocket(customerToken);
    const locationSocket = await connectSocket(riderToken);
    try {
      await emitSocketAck(trackingSocket, 'join.order', { orderId });
      const locationEvent = waitForSocketEvent<{ orderId: string; riderId: string }>(
        trackingSocket,
        'rider.location',
      );
      const locationAck = await emitSocketAck(locationSocket, 'rider.location', {
        latitude: 7.71,
        longitude: 81.7,
        heading: 90,
        speedKmh: 20,
      });
      expect(locationAck).toMatchObject({ accepted: true });
      expect(await locationEvent).toMatchObject({ orderId, riderId });
      expect(await prisma.riderLocationHistory.count({ where: { orderId, riderId } })).toBe(1);
    } finally {
      trackingSocket.disconnect();
      locationSocket.disconnect();
    }

    const riderForbidden = await request(baseUrl)
      .post(`/api/v1/orders/${orderId}/pick-up`)
      .set('Authorization', `Bearer ${secondRiderToken}`)
      .send({});
    expect(riderForbidden.status).toBe(404);

    const pickedUp = await request(baseUrl)
      .post(`/api/v1/orders/${orderId}/pick-up`)
      .set('Authorization', `Bearer ${riderToken}`)
      .send({});
    expect(pickedUp.status).toBe(201);
    console.log(`ORDER_DEMO ${orderId}: RIDER_ASSIGNED -> PICKED_UP`);
    expect((await riderAction(orderId, 'start-delivery', riderToken)).status).toBe(201);

    const wrongAmount = await request(baseUrl)
      .post(`/api/v1/orders/${orderId}/deliver`)
      .set('Authorization', `Bearer ${riderToken}`)
      .send({ collectedAmount: 199.99 });
    expect(wrongAmount.status).toBe(400);

    const delivered = await request(baseUrl)
      .post(`/api/v1/orders/${orderId}/deliver`)
      .set('Authorization', `Bearer ${riderToken}`)
      .send({ collectedAmount: 200 });
    expect(delivered.status).toBe(201);
    console.log(`ORDER_DEMO ${orderId}: ON_THE_WAY -> DELIVERED (COD collected)`);
    expect(delivered.body.data.status).toBe(OrderStatus.DELIVERED);
    expect(delivered.body.data.paymentStatus).toBe(PaymentStatus.COLLECTED_BY_RIDER);
    expect((await prisma.storeProduct.findUniqueOrThrow({
      where: { id: storeProductId },
    })).quantityOnHand).toBe(96);
    const rider = await prisma.riderProfile.findUniqueOrThrow({
      where: { id: riderId },
    });
    expect(rider.cashInHand.toString()).toBe('200');
    expect(rider.isCashLocked).toBe(true);
    expect(rider.oldestCashCollectionTime).not.toBeNull();
    const cashLedgerEntry = await prisma.riderCashLedgerEntry.findUniqueOrThrow({
      where: { orderId },
    });
    expect(cashLedgerEntry.entryType).toBe('DELIVERY_COLLECTION');
    expect(cashLedgerEntry.amount.toString()).toBe('200');
    expect(cashLedgerEntry.balanceAfter.toString()).toBe('200');
    expect(
      await prisma.auditLog.count({
        where: {
          action: 'RIDER_COD_CASH_COLLECTED',
          entityId: riderId,
        },
      }),
    ).toBe(1);
  });

  it('restocks a failed delivery and serializes competing stock reservations', async () => {
    const order = await createOrder(1);
    expect(order.status).toBe(201);
    const orderId = order.body.data.id as string;
    expect((await storeAction(orderId, 'accept')).status).toBe(201);
    expect((await storeAction(orderId, 'preparing')).status).toBe(201);
    expect((await storeAction(orderId, 'ready')).status).toBe(201);

    const assigned = await request(baseUrl)
      .post(`/api/v1/orders/${orderId}/assign-rider`)
      .set('Authorization', `Bearer ${storeAdminToken}`)
      .send({ riderId: secondRiderId });
    expect(assigned.status).toBe(201);
    expect(
      (
        await request(baseUrl)
          .post(`/api/v1/orders/${orderId}/pick-up`)
          .set('Authorization', `Bearer ${secondRiderToken}`)
          .send({})
      ).status,
    ).toBe(201);
    expect((await riderAction(orderId, 'start-delivery', secondRiderToken)).status).toBe(201);
    const failed = await request(baseUrl)
      .post(`/api/v1/orders/${orderId}/fail`)
      .set('Authorization', `Bearer ${secondRiderToken}`)
      .send({ reason: 'Customer could not be reached' });
    expect(failed.status).toBe(201);
    expect(failed.body.data.status).toBe(OrderStatus.FAILED);

    const stockAfterRestock = await prisma.storeProduct.findUniqueOrThrow({
      where: { id: storeProductId },
    });
    expect(stockAfterRestock.quantityOnHand).toBe(96);
    expect(stockAfterRestock.quantityReserved).toBe(0);

    const attempts = await Promise.all([createOrder(60), createOrder(60)]);
    expect(attempts.map((result) => result.status).sort()).toEqual([201, 409]);
    const successful = attempts.find((result) => result.status === 201);
    expect(successful).toBeDefined();
    const stockWithReservation = await prisma.storeProduct.findUniqueOrThrow({
      where: { id: storeProductId },
    });
    expect(stockWithReservation.quantityReserved).toBe(60);
    expect(stockWithReservation.quantityOnHand - stockWithReservation.quantityReserved).toBe(36);

    const cancelled = await request(baseUrl)
      .post(`/api/v1/orders/${successful?.body.data.id}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ reason: 'Concurrent test cleanup' });
    expect(cancelled.status).toBe(201);
    const stockAfterCancel = await prisma.storeProduct.findUniqueOrThrow({
      where: { id: storeProductId },
    });
    expect(stockAfterCancel.quantityReserved).toBe(0);

    await prisma.riderProfile.update({
      where: { id: secondRiderId },
      data: {
        cashInHand: 100,
        oldestCashCollectionTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
    });
    const overdueCashOrder = await createOrder(1);
    expect(overdueCashOrder.status).toBe(201);
    const overdueOrderId = overdueCashOrder.body.data.id as string;
    expect((await storeAction(overdueOrderId, 'accept')).status).toBe(201);
    expect((await storeAction(overdueOrderId, 'preparing')).status).toBe(201);
    expect((await storeAction(overdueOrderId, 'ready')).status).toBe(201);
    const overdueAssignment = await request(baseUrl)
      .post(`/api/v1/orders/${overdueOrderId}/assign-rider`)
      .set('Authorization', `Bearer ${storeAdminToken}`)
      .send({ riderId: secondRiderId });
    expect(overdueAssignment.status).toBe(409);
    const lockedRider = await prisma.riderProfile.findUniqueOrThrow({
      where: { id: secondRiderId },
    });
    expect(lockedRider.isCashLocked).toBe(true);
    expect(lockedRider.cashLockReason).toMatch(/at least 4 hours/);
  });

  async function createOrder(
    quantity: number,
    deliveryZoneId?: string,
    deliveryAddressId = addressId,
    campaignCodes?: string[],
  ) {
    const response = await request(baseUrl)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        storeId,
        deliveryAddressId,
        ...(deliveryZoneId ? { deliveryZoneId } : {}),
        ...(campaignCodes ? { campaignCodes } : {}),
        items: [{ storeProductId, quantity }],
      });
    return response;
  }

  async function createCampaign(input: {
    name: string;
    type: 'FREE_DELIVERY' | 'FIXED_DISCOUNT' | 'PERCENTAGE_DISCOUNT';
    value: number;
    code?: string;
    maxDiscount?: number;
  }) {
    const response = await request(baseUrl)
      .post('/api/v1/campaigns')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        ...input,
        storeId,
        startsAt: new Date(Date.now() - 60_000).toISOString(),
        endsAt: new Date(Date.now() + 60 * 60_000).toISOString(),
      });
    expect(response.status).toBe(201);
    return response.body.data as {
      id: string;
      code: string;
    };
  }

  async function storeAction(orderId: string, action: string) {
    return request(baseUrl)
      .post(`/api/v1/orders/${orderId}/${action}`)
      .set('Authorization', `Bearer ${storeAdminToken}`)
      .send({});
  }

  async function riderAction(orderId: string, action: string, token: string) {
    return request(baseUrl)
      .post(`/api/v1/orders/${orderId}/${action}`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
  }

  async function connectSocket(token: string): Promise<Socket> {
    const socket = io(`${baseUrl}/events`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: false,
      timeout: 5000,
    });
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Socket connection timed out')), 5000);
      socket.once('connect', () => {
        clearTimeout(timer);
        resolve();
      });
      socket.once('connect_error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
    return socket;
  }

  function emitSocketAck(socket: Socket, event: string, payload: unknown) {
    return new Promise<unknown>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`Socket event ${event} did not acknowledge`)),
        5000,
      );
      socket.emit(event, payload, (response: unknown) => {
        clearTimeout(timer);
        resolve(response);
      });
    });
  }

  function waitForSocketEvent<T>(
    socket: Socket,
    event: string,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        socket.off(event, handler);
        reject(new Error(`Socket event ${event} was not received`));
      }, 5000);
      const handler = (payload: T) => {
        clearTimeout(timer);
        resolve(payload);
      };
      socket.once(event, handler);
    });
  }

  async function waitForApi() {
    const deadline = Date.now() + 30_000;
    let lastStatus = 'no response';
    while (Date.now() < deadline) {
      if (apiProcess?.exitCode !== null) {
        const output = apiOutput.join('').replace(
          /postgres(?:ql)?:\/\/[^\s@]+@/gi,
          'postgresql://[redacted]@',
        );
        throw new Error(
          `API process exited with code ${apiProcess?.exitCode}\n${output.slice(-4000)}`,
        );
      }
      try {
        const response = await fetch(`${baseUrl}/health`);
        const body = await response.json() as { data?: { database?: string } };
        if (response.ok && body.data?.database === 'ok') return;
        lastStatus = `HTTP ${response.status}`;
      } catch {
        lastStatus = 'connection refused';
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
    throw new Error(`Orders E2E API did not become healthy within 30 seconds (${lastStatus})`);
  }
});
