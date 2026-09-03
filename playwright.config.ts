import { defineConfig, devices } from '@playwright/test';

const deployedBaseUrl = process.env.E2E_BASE_URL
  ? `${process.env.E2E_BASE_URL.replace(/\/$/, '')}/`
  : undefined;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: deployedBaseUrl ?? 'http://127.0.0.1:4173/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: deployedBaseUrl ? undefined : {
    command: 'VITE_CLERK_PUBLISHABLE_KEY= VITE_API_URL= npm run build -w frontend && npm exec --workspace frontend vite -- preview --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'public-chromium',
      testIgnore: [/clerk\.setup\.ts/, /authenticated\.spec\.ts/],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'clerk-setup',
      testMatch: /clerk\.setup\.ts/,
    },
    {
      name: 'authenticated-chromium',
      testMatch: /authenticated\.spec\.ts/,
      dependencies: ['clerk-setup'],
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
