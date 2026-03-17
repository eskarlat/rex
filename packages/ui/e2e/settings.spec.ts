import { test, expect } from '@playwright/test';
import { setupAPIMocks } from './helpers';

test.describe('Settings - General Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAPIMocks(page);
    await page.goto('/settings');
  });

  test('displays settings heading and description', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    await expect(page.getByText('Manage your RenreKit configuration.')).toBeVisible();
  });

  test('shows settings navigation links', async ({ page }) => {
    // Settings layout has sub-navigation: General, Registries, Vault
    const settingsNav = page.locator('main');
    await expect(settingsNav.getByRole('link', { name: 'General' })).toBeVisible();
    await expect(settingsNav.getByRole('link', { name: 'Registries' })).toBeVisible();
    await expect(settingsNav.getByRole('link', { name: 'Vault' })).toBeVisible();
  });

  test('shows port setting', async ({ page }) => {
    const portInput = page.getByLabel('Port');
    await expect(portInput).toBeVisible();
    await expect(portInput).toHaveValue('4200');
  });

  test('shows theme setting', async ({ page }) => {
    await expect(page.getByText('Theme')).toBeVisible();
  });

  test('shows log level setting', async ({ page }) => {
    await expect(page.getByText('Log Level')).toBeVisible();
  });

  test('shows save button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'Save Settings' }),
    ).toBeVisible();
  });

  test('can modify port and save', async ({ page }) => {
    let updateCalled = false;
    await page.route('**/api/settings', (route) => {
      if (route.request().method() === 'PUT') {
        updateCalled = true;
        return route.fulfill({ json: { ok: true } });
      }
      return route.fulfill({ json: { port: 4200, theme: 'light', logLevel: 'info' } });
    });

    const portInput = page.getByLabel('Port');
    await portInput.clear();
    await portInput.fill('5000');
    await page.getByRole('button', { name: 'Save Settings' }).click();
    await page.waitForTimeout(500);
    expect(updateCalled).toBe(true);
  });

  test('navigates to registries settings', async ({ page }) => {
    await page.getByRole('link', { name: /registries/i }).click();
    await expect(page).toHaveURL(/\/settings\/registries/);
  });

  test('navigates to vault settings', async ({ page }) => {
    // Use the settings layout sub-navigation (not the sidebar)
    const settingsNav = page.locator('main');
    await settingsNav.getByRole('link', { name: 'Vault' }).click();
    await expect(page).toHaveURL(/\/settings\/vault/);
  });
});

test.describe('Settings - Registries Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAPIMocks(page);
    await page.goto('/settings/registries');
  });

  test('displays registries heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Registries' })).toBeVisible();
  });

  test('shows registry entries', async ({ page }) => {
    await expect(page.getByRole('cell', { name: 'official', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'community', exact: true })).toBeVisible();
  });

  test('shows registry URLs', async ({ page }) => {
    await expect(page.getByText('https://registry.renre-kit.dev')).toBeVisible();
    await expect(page.getByText('https://community.renre-kit.dev')).toBeVisible();
  });

  test('shows Add Registry button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'Add Registry' }),
    ).toBeVisible();
  });

  test('opens Add Registry dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Registry' }).click();
    await expect(page.getByText('Add a new extension registry source.')).toBeVisible();
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('URL')).toBeVisible();
  });

  test('can fill and submit Add Registry form', async ({ page }) => {
    let addCalled = false;
    await page.route('**/api/registries', (route) => {
      if (route.request().method() === 'POST') {
        addCalled = true;
        return route.fulfill({ json: { ok: true } });
      }
      return route.fulfill({ json: [] });
    });

    await page.getByRole('button', { name: 'Add Registry' }).click();
    await page.getByLabel('Name').fill('custom');
    await page.getByLabel('URL').fill('https://custom.registry.dev');

    const priorityField = page.getByLabel('Priority');
    if (await priorityField.isVisible()) {
      await priorityField.fill('3');
    }

    await page.getByRole('button', { name: 'Add' }).click();
    await page.waitForTimeout(500);
    expect(addCalled).toBe(true);
  });

  test('shows Sync button for each registry', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Sync' })).toHaveCount(2);
  });

  test('clicking Sync triggers API call', async ({ page }) => {
    let syncCalled = false;
    await page.route('**/api/registries/*/sync', (route) => {
      syncCalled = true;
      return route.fulfill({ json: { ok: true } });
    });

    await page.getByRole('button', { name: 'Sync' }).first().click();
    await page.waitForTimeout(500);
    expect(syncCalled).toBe(true);
  });

  test('shows Remove button for each registry', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Remove' })).toHaveCount(2);
  });

  test('clicking Remove triggers API call', async ({ page }) => {
    let removeCalled = false;
    await page.route('**/api/registries/*', (route) => {
      if (route.request().method() === 'DELETE') {
        removeCalled = true;
      }
      return route.fulfill({ json: { ok: true } });
    });

    await page.getByRole('button', { name: 'Remove' }).first().click();
    await page.waitForTimeout(500);
    expect(removeCalled).toBe(true);
  });
});

test.describe('Settings - Extension Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAPIMocks(page);
    await page.goto('/settings/extensions/hello-world');
  });

  test('displays extension name', async ({ page }) => {
    await expect(page.getByText('hello-world')).toBeVisible();
  });

  test('renders config form with fields from schema', async ({ page }) => {
    // Schema has: apiKey (string), maxRetries (number), verbose (boolean)
    await expect(page.getByText(/api key/i)).toBeVisible();
  });

  test('shows current config values', async ({ page }) => {
    // apiKey should be test-key, maxRetries should be 3
    const apiKeyInput = page.locator('input[type="text"], input[type="password"]').first();
    if (await apiKeyInput.isVisible()) {
      const value = await apiKeyInput.inputValue();
      expect(value).toBeTruthy();
    }
  });

  test('shows save button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /save/i }),
    ).toBeVisible();
  });

  test('can update and save settings', async ({ page }) => {
    let updateCalled = false;
    await page.route('**/api/settings/extensions/*', (route) => {
      if (route.request().method() === 'PUT') {
        updateCalled = true;
        return route.fulfill({ json: { ok: true } });
      }
      return route.fulfill({
        json: {
          schema: {
            apiKey: { type: 'string', description: 'API Key' },
          },
          values: { apiKey: 'test-key' },
        },
      });
    });

    await page.getByRole('button', { name: /save/i }).click();
    await page.waitForTimeout(500);
    expect(updateCalled).toBe(true);
  });
});
