import { test, expect } from '@playwright/test';
import { setupAPIMocks } from './helpers';

test.describe('Scheduler Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAPIMocks(page);
    await page.goto('/scheduler');
  });

  test('displays scheduler heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Scheduler' })).toBeVisible();
  });

  test('shows scheduled tasks table', async ({ page }) => {
    await expect(page.getByText('Daily Sync')).toBeVisible();
    await expect(page.getByText('Hourly Check')).toBeVisible();
  });

  test('shows task extension names', async ({ page }) => {
    await expect(page.getByText('hello-world')).toBeVisible();
    await expect(page.getByText('weather-mcp')).toBeVisible();
  });

  test('shows cron expressions', async ({ page }) => {
    await expect(page.getByText('0 0 * * *')).toBeVisible();
    await expect(page.getByText('0 * * * *')).toBeVisible();
  });

  test('shows enabled/disabled status', async ({ page }) => {
    // Task 1 is enabled, task 2 is disabled
    await expect(page.getByText('Enabled')).toBeVisible();
    await expect(page.getByText('Disabled')).toBeVisible();
  });

  test('shows Create Task button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'Create Task' }),
    ).toBeVisible();
  });

  test('opens Create Task dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Task' }).click();
    await expect(page.getByText('Create Scheduled Task')).toBeVisible();
    await expect(page.getByText('Schedule a recurring extension command.')).toBeVisible();
  });

  test('Create Task dialog has all required fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Task' }).click();

    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Extension')).toBeVisible();
    await expect(page.getByLabel('Command')).toBeVisible();
    await expect(page.getByLabel('Cron Expression')).toBeVisible();
  });

  test('can fill and submit Create Task form', async ({ page }) => {
    let createCalled = false;
    await page.route('**/api/scheduler', (route) => {
      if (route.request().method() === 'POST') {
        createCalled = true;
        return route.fulfill({ json: { ok: true } });
      }
      return route.fulfill({ json: [] });
    });

    await page.getByRole('button', { name: 'Create Task' }).click();
    await page.getByLabel('Name').fill('New Task');
    await page.getByLabel('Extension').fill('my-ext');
    await page.getByLabel('Command').fill('run');
    await page.getByLabel('Cron Expression').fill('*/5 * * * *');

    await page.getByRole('button', { name: 'Create' }).click();
    await page.waitForTimeout(500);
    expect(createCalled).toBe(true);
  });

  test('shows Run Now button for tasks', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Run Now' })).toHaveCount(2);
  });

  test('clicking Run Now triggers API call', async ({ page }) => {
    let triggerCalled = false;
    await page.route('**/api/scheduler/*/trigger', (route) => {
      triggerCalled = true;
      return route.fulfill({ json: { ok: true } });
    });

    await page.getByRole('button', { name: 'Run Now' }).first().click();
    await page.waitForTimeout(500);
    expect(triggerCalled).toBe(true);
  });

  test('shows History button for tasks', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'History' })).toHaveCount(2);
  });

  test('clicking History opens modal with execution history', async ({ page }) => {
    await page.getByRole('button', { name: 'History' }).first().click();
    await page.waitForTimeout(500);
    // History modal should show status
    await expect(page.getByText('success').first()).toBeVisible();
  });

  test('shows Delete button for tasks', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(2);
  });

  test('toggling task switch triggers update', async ({ page }) => {
    let updateCalled = false;
    await page.route('**/api/scheduler/*', (route) => {
      if (route.request().method() === 'PUT') {
        updateCalled = true;
      }
      return route.fulfill({ json: { ok: true } });
    });

    const toggle = page.getByRole('switch').first();
    await toggle.click();
    await page.waitForTimeout(500);
    expect(updateCalled).toBe(true);
  });
});
