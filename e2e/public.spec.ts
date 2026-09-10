import { expect, test } from '@playwright/test';

test('public navigation, recipe filtering, and unknown routes work', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: /eat with clarity/i })).toBeVisible();

  await page.getByRole('navigation', { name: 'Learn about FitMeal' }).getByRole('link', { name: 'What you can do' }).click();
  await expect(page).toHaveURL(/#features$/);

  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Reviews' }).click();
  await expect(page.getByRole('heading', { name: 'Your experience helps FitMeal grow.' })).toBeVisible();
  const contactSection = page.getByRole('region', { name: 'Email the FitMeal team.' });
  await expect(contactSection.getByText('FitMeal support team')).toBeVisible();
  await contactSection.getByLabel('Your name').fill('Alex');
  await contactSection.getByLabel('Reply email').fill('alex@example.com');
  await contactSection.getByLabel('Your message').fill('I would like help with my meal plan.');
  await expect(contactSection.getByRole('button', { name: 'Send message' })).toBeEnabled();

  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Recipes' }).click();
  await page.getByLabel('Search recipes').fill('lentils');
  await expect(page.getByRole('heading', { name: '1 recipe found' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lentil vegetable soup' })).toBeVisible();

  await page.goto('./this-route-does-not-exist');
  await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible();
});

test('mobile navigation closes with Escape and restores trigger focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');

  const menuButton = page.getByRole('button', { name: 'Open navigation' });
  await menuButton.click();
  await expect(page.getByRole('button', { name: 'Close navigation' })).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeHidden();
});

test('how-it-works demo opens, changes scenes, and closes with Escape', async ({ page }) => {
  await page.goto('./');

  const demoButton = page.getByRole('button', { name: 'See how it works' });
  await demoButton.click();

  const dialog = page.getByRole('dialog', { name: 'A plan that moves with you.' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Show step 2: Daily menu' }).click();
  await expect(dialog.getByText('Wake up to a fresh plan.')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(demoButton).toBeFocused();
});
