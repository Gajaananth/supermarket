import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';

async function main() {
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) throw new Error('DATABASE_URL must be configured for cash-control E2E tests');

  const schema = `buyme_e2e_${randomUUID().replace(/-/g, '')}`;
  const testUrl = new URL(baseUrl);
  testUrl.searchParams.set('schema', schema);
  const tempRoot = resolve('E:\\buyme-tmp');
  const storageDirectory = resolve(tempRoot, `buyme-cash-e2e-${randomUUID()}`);
  if (!storageDirectory.toLowerCase().startsWith(`${tempRoot.toLowerCase()}\\`)) {
    throw new Error('Cash-control E2E storage must stay under E:\\buyme-tmp');
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
      OBJECT_STORAGE_ENDPOINT: 'http://127.0.0.1:4405',
      OBJECT_STORAGE_REGION: 'us-east-1',
      OBJECT_STORAGE_BUCKET: 'buyme-private-test',
      OBJECT_STORAGE_ACCESS_KEY_ID: 'test-access-key',
      OBJECT_STORAGE_SECRET_ACCESS_KEY: 'test-secret-key',
      OBJECT_STORAGE_FORCE_PATH_STYLE: 'true',
      OBJECT_STORAGE_PRESIGN_TTL_SECONDS: '600',
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
      [vitestCli, 'run', 'test/cash-control.e2e-spec.ts', '--config', 'vitest.config.ts'],
      { cwd: process.cwd(), env, stdio: 'inherit' },
    );
    if (tests.error) throw tests.error;
    if (tests.status !== 0) throw new Error('Cash-control E2E tests failed');
  } finally {
    if (schemaCreated) {
      await database.$executeRawUnsafe(`DROP SCHEMA "${schema}" CASCADE`);
    }
    await database.$disconnect();
    await rm(storageDirectory, { recursive: true, force: true });
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Cash-control E2E runner failed');
  process.exitCode = 1;
});
