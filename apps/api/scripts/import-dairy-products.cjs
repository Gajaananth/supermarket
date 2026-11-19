const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim());
  const headers = lines.shift().split(',').map((value) => value.trim());
  return lines.map((line) => {
    const values = line.split(',').map((value) => value.trim());
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
  });
}

function slugify(value) {
  return value.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function unitFor(name) {
  if (/1l$/i.test(name)) return 'l';
  if (/180ml|170ml/i.test(name)) return 'ml';
  if (/400g|300g|200g|1kg/i.test(name)) return 'g';
  return 'pack';
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) throw new Error('CSV path is required.');

  const category = await prisma.category.findUnique({ where: { slug: 'dairy-eggs' } });
  if (!category) throw new Error('Dairy & Eggs category is missing.');

  const store = await prisma.store.findUnique({ where: { code: 'BM-S01' } });
  if (!store) throw new Error('BM-S01 store is missing.');

  const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));
  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    const name = row['Product Name'];
    const price = row['Price (Rs)'];
    const discount = row['Discount (Rs)'];
    const mrp = row['MRP (Rs)'];
    const image = row['Image'];
    if (!name || !price) {
      skipped += 1;
      continue;
    }

    const basePrice = Number(price);
    if (!Number.isFinite(basePrice) || basePrice <= 0) {
      skipped += 1;
      continue;
    }

    const slug = slugify(name);
    const sku = `DAIRY-${slug.slice(0, 40).toUpperCase()}`;
    const barcode = `BUYME-DAIRY-${slug}`;
    const descriptionParts = [];
    if (discount) descriptionParts.push(`Listed discount: Rs ${discount}`);
    if (mrp) descriptionParts.push(`MRP: Rs ${mrp}`);

    const product = await prisma.masterProduct.upsert({
      where: { sku },
      update: {
        name,
        barcode,
        unit: unitFor(name),
        costPrice: basePrice,
        baseSellingPrice: basePrice,
        description: descriptionParts.join('. ') || null,
        imageUrl: `/images/dairy/${image}`,
        categoryId: category.id,
        isActive: true,
      },
      create: {
        sku,
        barcode,
        name,
        unit: unitFor(name),
        costPrice: basePrice,
        baseSellingPrice: basePrice,
        description: descriptionParts.join('. ') || null,
        imageUrl: `/images/dairy/${image}`,
        categoryId: category.id,
        isActive: true,
      },
    });

    await prisma.storeProduct.upsert({
      where: { storeId_masterProductId: { storeId: store.id, masterProductId: product.id } },
      update: { quantityOnHand: 40, isAvailable: true },
      create: {
        storeId: store.id,
        masterProductId: product.id,
        quantityOnHand: 40,
        quantityReserved: 0,
        isAvailable: true,
      },
    });
    imported += 1;
  }

  console.log(JSON.stringify({ imported, skipped }));
}

main()
  .catch((error) => {
    console.error('Dairy import failed.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
