import { clerk } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

const canRunAuthenticatedTests = Boolean(
  process.env.E2E_BASE_URL
  && process.env.CLERK_PUBLISHABLE_KEY
  && process.env.CLERK_SECRET_KEY
  && process.env.E2E_CLERK_USER_EMAIL,
);

test.describe('authenticated meal-planning journey', () => {
  test.skip(!canRunAuthenticatedTests, 'Set the documented E2E/Clerk variables to test the deployed full-stack flow.');

  test('signs in, creates a profile, generates a plan, logs a meal, records progress, and deletes its data', async ({ page }) => {
    await page.goto('./');
    await clerk.signIn({ page, emailAddress: process.env.E2E_CLERK_USER_EMAIL! });
    await page.reload();
    await expect(page.getByRole('link', { name: 'Open account' })).toBeVisible();

    await page.goto('./planner');
    const profileName = page.getByLabel('Name');
    const menuHeading = page.getByRole('heading', { name: "Today's menu" });
    await expect(profileName.or(menuHeading).first()).toBeVisible();
    if (await profileName.isVisible()) {
      await profileName.fill('FitMeal E2E');
      await page.getByLabel('Age').fill('30');
      await page.getByLabel('Height (cm)').fill('170');
      await page.getByLabel('Weight (kg)').fill('70');
      await page.getByRole('button', { name: 'Save profile' }).click();
    }

    await expect(menuHeading).toBeVisible();
    await page.getByRole('button', { name: 'Refresh plan' }).click();
    await page.getByRole('button', { name: 'Same as suggested' }).first().click();
    await expect(page.getByText('✓ As planned').first()).toBeVisible();

    await page.goto('./progress');
    await page.getByLabel('Weight').fill('70');
    await page.getByLabel(/^Context/).fill('Automated full-stack check');
    await page.getByRole('button', { name: 'Save check-in' }).click();
    await expect(page.getByText('Automated full-stack check').first()).toBeVisible();
    await page.getByRole('button', { name: 'Get my review' }).click();
    await expect(page.getByText(/meals logged/i).first()).toBeVisible();

    await page.goto('./account');
    await page.getByRole('button', { name: 'Delete my FitMeal data' }).click();
    await page.getByRole('button', { name: 'Permanently delete data' }).click();
    await expect(page.getByRole('status')).toContainText('profile, meal plans, and check-ins were deleted');
  });
});
