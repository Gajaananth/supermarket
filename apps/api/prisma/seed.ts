import {
  PrismaClient,
  Role,
  RiderType,
  KycStatus,
  StockMovementType,
  LocationType,
} from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting BuyMe Database Seeding (NestJS / Prisma)...');

  const appEnvironment = process.env.APP_ENV ??
    (process.env.NODE_ENV === 'production' ? 'production' : 'development');
  if (
    appEnvironment === 'production' ||
    (appEnvironment === 'staging' && process.env.NODE_ENV !== 'production')
  ) {
    throw new Error('Demo seeding is permitted only in local development or staging.');
  }
  if (process.env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error('Set ALLOW_DEMO_SEED=true to explicitly enable this demo seed.');
  }

  const existingRecords = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.warehouse.count(),
    prisma.masterProduct.count(),
  ]);
  if (existingRecords.some((count) => count > 0)) {
    throw new Error(
      'Refusing to seed a non-empty database. This seed only runs against an empty database.',
    );
  }

  const superAdminPassword = process.env.SEED_SUPER_ADMIN_PASSWORD;
  const storeAdminPassword = process.env.SEED_STORE_ADMIN_PASSWORD;
  if (
    !superAdminPassword ||
    superAdminPassword.length < 12 ||
    !storeAdminPassword ||
    storeAdminPassword.length < 12
  ) {
    throw new Error(
      'SEED_SUPER_ADMIN_PASSWORD and SEED_STORE_ADMIN_PASSWORD must each contain at least 12 characters.',
    );
  }

  const superAdminPasswordHash = await argon2.hash(superAdminPassword);
  const storeAdminPasswordHash = await argon2.hash(storeAdminPassword);

  // 2. Seed Main Central Warehouse
  const warehouse = await prisma.warehouse.create({
    data: {
      code: 'WH-MAIN',
      name: 'BuyMe Central Fulfillment Center',
      address: 'Central Warehouse District, Batticaloa',
      latitude: 7.7200,
      longitude: 81.7000,
      contactPhone: '+94652220000',
      isActive: true,
    },
  });
  console.log(`🏭 Created Central Warehouse: ${warehouse.name} (${warehouse.code})`);

  // 3. Seed 10 Stores around Batticaloa with APPROXIMATE area-level positions
  const storeData = [
    { code: 'BM-S01', name: 'BuyMe Batticaloa Town', slug: 'buyme-batticaloa-town', address: 'Puliyanthivu Main Area, Batticaloa', locality: 'Puliyanthivu', lat: 7.7100, lng: 81.6900, phone: '+94652221001', radiusKm: 7.0 },
    { code: 'BM-S02', name: 'BuyMe Kallady', slug: 'buyme-kallady', address: 'Kallady Bridge Area, Kallady', locality: 'Kallady', lat: 7.7000, lng: 81.7100, phone: '+94652221002', radiusKm: 6.0 },
    { code: 'BM-S03', name: 'BuyMe Kattankudy', slug: 'buyme-kattankudy', address: 'Kattankudy Central Area', locality: 'Kattankudy', lat: 7.6700, lng: 81.7300, phone: '+94652221003', radiusKm: 6.5 },
    { code: 'BM-S04', name: 'BuyMe Eravur', slug: 'buyme-eravur', address: 'Eravur Town Area', locality: 'Eravur', lat: 7.7800, lng: 81.6000, phone: '+94652221004', radiusKm: 8.0 },
    { code: 'BM-S05', name: 'BuyMe Chenkalady', slug: 'buyme-chenkalady', address: 'Chenkalady Junction Area', locality: 'Chenkalady', lat: 7.7900, lng: 81.5700, phone: '+94652221005', radiusKm: 8.0 },
    { code: 'BM-S06', name: 'BuyMe Valaichchenai', slug: 'buyme-valaichchenai', address: 'Valaichchenai Area', locality: 'Valaichchenai', lat: 7.9200, lng: 81.5300, phone: '+94652221006', radiusKm: 9.0 },
    { code: 'BM-S07', name: 'BuyMe Oddamavadi', slug: 'buyme-oddamavadi', address: 'Oddamavadi Bridge Area', locality: 'Oddamavadi', lat: 7.9100, lng: 81.5300, phone: '+94652221007', radiusKm: 7.5 },
    { code: 'BM-S08', name: 'BuyMe Kokkadichcholai', slug: 'buyme-kokkadichcholai', address: 'Kokkadichcholai Area', locality: 'Kokkadichcholai', lat: 7.6500, lng: 81.6800, phone: '+94652221008', radiusKm: 8.5 },
    { code: 'BM-S09', name: 'BuyMe Karadiyanaru', slug: 'buyme-karadiyanaru', address: 'Karadiyanaru Agrarian Center Area', locality: 'Karadiyanaru', lat: 7.7400, lng: 81.4900, phone: '+94652221009', radiusKm: 10.0 },
    { code: 'BM-S10', name: 'BuyMe Vakarai', slug: 'buyme-vakarai', address: 'Vakarai Coastal Area', locality: 'Vakarai', lat: 8.1300, lng: 81.4300, phone: '+94652221010', radiusKm: 12.0 },
  ];

  const stores: any[] = [];
  for (const s of storeData) {
    const store = await prisma.store.create({
      data: {
        code: s.code,
        name: s.name,
        slug: s.slug,
        address: s.address,
        locality: s.locality,
        latitude: s.lat,
        longitude: s.lng,
        contactPhone: s.phone,
        contactEmail: `store.${s.code.toLowerCase()}@buyme.lk`,
        serviceRadiusKm: s.radiusKm,
        openingTime: '07:00',
        closingTime: '22:00',
        isActive: true,
        minOrderAmount: 500.0,
        freeDeliveryThreshold: 4000.0,
        cashHoldThreshold: 10000.0,
        cashHoldMaxHours: 4,
        allowPriceOverride: true,
        deliveryZones: {
          create: [
            { zoneNumber: 1, name: 'Hyperlocal Core (0 - 2 km)', radiusKm: 2.0, baseFee: 100.0, minOrderForFreeDelivery: 2500.0, estimatedDeliveryMins: 25 },
            { zoneNumber: 2, name: 'Inner Ring (2 - 4 km)', radiusKm: 4.0, baseFee: 150.0, minOrderForFreeDelivery: 3000.0, estimatedDeliveryMins: 35 },
            { zoneNumber: 3, name: 'Mid Zone (4 - 6 km)', radiusKm: 6.0, baseFee: 220.0, minOrderForFreeDelivery: 3500.0, estimatedDeliveryMins: 45 },
            { zoneNumber: 4, name: 'Outer Suburban (6 - 8 km)', radiusKm: 8.0, baseFee: 300.0, minOrderForFreeDelivery: 4000.0, estimatedDeliveryMins: 55 },
            { zoneNumber: 5, name: 'Extended Border (8 - 10 km)', radiusKm: 10.0, baseFee: 400.0, minOrderForFreeDelivery: 5000.0, estimatedDeliveryMins: 70 },
          ],
        },
      },
    });
    stores.push(store);
  }
  console.log(`🏪 Created ${stores.length} Hyperlocal Stores with approximate area-level positions.`);

  // 4. Seed Product Categories
  const categoryData = [
    { name: 'Fresh Produce', slug: 'produce', icon: '🥬', sortOrder: 1 },
    { name: 'Dairy & Eggs', slug: 'dairy-eggs', icon: '🥛', sortOrder: 2 },
    { name: 'Pantry & Staples', slug: 'pantry-staples', icon: '🌾', sortOrder: 3 },
    { name: 'Bakery & Snacks', slug: 'bakery-snacks', icon: '🍞', sortOrder: 4 },
    { name: 'Beverages', slug: 'beverages', icon: '🧃', sortOrder: 5 },
    { name: 'Meat & Seafood', slug: 'meat-seafood', icon: '🐟', sortOrder: 6 },
    { name: 'Personal & Household', slug: 'personal-household', icon: '🧼', sortOrder: 7 },
    { name: 'Baby & Pet Essentials', slug: 'baby-pet', icon: '🍼', sortOrder: 8 },
  ];

  const categories: Record<string, string> = {};
  for (const c of categoryData) {
    const cat = await prisma.category.create({ data: c });
    categories[c.slug] = cat.id;
  }

  // 5. Seed Sample Master Products
  const masterProductData = [
    { name: 'Keells Super Samba Rice 5kg', sku: 'STP-RIC-001', barcode: '4792011001011', unit: 'bag', costPrice: 1100.0, basePrice: 1250.0, categorySlug: 'pantry-staples' },
    { name: 'Prima Super Fine Wheat Flour 1kg', sku: 'STP-FLR-001', barcode: '4792011001028', unit: 'pack', costPrice: 240.0, basePrice: 280.0, categorySlug: 'pantry-staples' },
    { name: 'Fortune White Coconut Cooking Oil 1L', sku: 'STP-OIL-001', barcode: '4792011001042', unit: 'bottle', costPrice: 650.0, basePrice: 740.0, categorySlug: 'pantry-staples' },
    { name: 'Highland Pure Fresh Pasteurized Milk 1L', sku: 'DRY-MLK-001', barcode: '4792022002018', unit: 'carton', costPrice: 460.0, basePrice: 520.0, categorySlug: 'dairy-eggs' },
    { name: 'Fresh Farm Brown Eggs (Pack of 10)', sku: 'DRY-EGG-001', barcode: '4792022002049', unit: 'pack', costPrice: 480.0, basePrice: 560.0, categorySlug: 'dairy-eggs' },
    { name: 'Maliban Gold Marie Biscuits 400g', sku: 'BKY-BSC-001', barcode: '4792033003015', unit: 'pack', costPrice: 280.0, basePrice: 330.0, categorySlug: 'bakery-snacks' },
    { name: 'Dilmah Premium Pure Ceylon Tea 400g', sku: 'BEV-TEA-001', barcode: '4792044004029', unit: 'pack', costPrice: 750.0, basePrice: 870.0, categorySlug: 'beverages' },
    { name: 'Elephant House Cream Soda 1.5L Mega Bottle', sku: 'BEV-SDA-001', barcode: '4792044004012', unit: 'bottle', costPrice: 320.0, basePrice: 380.0, categorySlug: 'beverages' },
    { name: 'Local Red Onions 1kg', sku: 'PRD-VEG-001', barcode: '4792055005019', unit: 'kg', costPrice: 360.0, basePrice: 440.0, categorySlug: 'produce' },
    { name: 'Batticaloa Lagoon Jumbo Prawns Cleaned 500g', sku: 'SEA-PRW-001', barcode: '4792066006016', unit: 'pack', costPrice: 1250.0, basePrice: 1480.0, categorySlug: 'meat-seafood' },
    { name: 'Sunlight Lemon Fresh Dishwash Liquid 500ml', sku: 'HSD-DSH-001', barcode: '4792077007013', unit: 'bottle', costPrice: 290.0, basePrice: 340.0, categorySlug: 'personal-household' },
    { name: 'Baby Cheramy Floral Moisture Baby Soap 100g', sku: 'BBY-SOP-001', barcode: '4792088008010', unit: 'bar', costPrice: 160.0, basePrice: 195.0, categorySlug: 'baby-pet' },
  ];

  const masterProducts: any[] = [];
  for (const p of masterProductData) {
    const categoryId = categories[p.categorySlug];
    const created = await prisma.masterProduct.create({
      data: {
        sku: p.sku,
        barcode: p.barcode,
        name: p.name,
        unit: p.unit,
        costPrice: p.costPrice,
        baseSellingPrice: p.basePrice,
        categoryId: categoryId,
        isActive: true,
      },
    });
    masterProducts.push(created);

    await prisma.masterInventory.create({
      data: {
        warehouseId: warehouse.id,
        masterProductId: created.id,
        quantityOnHand: 1000,
        quantityReserved: 0,
      },
    });
  }

  // Populate Store Products
  for (const store of stores) {
    for (const mp of masterProducts) {
      await prisma.storeProduct.create({
        data: {
          storeId: store.id,
          masterProductId: mp.id,
          quantityOnHand: 40,
          quantityReserved: 0,
          isAvailable: true,
        },
      });
    }
  }
  console.log(`📦 Seeded sample products for warehouse and 10 stores.`);

  // 6. Users: Super Admin (with argon2 hash and 2FA enabled)
  const superAdmin = await prisma.user.create({
    data: {
      phone: '+94770000001',
      email: 'admin@buyme.lk',
      passwordHash: superAdminPasswordHash,
      fullName: 'Senthil Kumar (Super Admin)',
      role: Role.SUPER_ADMIN,
      isActive: true,
      isDemoAccount: true,
      isTwoFactorEnabled: true, // Super admin requires 2FA OTP
    },
  });

  // Store Admins (with argon2 hash, no 2FA)
  for (let i = 0; i < stores.length; i++) {
    const store = stores[i];
    const sa = await prisma.user.create({
      data: {
        phone: `+947700000${(11 + i).toString().padStart(2, '0')}`,
        email: `manager.${store.code.toLowerCase()}@buyme.lk`,
        passwordHash: storeAdminPasswordHash,
        fullName: `Manager - ${store.name}`,
        role: Role.STORE_ADMIN,
        isActive: true,
        isDemoAccount: true,
        isTwoFactorEnabled: false,
      },
    });
    await prisma.storeAdmin.create({
      data: {
        userId: sa.id,
        storeId: store.id,
      },
    });
  }
  console.log(`👤 Seeded Super Admin (2FA enabled) & 10 Store Admins with argon2 passwords.`);

  // Sample Approved Rider
  const riderUser = await prisma.user.create({
    data: {
      phone: '+94771110001',
      email: 'rider.batti@buyme.lk',
      fullName: 'Kavishan Sivakumar (Rider)',
      role: Role.RIDER,
      isActive: true,
      isDemoAccount: true,
    },
  });

  await prisma.riderProfile.create({
    data: {
      userId: riderUser.id,
      assignedStoreId: stores[0].id,
      riderType: RiderType.EMPLOYEE,
      kycStatus: KycStatus.APPROVED,
      bikeNumber: 'EP-BC-2001',
      drivingLicenceNumber: 'B7890123',
      approvedByUserId: superAdmin.id,
      approvedAt: new Date(),
      isShiftActive: true,
      currentLocationLat: 7.7100,
      currentLocationLng: 81.6900,
      cashInHand: 0.0,
      isCashLocked: false,
    },
  });

  // Sample Customer
  const customerUser = await prisma.user.create({
    data: {
      phone: '+94772220001',
      fullName: 'Dr. Tharmalingam (Customer)',
      role: Role.CUSTOMER,
      isActive: true,
      isDemoAccount: true,
    },
  });

  const cp = await prisma.customerProfile.create({
    data: { userId: customerUser.id },
  });

  await prisma.address.create({
    data: {
      customerId: cp.id,
      label: 'Home',
      recipientName: 'Dr. Tharmalingam',
      recipientPhone: '+94772220001',
      streetAddress: '18 Bar Road, Batticaloa',
      locality: 'Puliyanthivu',
      latitude: 7.7120,
      longitude: 81.6940,
      isDefault: true,
    },
  });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
