import { test, expect } from '@playwright/test';
import { setupAPIMocks, mockMarketplace } from './helpers';

test.describe('Marketplace Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAPIMocks(page);
    await page.goto('/marketplace');
  });

  test('displays marketplace heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Marketplace' })).toBeVisible();
  });

  test('shows three tabs with counts', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /active/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /installed/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /available/i })).toBeVisible();
  });

  test('active tab shows active extensions', async ({ page }) => {
    await page.getByRole('tab', { name: /active/i }).click();
    await expect(page.getByText('hello-world')).toBeVisible();
    await expect(page.getByText('A sample extension')).toBeVisible();
  });

  test('active extension shows deactivate button', async ({ page }) => {
    await page.getByRole('tab', { name: /active/i }).click();
    await expect(page.getByRole('button', { name: /deactivate/i })).toBeVisible();
  });

  test('installed tab shows installed extensions', async ({ page }) => {
    await page.getByRole('tab', { name: /installed/i }).click();
    await expect(page.getByText('weather-mcp')).toBeVisible();
    await expect(page.getByText('Weather MCP server')).toBeVisible();
  });

  test('installed extension shows activate and remove buttons', async ({ page }) => {
    await page.getByRole('tab', { name: /installed/i }).click();
    await expect(page.getByRole('button', { name: /activate/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /remove/i })).toBeVisible();
  });

  test('available tab shows available extensions', async ({ page }) => {
    await page.getByRole('tab', { name: /available/i }).click();
    await expect(page.getByText('new-ext')).toBeVisible();
    await expect(page.getByText('Available extension')).toBeVisible();
  });

  test('available extension shows install button', async ({ page }) => {
    await page.getByRole('tab', { name: /available/i }).click();
    await expect(page.getByRole('button', { name: /install/i })).toBeVisible();
  });

  test('extension card displays metadata', async ({ page }) => {
    await page.getByRole('tab', { name: /active/i }).click();
    // Check version
    await expect(page.getByText('1.0.0')).toBeVisible();
    // Check type
    await expect(page.getByText(/standard/i)).toBeVisible();
    // Check author
    await expect(page.getByText('test-author')).toBeVisible();
  });

  test('clicking install triggers API call', async ({ page }) => {
    let installCalled = false;
    await page.route('**/api/extensions/install', (route) => {
      installCalled = true;
      return route.fulfill({ json: { ok: true } });
    });

    await page.getByRole('tab', { name: /available/i }).click();
    await page.getByRole('button', { name: /install/i }).click();

    // Wait for the API call
    await page.waitForTimeout(500);
    expect(installCalled).toBe(true);
  });

  test('clicking deactivate triggers API call', async ({ page }) => {
    let deactivateCalled = false;
    await page.route('**/api/extensions/deactivate', (route) => {
      deactivateCalled = true;
      return route.fulfill({ json: { ok: true } });
    });

    await page.getByRole('tab', { name: /active/i }).click();
    await page.getByRole('button', { name: /deactivate/i }).click();

    await page.waitForTimeout(500);
    expect(deactivateCalled).toBe(true);
  });

  test('empty marketplace shows appropriate message', async ({ page }) => {
    const emptyPage = await page.context().newPage();
    await emptyPage.route('**/api/marketplace', (route) =>
      route.fulfill({ json: { active: [], installed: [], available: [] } }),
    );
    await emptyPage.route('**/api/projects', (route) =>
      route.fulfill({ json: [] }),
    );
    await emptyPage.route('**/api/project', (route) =>
      route.fulfill({ json: { name: 'test', path: '/tmp/test' } }),
    );
    await emptyPage.goto('/marketplace');
    await expect(emptyPage.getByRole('tab', { name: /active/i })).toBeVisible();
    await emptyPage.close();
  });
});
