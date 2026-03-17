import { test, expect } from '@playwright/test';
import { setupAPIMocks } from './helpers';

test.describe('Vault Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAPIMocks(page);
    await page.goto('/vault');
  });

  test('displays vault heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Vault' })).toBeVisible();
  });

  test('shows vault entries table', async ({ page }) => {
    await expect(page.getByText('API_KEY')).toBeVisible();
    await expect(page.getByText('DB_PASSWORD')).toBeVisible();
  });

  test('values are masked in the table', async ({ page }) => {
    await expect(page.getByText('******')).toHaveCount(2);
  });

  test('shows tags for entries', async ({ page }) => {
    await expect(page.getByText('api, secret')).toBeVisible();
    await expect(page.getByText('database')).toBeVisible();
  });

  test('shows Add Entry button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'Add Entry' }),
    ).toBeVisible();
  });

  test('opens Add Entry dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Entry' }).click();
    await expect(page.getByText('Add Vault Entry')).toBeVisible();
    await expect(page.getByText('Store a new encrypted secret in the vault.')).toBeVisible();
    await expect(page.getByLabel('Key')).toBeVisible();
    await expect(page.getByLabel('Value')).toBeVisible();
  });

  test('Add Entry dialog has tags field', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Entry' }).click();
    await expect(page.getByLabel(/tags/i)).toBeVisible();
  });

  test('can fill and submit Add Entry form', async ({ page }) => {
    let createCalled = false;
    await page.route('**/api/vault', (route) => {
      if (route.request().method() === 'POST') {
        createCalled = true;
        return route.fulfill({ json: { ok: true } });
      }
      return route.fulfill({ json: [] });
    });

    await page.getByRole('button', { name: 'Add Entry' }).click();
    await page.getByLabel('Key').fill('NEW_SECRET');
    await page.getByLabel('Value').fill('my-secret-value');

    const tagsField = page.getByLabel(/tags/i);
    if (await tagsField.isVisible()) {
      await tagsField.fill('test,new');
    }

    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);
    expect(createCalled).toBe(true);
  });

  test('shows delete button for each entry', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(2);
  });

  test('clicking delete triggers API call', async ({ page }) => {
    let deleteCalled = false;
    await page.route('**/api/vault/*', (route) => {
      if (route.request().method() === 'DELETE') {
        deleteCalled = true;
      }
      return route.fulfill({ json: { ok: true } });
    });

    await page.getByRole('button', { name: 'Delete' }).first().click();
    await page.waitForTimeout(500);
    expect(deleteCalled).toBe(true);
  });

  test('vault settings page reuses vault component', async ({ page }) => {
    await page.goto('/settings/vault');
    // Should show the same vault table
    await expect(page.getByText('API_KEY')).toBeVisible();
    await expect(page.getByText('DB_PASSWORD')).toBeVisible();
  });
});
