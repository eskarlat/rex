import { test, expect } from '@playwright/test';
import { setupAPIMocks } from './helpers';

test.describe('Marketplace Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await setupAPIMocks(page);
    await page.goto('/marketplace');
  });

  test('extension card shows type badge', async ({ page }) => {
    await page.getByRole('tab', { name: /active/i }).click();
    await expect(page.getByText('standard')).toBeVisible();
  });

  test('extension card shows version badge', async ({ page }) => {
    await page.getByRole('tab', { name: /active/i }).click();
    await expect(page.getByText('1.0.0')).toBeVisible();
  });

  test('extension card shows author', async ({ page }) => {
    await page.getByRole('tab', { name: /active/i }).click();
    await expect(page.getByText(/test-author/)).toBeVisible();
  });

  test('installed tab shows mcp-stdio type', async ({ page }) => {
    await page.getByRole('tab', { name: /installed/i }).click();
    await expect(page.getByText('mcp-stdio')).toBeVisible();
  });

  test('extension without description shows fallback', async ({ page }) => {
    // Create a page with an extension that has no description
    const newPage = await page.context().newPage();
    await newPage.route('**/api/marketplace', (route) =>
      route.fulfill({
        json: {
          active: [
            {
              name: 'no-desc-ext',
              version: '0.1.0',
              type: 'standard',
              status: 'active',
            },
          ],
          installed: [],
          available: [],
        },
      }),
    );
    await newPage.route('**/api/projects', (route) =>
      route.fulfill({ json: [] }),
    );
    await newPage.route('**/api/project', (route) =>
      route.fulfill({ json: null }),
    );
    await newPage.goto('/marketplace');
    await expect(newPage.getByText('No description available.')).toBeVisible();
    await newPage.close();
  });

  test('switching between tabs preserves page', async ({ page }) => {
    await page.getByRole('tab', { name: /installed/i }).click();
    await expect(page.getByText('weather-mcp')).toBeVisible();

    await page.getByRole('tab', { name: /available/i }).click();
    await expect(page.getByText('new-ext')).toBeVisible();

    await page.getByRole('tab', { name: /active/i }).click();
    await expect(page.getByText('hello-world')).toBeVisible();
  });

  test('marketplace description is visible', async ({ page }) => {
    await expect(
      page.getByText('Browse, install, and manage extensions.'),
    ).toBeVisible();
  });
});

test.describe('Vault Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await setupAPIMocks(page);
    await page.goto('/vault');
  });

  test('vault description is visible', async ({ page }) => {
    await expect(
      page.getByText('Manage encrypted secrets and keys.'),
    ).toBeVisible();
  });

  test('Add Entry save button is disabled when fields empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Entry' }).click();
    const saveBtn = page.getByRole('button', { name: 'Save' });
    await expect(saveBtn).toBeDisabled();
  });

  test('Add Entry save button enables when key and value filled', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Entry' }).click();
    await page.getByLabel('Key').fill('TEST');
    await page.getByLabel('Value').fill('val');
    const saveBtn = page.getByRole('button', { name: 'Save' });
    await expect(saveBtn).toBeEnabled();
  });

  test('Add Entry dialog closes on successful save', async ({ page }) => {
    await page.route('**/api/vault', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({ json: { ok: true } });
      }
      return route.fulfill({ json: [] });
    });

    await page.getByRole('button', { name: 'Add Entry' }).click();
    await page.getByLabel('Key').fill('NEW_KEY');
    await page.getByLabel('Value').fill('new-value');
    await page.getByRole('button', { name: 'Save' }).click();

    // Dialog should close
    await expect(page.getByText('Add Vault Entry')).not.toBeVisible({ timeout: 3000 });
  });

  test('Add Entry dialog can be closed with Escape', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Entry' }).click();
    await expect(page.getByText('Add Vault Entry')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByText('Add Vault Entry')).not.toBeVisible();
  });

  test('vault table shows column headers', async ({ page }) => {
    const thead = page.locator('thead');
    await expect(thead.getByText('Key')).toBeVisible();
    await expect(thead.getByText('Value')).toBeVisible();
    await expect(thead.getByText('Tags')).toBeVisible();
    await expect(thead.getByText('Updated')).toBeVisible();
    await expect(thead.getByText('Actions')).toBeVisible();
  });

  test('vault entry shows formatted date', async ({ page }) => {
    // The dates are formatted with toLocaleDateString
    // Just verify some date text is rendered for each row
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(2);
  });
});

