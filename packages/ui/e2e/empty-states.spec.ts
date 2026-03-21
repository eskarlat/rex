import { test, expect } from '@playwright/test';

/**
 * Setup mocks that return empty data for all endpoints.
 */
async function setupEmptyMocks(page: import('@playwright/test').Page): Promise<void> {
  await page.route('**/api/projects', (route) => route.fulfill({ json: [] }));
  await page.route('**/api/project', (route) => route.fulfill({ json: null }));
  await page.route('**/api/projects/active', (route) => route.fulfill({ json: { ok: true } }));
  await page.route('**/api/marketplace', (route) =>
    route.fulfill({
      json: { active: [], installed: [], available: [] },
    }),
  );
  await page.route('**/api/vault', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: [] });
    }
    return route.fulfill({ json: { ok: true } });
  });
  await page.route('**/api/scheduler', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: [] });
    }
    return route.fulfill({ json: { ok: true } });
  });
  await page.route('**/api/settings', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        json: { port: 4200, theme: 'light', logLevel: 'info' },
      });
    }
    return route.fulfill({ json: { ok: true } });
  });
  await page.route('**/api/registries', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: [] });
    }
    return route.fulfill({ json: { ok: true } });
  });
  await page.route('**/api/settings/extensions/*', (route) => route.fulfill({ json: null }));
  await page.route('**/api/vault/*', (route) => route.fulfill({ json: { ok: true } }));
  await page.route('**/api/scheduler/*', (route) => route.fulfill({ json: { ok: true } }));
  await page.route('**/api/registries/*', (route) => route.fulfill({ json: { ok: true } }));
}

test.describe('Empty States', () => {
  test.beforeEach(async ({ page }) => {
    await setupEmptyMocks(page);
  });

  test('home page shows zero active extensions', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Active Extensions')).toBeVisible();
    await expect(page.getByText('0')).toBeVisible();
  });

  test('home page shows no project selected', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('No project selected')).toBeVisible();
  });

  test('marketplace active tab shows empty message', async ({ page }) => {
    await page.goto('/marketplace');
    await page.getByRole('tab', { name: /active/i }).click();
    await expect(page.getByText('No active extensions in this project.')).toBeVisible();
  });

  test('marketplace installed tab shows empty message', async ({ page }) => {
    await page.goto('/marketplace');
    await page.getByRole('tab', { name: /installed/i }).click();
    await expect(page.getByText('No installed extensions.')).toBeVisible();
  });

  test('marketplace available tab shows empty message', async ({ page }) => {
    await page.goto('/marketplace');
    await page.getByRole('tab', { name: /available/i }).click();
    await expect(page.getByText('No available extensions in registries.')).toBeVisible();
  });

  test('marketplace tabs show zero counts', async ({ page }) => {
    await page.goto('/marketplace');
    await expect(page.getByRole('tab', { name: /active \(0\)/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /installed \(0\)/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /available \(0\)/i })).toBeVisible();
  });

  test('vault shows empty message', async ({ page }) => {
    await page.goto('/vault');
    await expect(page.getByText('No vault entries found.')).toBeVisible();
  });

  test('vault still shows Add Entry button when empty', async ({ page }) => {
    await page.goto('/vault');
    await expect(page.getByRole('button', { name: 'Add Entry' })).toBeVisible();
  });

  test('scheduler shows empty message', async ({ page }) => {
    await page.goto('/scheduler');
    await expect(page.getByText('No scheduled tasks.')).toBeVisible();
  });

  test('scheduler still shows Create Task button when empty', async ({ page }) => {
    await page.goto('/scheduler');
    await expect(page.getByRole('button', { name: 'Create Task' })).toBeVisible();
  });

  test('registries shows empty message', async ({ page }) => {
    await page.goto('/settings/registries');
    await expect(page.getByText('No registries configured.')).toBeVisible();
  });

  test('registries still shows Add Registry button when empty', async ({ page }) => {
    await page.goto('/settings/registries');
    await expect(page.getByRole('button', { name: 'Add Registry' })).toBeVisible();
  });

  test('extension settings shows no config message', async ({ page }) => {
    await page.goto('/settings/extensions/unknown-ext');
    await expect(page.getByText('No configuration available for this extension.')).toBeVisible();
  });

  test('scheduler history modal shows empty message', async ({ page }) => {
    // Need a task to click History on, but with empty history
    await page.route('**/api/scheduler', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          json: [
            {
              id: 1,
              name: 'Test Task',
              extension_name: 'test-ext',
              command: 'run',
              cron: '* * * * *',
              enabled: true,
              last_run: null,
              next_run: null,
            },
          ],
        });
      }
      return route.fulfill({ json: { ok: true } });
    });
    await page.route('**/api/scheduler/*/history', (route) => route.fulfill({ json: [] }));
    await page.goto('/scheduler');
    await page.getByRole('button', { name: 'History' }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText('No execution history.')).toBeVisible();
  });
});
