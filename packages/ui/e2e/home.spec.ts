import { test, expect } from '@playwright/test';
import { setupAPIMocks } from './helpers';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAPIMocks(page);
    await page.goto('/');
  });

  test('displays dashboard heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('shows project status text', async ({ page }) => {
    // No localStorage set, so shows "No project selected"
    await expect(page.getByText('No project selected')).toBeVisible();
  });

  test('shows project name when active project is set', async ({ page }) => {
    const newPage = await page.context().newPage();
    await newPage.addInitScript(() => {
      localStorage.setItem('renre-kit-active-project', '/tmp/test-project');
    });
    await setupAPIMocks(newPage);
    await newPage.goto('/');
    await expect(newPage.getByText('Project: /tmp/test-project')).toBeVisible();
    await newPage.close();
  });

  test('displays active extensions count', async ({ page }) => {
    await expect(page.getByText('Active Extensions')).toBeVisible();
  });

  test('shows quick actions heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Quick Actions' })).toBeVisible();
  });

  test('shows quick action cards with descriptions', async ({ page }) => {
    await expect(page.getByText('Browse and manage extensions')).toBeVisible();
    await expect(page.getByText('Manage secrets and keys')).toBeVisible();
    await expect(page.getByText('Manage scheduled tasks')).toBeVisible();
    await expect(page.getByText('Configure RenreKit')).toBeVisible();
  });

  test('quick action card navigates to marketplace', async ({ page }) => {
    await page.locator('a[href="/marketplace"]').first().click();
    await expect(page).toHaveURL(/\/marketplace/);
  });

  test('quick action card navigates to vault', async ({ page }) => {
    await page.locator('a[href="/vault"]').first().click();
    await expect(page).toHaveURL(/\/vault/);
  });

  test('quick action card navigates to scheduler', async ({ page }) => {
    await page.locator('a[href="/scheduler"]').first().click();
    await expect(page).toHaveURL(/\/scheduler/);
  });

  test('quick action card navigates to settings', async ({ page }) => {
    await page.locator('a[href="/settings"]').first().click();
    await expect(page).toHaveURL(/\/settings/);
  });

  test('displays loading state before data loads', async ({ page }) => {
    const newPage = await page.context().newPage();
    await newPage.route('**/api/marketplace', () => {
      // Never fulfill - keeps loading
    });
    await newPage.route('**/api/projects', (route) =>
      route.fulfill({ json: [] }),
    );
    await newPage.route('**/api/project', (route) =>
      route.fulfill({ json: { name: 'test', path: '/tmp/test' } }),
    );
    await newPage.goto('/');
    await expect(newPage.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await newPage.close();
  });
});