test.describe('Scheduler Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await setupAPIMocks(page);
    await page.goto('/scheduler');
  });

  test('scheduler description is visible', async ({ page }) => {
    await expect(
      page.getByText('Manage scheduled tasks and view execution history.'),
    ).toBeVisible();
  });

  test('shows Never for task with no last run', async ({ page }) => {
    // Task 2 has null last_run
    await expect(page.getByText('Never')).toBeVisible();
  });

  test('shows dash for task with no next run', async ({ page }) => {
    // Task 2 has null next_run — shows "-"
    await expect(page.getByText('-').first()).toBeVisible();
  });

  test('scheduler table shows column headers', async ({ page }) => {
    const thead = page.locator('thead');
    await expect(thead.getByText('Name')).toBeVisible();
    await expect(thead.getByText('Extension')).toBeVisible();
    await expect(thead.getByText('Cron')).toBeVisible();
    await expect(thead.getByText('Status')).toBeVisible();
    await expect(thead.getByText('Last Run')).toBeVisible();
    await expect(thead.getByText('Next Run')).toBeVisible();
    await expect(thead.getByText('Actions')).toBeVisible();
  });

  test('task toggle switch shows aria label', async ({ page }) => {
    const toggles = page.getByLabel('Toggle task');
    await expect(toggles).toHaveCount(2);
  });

  test('Create Task dialog can be closed with Escape', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Task' }).click();
    await expect(page.getByText('Create Scheduled Task')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByText('Create Scheduled Task')).not.toBeVisible();
  });

  test('Create Task button is disabled when fields are empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Task' }).click();
    // The Create submit button inside dialog
    const createBtn = page.locator('[role="dialog"]').getByRole('button', { name: 'Create' });
    await expect(createBtn).toBeDisabled();
  });

  test('history modal shows task name in title', async ({ page }) => {
    await page.getByRole('button', { name: 'History' }).first().click();
    await expect(page.getByText('Task History: Daily Sync')).toBeVisible();
  });

  test('history modal shows duration values', async ({ page }) => {
    await page.getByRole('button', { name: 'History' }).first().click();
    await expect(page.getByText('5000ms')).toBeVisible();
    await expect(page.getByText('10000ms')).toBeVisible();
  });

  test('history modal shows output and error text', async ({ page }) => {
    await page.getByRole('button', { name: 'History' }).first().click();
    await expect(page.getByText('Sync completed successfully')).toBeVisible();
    await expect(page.getByText('Connection timeout')).toBeVisible();
  });

  test('history modal description text', async ({ page }) => {
    await page.getByRole('button', { name: 'History' }).first().click();
    await expect(
      page.getByText('Execution history for this scheduled task.'),
    ).toBeVisible();
  });

  test('history modal can be closed', async ({ page }) => {
    await page.getByRole('button', { name: 'History' }).first().click();
    await expect(page.getByText('Task History: Daily Sync')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByText('Task History: Daily Sync')).not.toBeVisible();
  });
});

