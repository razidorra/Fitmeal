import { expect, test } from '@playwright/test';

test('public navigation, recipe filtering, and unknown routes work', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: /eat with clarity/i })).toBeVisible();

  await page.getByRole('navigation', { name: 'Learn about FitMeal' }).getByRole('link', { name: 'What you can do' }).click();
  await expect(page).toHaveURL(/#features$/);

  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Recipes' }).click();
  await page.getByLabel('Search recipes').fill('lentils');
  await expect(page.getByRole('heading', { name: '1 recipe found' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lentil vegetable soup' })).toBeVisible();

  await page.goto('./this-route-does-not-exist');
  await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible();
});
