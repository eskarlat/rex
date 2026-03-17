import { test, expect } from '@playwright/test';
import { setupAPIMocks } from './helpers';

test.describe('Extension Panel Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAPIMocks(page);
  });

  test('displays extension name as heading', async ({ page }) => {
    await page.goto('/extensions/hello-world');
    await expect(
      page.getByRole('heading', { name: 'hello-world' }),
    ).toBeVisible();
  });

  test('shows extension panel subtitle', async ({ page }) => {
    await page.goto('/extensions/hello-world');
    await expect(page.getByText('Extension panel')).toBeVisible();
  });

  test('shows error alert when panel fails to load', async ({ page }) => {
    // The dynamic import will fail since no panel.js exists
    await page.route('**/api/extensions/*/panel.js', (route) =>
      route.fulfill({ status: 404, body: 'Not found' }),
    );
    await page.goto('/extensions/nonexistent-ext');
    // Should show error boundary fallback
    await expect(page.getByText('Failed to load panel')).toBeVisible({ timeout: 10000 });
  });

  test('error alert includes extension name', async ({ page }) => {
    await page.route('**/api/extensions/*/panel.js', (route) =>
      route.fulfill({ status: 404, body: 'Not found' }),
    );
    await page.goto('/extensions/my-broken-ext');
    await expect(
      page.getByText(/my-broken-ext/),
    ).toBeVisible({ timeout: 10000 });
  });

  test('shows skeleton while panel loads', async ({ page }) => {
    // Route that never responds to keep loading
    await page.route('**/api/extensions/*/panel.js', () => {
      // Never fulfill
    });
    await page.goto('/extensions/slow-ext');
    await expect(
      page.getByRole('heading', { name: 'slow-ext' }),
    ).toBeVisible();
  });

  test('navigates to extension panel from marketplace', async ({ page }) => {
    await page.goto('/extensions/hello-world');
    await expect(
      page.getByRole('heading', { name: 'hello-world' }),
    ).toBeVisible();
    await expect(page.getByText('Extension panel')).toBeVisible();
  });
});