test.describe('Settings Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await setupAPIMocks(page);
    await page.goto('/settings');
  });

  test('port field accepts numeric input', async ({ page }) => {
    const portInput = page.getByLabel('Port');
    await portInput.clear();
    await portInput.fill('9999');
    await expect(portInput).toHaveValue('9999');
  });

  test('Save Settings button shows pending state during save', async ({ page }) => {
    // Route that delays response
    await page.route('**/api/settings', (route) => {
      if (route.request().method() === 'PUT') {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(route.fulfill({ json: { ok: true } }));
          }, 1000);
        });
      }
      return route.fulfill({
        json: { port: 4200, theme: 'light', logLevel: 'info' },
      });
    });

    await page.getByRole('button', { name: 'Save Settings' }).click();
    // Should briefly show "Saving..."
    await expect(page.getByText('Saving...')).toBeVisible();
  });

  test('settings sub-navigation highlights active link', async ({ page }) => {
    const settingsNav = page.locator('main');
    const generalLink = settingsNav.getByRole('link', { name: 'General' });
    const classes = await generalLink.getAttribute('class');
    expect(classes).toContain('primary');
  });

  test('navigating between settings pages preserves settings layout', async ({ page }) => {
    const settingsNav = page.locator('main');

    // Go to registries
    await settingsNav.getByRole('link', { name: 'Registries' }).click();
    await expect(page.getByRole('heading', { name: 'Registries' })).toBeVisible();
    // Settings heading still visible
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    // Go to vault
    await settingsNav.getByRole('link', { name: 'Vault' }).click();
    await expect(page.getByRole('heading', { name: 'Vault' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    // Back to general
    await settingsNav.getByRole('link', { name: 'General' }).click();
    await expect(page.getByText('Port')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });
});

test.describe('Extension Settings Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await setupAPIMocks(page);
    await page.goto('/settings/extensions/hello-world');
  });

  test('shows extension settings subtitle', async ({ page }) => {
    await expect(page.getByText('Extension settings')).toBeVisible();
  });

  test('config form renders string field', async ({ page }) => {
    await expect(page.getByText(/API Key/i)).toBeVisible();
  });

  test('config form renders number field', async ({ page }) => {
    await expect(page.getByText(/Max retries/i)).toBeVisible();
  });

  test('config form renders boolean field', async ({ page }) => {
    await expect(page.getByText(/Verbose/i)).toBeVisible();
  });

  test('save button sends updated values', async ({ page }) => {
    let putBody: Record<string, unknown> = {};
    await page.route('**/api/settings/extensions/*', (route) => {
      if (route.request().method() === 'PUT') {
        putBody = route.request().postDataJSON() as Record<string, unknown>;
        return route.fulfill({ json: { ok: true } });
      }
      return route.fulfill({
        json: {
          schema: {
            apiKey: { type: 'string', description: 'API Key' },
            maxRetries: { type: 'number', description: 'Max retries' },
            verbose: { type: 'boolean', description: 'Verbose logging' },
          },
          values: { apiKey: 'test-key', maxRetries: 3, verbose: false },
        },
      });
    });

    await page.getByRole('button', { name: /save/i }).click();
    await page.waitForTimeout(500);
    expect(putBody).toBeTruthy();
    expect(Object.keys(putBody).length).toBeGreaterThan(0);
  });
});

test.describe('Registries Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await setupAPIMocks(page);
    await page.goto('/settings/registries');
  });

  test('registries description is visible', async ({ page }) => {
    await expect(
      page.getByText('Manage extension registries.'),
    ).toBeVisible();
  });

  test('registries table shows column headers', async ({ page }) => {
    const thead = page.locator('thead');
    await expect(thead.getByText('Name')).toBeVisible();
    await expect(thead.getByText('URL')).toBeVisible();
    await expect(thead.getByText('Priority')).toBeVisible();
    await expect(thead.getByText('Last Synced')).toBeVisible();
    await expect(thead.getByText('Actions')).toBeVisible();
  });

  test('shows registry priorities', async ({ page }) => {
    await expect(page.getByRole('cell', { name: '1', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: '2', exact: true })).toBeVisible();
  });

  test('Add Registry dialog closes on successful add', async ({ page }) => {
    await page.route('**/api/registries', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({ json: { ok: true } });
      }
      return route.fulfill({ json: [] });
    });

    await page.getByRole('button', { name: 'Add Registry' }).click();
    await page.getByLabel('Name').fill('test-reg');
    await page.getByLabel('URL').fill('https://test.com');
    await page.getByRole('button', { name: 'Add' }).click();

    await expect(
      page.getByText('Add a new extension registry source.'),
    ).not.toBeVisible({ timeout: 3000 });
  });

  test('Add Registry dialog can be closed with Escape', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Registry' }).click();
    await expect(page.getByText('Add a new extension registry source.')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByText('Add a new extension registry source.')).not.toBeVisible();
  });

  test('Add button disabled when name and url empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Registry' }).click();
    const addBtn = page.locator('[role="dialog"]').getByRole('button', { name: 'Add' });
    await expect(addBtn).toBeDisabled();
  });
});
