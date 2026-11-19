const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  if (process.env.APP_ENV !== 'staging') {
    throw new Error('This script requires APP_ENV=staging.');
  }

  const store = await prisma.store.findUnique({ where: { code: 'BM-S01' } });
  if (!store) throw new Error('BM-S01 was not found.');

  const mockProducts = await prisma.masterProduct.findMany({
    where: {
      OR: [
        { sku: { startsWith: 'STP-' } },
        { sku: { startsWith: 'DRY-' } },
        { sku: { startsWith: 'BKY-' } },
        { sku: { startsWith: 'BEV-' } },
        { sku: { startsWith: 'PRD-' } },
        { sku: { startsWith: 'SEA-' } },
        { sku: { startsWith: 'HSD-' } },
        { sku: { startsWith: 'BBY-' } },
      ],
    },
    select: { id: true, sku: true, name: true },
  });

  const mockIds = mockProducts.map((product) => product.id);
  let removedStoreLinks = 0;

  if (mockIds.length > 0) {
    const deletedLinks = await prisma.storeProduct.deleteMany({
      where: { storeId: store.id, masterProductId: { in: mockIds } },
    });
    removedStoreLinks = deletedLinks.count;
  }

  await prisma.storeProduct.deleteMany({
    where: {
      storeId: store.id,
      masterProduct: {
        category: { slug: { not: 'dairy-eggs' } },
      },
    },
  });

  const remaining = await prisma.storeProduct.count({
    where: { storeId: store.id, isAvailable: true },
  });

  console.log(JSON.stringify({
    mockProductsFound: mockProducts.length,
    removedStoreLinks,
    remainingAvailableInBmS01: remaining,
  }));
}

main()
  .catch((error) => {
    console.error('Could not remove mock catalog products.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
