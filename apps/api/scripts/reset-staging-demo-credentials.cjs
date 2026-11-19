const { randomBytes, randomInt, pbkdf2Sync } = require('node:crypto');
const { PrismaClient, Role } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  if (process.env.APP_ENV !== 'staging' || !process.env.DATABASE_URL) {
    throw new Error('This script requires APP_ENV=staging and DATABASE_URL.');
  }

  const superAdminPassword = randomBytes(24).toString('base64url');
  const storeAdminPassword = randomBytes(24).toString('base64url');
  const demoOtpCode = String(randomInt(100000, 1000000));
  function pbkdf2Hash(password) {
    const salt = randomBytes(16);
    const iterations = 100000;
    const derived = pbkdf2Sync(password, salt, iterations, 32, 'sha256');
    return `pbkdf2$${iterations}$${salt.toString('hex')}$${derived.toString('hex')}`;
  }
  const superAdminHash = pbkdf2Hash(superAdminPassword);
  const storeAdminHash = pbkdf2Hash(storeAdminPassword);
  const [superAdmin, storeAdmin] = await Promise.all([
    prisma.user.findUnique({ where: { email: 'admin@buyme.lk' } }),
    prisma.user.findUnique({ where: { email: 'manager.bm-s01@buyme.lk' } }),
  ]);
  if (
    !superAdmin?.isDemoAccount ||
    superAdmin.role !== Role.SUPER_ADMIN ||
    !storeAdmin?.isDemoAccount ||
    storeAdmin.role !== Role.STORE_ADMIN
  ) {
    throw new Error('Expected seeded BM-S01 demo admin accounts were not found.');
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: superAdmin.id },
      data: { passwordHash: superAdminHash, isActive: true, isTwoFactorEnabled: true },
    }),
    prisma.user.update({
      where: { id: storeAdmin.id },
      data: { passwordHash: storeAdminHash, isActive: true },
    }),
  ]);

  process.stdout.write(JSON.stringify({
    superAdminPassword,
    storeAdminPassword,
    demoOtpCode,
  }));
}

main()
  .catch((error) => {
    console.error('Could not reset staging demo credentials.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
