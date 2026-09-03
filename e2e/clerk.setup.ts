import { clerkSetup } from '@clerk/testing/playwright';
import { test as setup } from '@playwright/test';

const canRunAuthenticatedTests = Boolean(
  process.env.E2E_BASE_URL
  && process.env.CLERK_PUBLISHABLE_KEY
  && process.env.CLERK_SECRET_KEY
  && process.env.E2E_CLERK_USER_EMAIL,
);

setup.describe.configure({ mode: 'serial' });

setup('configure Clerk testing token', async () => {
  setup.skip(!canRunAuthenticatedTests, 'Set the documented E2E/Clerk variables to test the deployed full-stack flow.');
  await clerkSetup();
});
