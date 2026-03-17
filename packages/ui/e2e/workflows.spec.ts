import { test, expect } from '@playwright/test';
import { setupAPIMocks, mockMarketplace } from './helpers';

test.describe('Cross-Page Workflows', () => {
  test('full navigation tour: visit every page', async ({ page }) => {
    await setupAPIMocks(page);
    const sidebar = page.locator('aside');

    // Start at home
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Go to marketplace
    await sidebar.getByRole('link', { name: 'Marketplace' }).click();
    await expect(page.getByRole('heading', { name: 'Marketplace' })).toBeVisible();

    // Go to vault
    await sidebar.getByRole('link', { name: 'Vault', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Vault' })).toBeVisible();

    // Go to scheduler
    await sidebar.getByRole('link', { name: 'Scheduler', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Scheduler' })).toBeVisible();

    // Go to settings
    await sidebar.getByRole('link', { name: 'Settings', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    // Navigate through settings sub-pages
    const settingsNav = page.locator('main');
    await settingsNav.getByRole('link', { name: 'Registries' }).click();
    await expect(page.getByRole('heading', { name: 'Registries' })).toBeVisible();

    await settingsNav.getByRole('link', { name: 'Vault' }).click();
    await expect(page.getByRole('heading', { name: 'Vault' })).toBeVisible();

    await settingsNav.getByRole('link', { name: 'General' }).click();
    await expect(page.getByText('Port')).toBeVisible();

    // Back to home
    await sidebar.getByRole('link', { name: 'Home' }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('select project then navigate — project context persists', async ({ page }) => {
    await setupAPIMocks(page);
    await page.goto('/');
    const sidebar = page.locator('aside');

    // Select a project
    await sidebar.getByLabel('Select project').click();
    await page.getByRole('option', { name: 'test-project' }).click();
    await expect(page.getByText('Project: /tmp/test-project')).toBeVisible();

    // Navigate to marketplace and back — project should persist
    await sidebar.getByRole('link', { name: 'Marketplace' }).click();
    await expect(page.getByRole('heading', { name: 'Marketplace' })).toBeVisible();

    await sidebar.getByRole('link', { name: 'Home' }).click();
    await expect(page.getByText('Project: /tmp/test-project')).toBeVisible();
  });

  test('install extension from marketplace', async ({ page }) => {
    let installBody: Record<string, unknown> = {};
    await setupAPIMocks(page);
    await page.route('**/api/extensions/install', (route) => {
      installBody = route.request().postDataJSON() as Record<string, unknown>;
      return route.fulfill({ json: { ok: true } });
    });

    await page.goto('/marketplace');
    await page.getByRole('tab', { name: /available/i }).click();
    await expect(page.getByText('new-ext')).toBeVisible();

    await page.getByRole('button', { name: 'Install' }).click();
    await page.waitForTimeout(500);
    expect(installBody).toHaveProperty('name', 'new-ext');
  });

  test('activate installed extension from marketplace', async ({ page }) => {
    let activateBody = '';
    await setupAPIMocks(page);
    await page.route('**/api/extensions/activate', (route) => {
      activateBody = JSON.stringify(route.request().postDataJSON());
      return route.fulfill({ json: { ok: true } });
    });

    await page.goto('/marketplace');
    await page.getByRole('tab', { name: /installed/i }).click();
    await expect(page.getByText('echo-mcp')).toBeVisible();

    await page.getByRole('button', { name: 'Activate' }).click();
    await page.waitForTimeout(500);
    expect(activateBody).toContain('echo-mcp');
  });

  test('remove installed extension from marketplace', async ({ page }) => {
    let removeCalled = false;
    await setupAPIMocks(page);
    await page.route('**/api/extensions/*', (route) => {
      if (route.request().method() === 'DELETE') {
        removeCalled = true;
      }
      return route.fulfill({ json: { ok: true } });
    });

    await page.goto('/marketplace');
    await page.getByRole('tab', { name: /installed/i }).click();
    await page.getByRole('button', { name: 'Remove' }).click();
    await page.waitForTimeout(500);
    expect(removeCalled).toBe(true);
  });

  test('deactivate active extension from marketplace', async ({ page }) => {
    let deactivateCalled = false;
    await setupAPIMocks(page);
    await page.route('**/api/extensions/deactivate', (route) => {
      deactivateCalled = true;
      return route.fulfill({ json: { ok: true } });
    });

    await page.goto('/marketplace');
    await page.getByRole('tab', { name: /active/i }).click();
    await page.getByRole('button', { name: 'Deactivate' }).click();
    await page.waitForTimeout(500);
    expect(deactivateCalled).toBe(true);
  });

  test('create vault entry — verifies form submission data', async ({ page }) => {
    let postBody: Record<string, unknown> = {};
    await setupAPIMocks(page);
    await page.route('**/api/vault', (route) => {
      if (route.request().method() === 'POST') {
        postBody = route.request().postDataJSON() as Record<string, unknown>;
        return route.fulfill({ json: { ok: true } });
      }
      return route.fulfill({ json: [] });
    });

    await page.goto('/vault');
    await page.getByRole('button', { name: 'Add Entry' }).click();
    await page.getByLabel('Key').fill('MY_SECRET');
    await page.getByLabel('Value').fill('super-secret-123');
    await page.getByLabel(/tags/i).fill('test, ci');
    await page.getByRole('button', { name: 'Save' }).click();

    await page.waitForTimeout(500);
    expect(postBody).toHaveProperty('key', 'MY_SECRET');
    expect(postBody).toHaveProperty('value', 'super-secret-123');
    expect(postBody).toHaveProperty('tags');
  });

  test('create scheduled task — verifies form submission data', async ({ page }) => {
    let postBody: Record<string, unknown> = {};
    await setupAPIMocks(page);
    await page.route('**/api/scheduler', (route) => {
      if (route.request().method() === 'POST') {
        postBody = route.request().postDataJSON() as Record<string, unknown>;
        return route.fulfill({ json: { ok: true } });
      }
      return route.fulfill({ json: [] });
    });

    await page.goto('/scheduler');
    await page.getByRole('button', { name: 'Create Task' }).click();
    await page.getByLabel('Name').fill('Nightly Build');
    await page.getByLabel('Extension').fill('build-ext');
    await page.getByLabel('Command').fill('build');
    await page.getByLabel('Cron Expression').fill('0 2 * * *');
    await page.getByRole('button', { name: 'Create' }).click();

    await page.waitForTimeout(500);
    expect(postBody).toHaveProperty('name', 'Nightly Build');
    expect(postBody).toHaveProperty('extension_name', 'build-ext');
    expect(postBody).toHaveProperty('command', 'build');
    expect(postBody).toHaveProperty('cron', '0 2 * * *');
  });

  test('delete scheduled task triggers correct API', async ({ page }) => {
    let deleteUrl = '';
    await setupAPIMocks(page);
    await page.route(/\/api\/scheduler\/\d+$/, (route) => {
      if (route.request().method() === 'DELETE') {
        deleteUrl = route.request().url();
      }
      return route.fulfill({ json: { ok: true } });
    });

    await page.goto('/scheduler');
    await page.getByRole('button', { name: 'Delete' }).first().click();
    await page.waitForTimeout(500);
    expect(deleteUrl).toContain('/api/scheduler/');
  });

  test('add registry — verifies form submission data', async ({ page }) => {
    let postBody: Record<string, unknown> = {};
    await setupAPIMocks(page);
    await page.route('**/api/registries', (route) => {
      if (route.request().method() === 'POST') {
        postBody = route.request().postDataJSON() as Record<string, unknown>;
        return route.fulfill({ json: { ok: true } });
      }
      return route.fulfill({ json: [] });
    });

    await page.goto('/settings/registries');
    await page.getByRole('button', { name: 'Add Registry' }).click();
    await page.getByLabel('Name').fill('my-registry');
    await page.getByLabel('URL').fill('https://my-registry.example.com');
    await page.getByLabel('Priority').fill('5');
    await page.getByRole('button', { name: 'Add' }).click();

    await page.waitForTimeout(500);
    expect(postBody).toHaveProperty('name', 'my-registry');
    expect(postBody).toHaveProperty('url', 'https://my-registry.example.com');
    expect(postBody).toHaveProperty('priority', 5);
  });

  test('update settings — verifies form submission data', async ({ page }) => {
    let putBody: Record<string, unknown> = {};
    await setupAPIMocks(page);
    await page.route('**/api/settings', (route) => {
      if (route.request().method() === 'PUT') {
        putBody = route.request().postDataJSON() as Record<string, unknown>;
        return route.fulfill({ json: { ok: true } });
      }
      return route.fulfill({
        json: { port: 4200, theme: 'light', logLevel: 'info' },
      });
    });

    await page.goto('/settings');
    const portInput = page.getByLabel('Port');
    await portInput.clear();
    await portInput.fill('8080');
    await page.getByRole('button', { name: 'Save Settings' }).click();

    await page.waitForTimeout(500);
    expect(putBody).toHaveProperty('port', 8080);
  });

  test('quick action from home → vault → add entry → back to home', async ({ page }) => {
    await setupAPIMocks(page);
    await page.goto('/');

    // Click vault quick action
    await page.locator('a[href="/vault"]').first().click();
    await expect(page.getByRole('heading', { name: 'Vault' })).toBeVisible();

    // Open add entry dialog
    await page.getByRole('button', { name: 'Add Entry' }).click();
    await expect(page.getByText('Add Vault Entry')).toBeVisible();

    // Close dialog by pressing Escape
    await page.keyboard.press('Escape');

    // Navigate back home
    const sidebar = page.locator('aside');
    await sidebar.getByRole('link', { name: 'Home' }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('quick action from home → scheduler → create task → back', async ({ page }) => {
    await setupAPIMocks(page);
    await page.goto('/');

    // Click scheduler quick action
    await page.locator('a[href="/scheduler"]').first().click();
    await expect(page.getByRole('heading', { name: 'Scheduler' })).toBeVisible();

    // Open create task dialog
    await page.getByRole('button', { name: 'Create Task' }).click();
    await expect(page.getByText('Create Scheduled Task')).toBeVisible();

    // Close dialog
    await page.keyboard.press('Escape');

    // Back to home
    const sidebar = page.locator('aside');
    await sidebar.getByRole('link', { name: 'Home' }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
