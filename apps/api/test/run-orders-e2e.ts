import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';

async function main() {
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) throw new Error('DATABASE_URL must be configured for Orders E2E tests');

  const schema = `buyme_e2e_${randomUUID().replace(/-/g, '')}`;
  const testUrl = new URL(baseUrl);
  testUrl.searchParams.set('schema', schema);
  const tempRoot = resolve('E:\\buyme-tmp');
  const storageDirectory = resolve(tempRoot, `buyme-orders-e2e-${randomUUID()}`);
  if (!storageDirectory.toLowerCase().startsWith(`${tempRoot.toLowerCase()}\\`)) {
    throw new Error('Orders E2E image storage must stay under E:\\buyme-tmp');
  }

  const database = new PrismaClient({ datasources: { db: { url: baseUrl } } });
  let schemaCreated = false;
  try {
    await database.$connect();
    await database.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
    schemaCreated = true;
    await mkdir(storageDirectory, { recursive: true });

    const env = {
      ...process.env,
      DATABASE_URL: testUrl.toString(),
      NODE_ENV: 'test',
      STORAGE_LOCAL_DIR: storageDirectory,
    };
    const prismaCli = join(process.cwd(), 'node_modules', 'prisma', 'build', 'index.js');
    const migration = spawnSync(process.execPath, [prismaCli, 'migrate', 'deploy'], {
      cwd: process.cwd(),
      env,
      stdio: 'inherit',
    });
    if (migration.error) throw migration.error;
    if (migration.status !== 0) throw new Error('Disposable-schema migrations failed');

    const vitestCli = join(process.cwd(), 'node_modules', 'vitest', 'vitest.mjs');
    const tests = spawnSync(
      process.execPath,
      [vitestCli, 'run', 'test/orders.e2e-spec.ts', '--config', 'vitest.config.ts'],
      { cwd: process.cwd(), env, stdio: 'inherit' },
    );
    if (tests.error) throw tests.error;
    if (tests.status !== 0) throw new Error('Orders E2E tests failed');
  } finally {
    if (schemaCreated) {
      await database.$executeRawUnsafe(`DROP SCHEMA "${schema}" CASCADE`);
    }
    await database.$disconnect();
    await rm(storageDirectory, { recursive: true, force: true });
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Orders E2E runner failed');
  process.exitCode = 1;
});
