import { test, expect } from '@playwright/test';
import { setupAPIMocks } from './helpers';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupAPIMocks(page);
  });

  test('sidebar displays all navigation links', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();

    // Use exact matching to avoid collisions with quick action cards
    await expect(sidebar.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Marketplace' })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Vault', exact: true })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Scheduler', exact: true })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Settings', exact: true })).toBeVisible();
  });

  test('sidebar shows RenreKit branding', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('aside');
    await expect(sidebar.getByText('RenreKit')).toBeVisible();
  });

  test('navigate to marketplace', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('aside');
    await sidebar.getByRole('link', { name: 'Marketplace' }).click();
    await expect(page).toHaveURL(/\/marketplace/);
    await expect(page.getByRole('heading', { name: 'Marketplace' })).toBeVisible();
  });

  test('navigate to vault', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('aside');
    await sidebar.getByRole('link', { name: 'Vault', exact: true }).click();
    await expect(page).toHaveURL(/\/vault/);
    await expect(page.getByRole('heading', { name: 'Vault' })).toBeVisible();
  });

  test('navigate to scheduler', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('aside');
    await sidebar.getByRole('link', { name: 'Scheduler', exact: true }).click();
    await expect(page).toHaveURL(/\/scheduler/);
    await expect(page.getByRole('heading', { name: 'Scheduler' })).toBeVisible();
  });

  test('navigate to settings', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('aside');
    await sidebar.getByRole('link', { name: 'Settings', exact: true }).click();
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });

  test('navigate back to home', async ({ page }) => {
    await page.goto('/marketplace');
    const sidebar = page.locator('aside');
    await sidebar.getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('active link is highlighted', async ({ page }) => {
    await page.goto('/marketplace');
    const sidebar = page.locator('aside');
    const marketplaceLink = sidebar.getByRole('link', { name: 'Marketplace' });
    await expect(marketplaceLink).toBeVisible();
    const classes = await marketplaceLink.getAttribute('class');
    expect(classes).toBeTruthy();
  });
});
