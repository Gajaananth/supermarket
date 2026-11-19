import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false,
    include: ['test/**/*.{test,spec,e2e-spec}.ts'],
    sequence: {
      concurrent: false,
    },
  },
});
