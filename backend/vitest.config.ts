import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    // mongodb-memory-server's first boot (spawning the binary) can be slow on a cold cache.
    testTimeout: 30000,
    hookTimeout: 60000,
    // requireUserId() short-circuits to 503 unless these look configured; route tests mock
    // @clerk/express itself, so the values only need to be truthy, never real credentials.
    env: {
      CLERK_PUBLISHABLE_KEY: 'test_pub_key',
      CLERK_SECRET_KEY: 'test_secret_key',
    },
  },
});
