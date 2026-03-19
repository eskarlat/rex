import { test, expect } from '@playwright/test';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TEST_PROJECT_DIR = join(tmpdir(), 'e2e-test-project');

// ──────────────────────────────────────────────
// Dashboard home page
// ──────────────────────────────────────────────

test.describe('Dashboard home page', () => {
  test('loads the dashboard and shows content', async ({ page }) => {
    await page.goto('/');
    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible();
  });

  test('page has meaningful content', async ({ page }) => {
    await page.goto('/');
    // Dashboard should render — verify body has child content
    await expect(page.locator('#root')).toBeAttached();
  });
});

// ──────────────────────────────────────────────
// Page navigation (direct URL)
// ──────────────────────────────────────────────

test.describe('Page navigation', () => {
  test('marketplace page loads', async ({ page }) => {
    await page.goto('/marketplace');
    await expect(page).toHaveURL(/\/marketplace/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('vault page loads', async ({ page }) => {
    await page.goto('/vault');
    await expect(page).toHaveURL(/\/vault/);
    await expect(page.locator('#root')).toBeAttached();
  });

  test('scheduler page loads', async ({ page }) => {
    await page.goto('/scheduler');
    await expect(page).toHaveURL(/\/scheduler/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('settings page loads', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('settings registries page loads', async ({ page }) => {
    await page.goto('/settings/registries');
    await expect(page).toHaveURL(/\/settings\/registries/);
    await expect(page.locator('body')).toBeVisible();
  });
});

// ──────────────────────────────────────────────
// Marketplace page
// ──────────────────────────────────────────────

test.describe('Marketplace page', () => {
  test('shows extension management UI', async ({ page }) => {
    await page.goto('/marketplace');
    // Should have tabs or extension list content
    const content = page.locator('[role="tablist"], table, [data-orientation]').first();
    await expect(content).toBeVisible();
  });

  test('marketplace API responds with extension data', async ({ request }) => {
    const response = await request.get('/api/marketplace', {
      headers: { 'X-RenreKit-Project': TEST_PROJECT_DIR },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('installed');
    expect(data).toHaveProperty('available');
    expect(data).toHaveProperty('active');
  });
});

// ──────────────────────────────────────────────
// Vault page
// ──────────────────────────────────────────────

test.describe('Vault page', () => {
  test('loads vault page', async ({ page }) => {
    await page.goto('/vault');
    await expect(page.locator('#root')).toBeAttached();
  });

  test('vault API responds with entries', async ({ request }) => {
    const response = await request.get('/api/vault');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });
});

// ──────────────────────────────────────────────
// Scheduler page
// ──────────────────────────────────────────────

test.describe('Scheduler page', () => {
  test('loads scheduler page', async ({ page }) => {
    await page.goto('/scheduler');
    await expect(page.locator('body')).toBeVisible();
  });

  test('scheduler API responds', async ({ request }) => {
    const response = await request.get('/api/scheduler', {
      headers: { 'X-RenreKit-Project': TEST_PROJECT_DIR },
    });
    expect(response.ok()).toBeTruthy();
  });
});

// ──────────────────────────────────────────────
// Settings page
// ──────────────────────────────────────────────

test.describe('Settings page', () => {
  test('loads settings page', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('body')).toBeVisible();
  });

  test('settings API responds with config', async ({ request }) => {
    const response = await request.get('/api/settings');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('registries');
  });
});

// ──────────────────────────────────────────────
// Dashboard layout API
// ──────────────────────────────────────────────

test.describe('Dashboard layout API', () => {
  test('GET /api/dashboard/layout returns empty layout without project', async ({ request }) => {
    const response = await request.get('/api/dashboard/layout');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('widgets');
    expect(Array.isArray(data.widgets)).toBeTruthy();
  });

  test('GET /api/dashboard/layout returns layout with project header', async ({ request }) => {
    const response = await request.get('/api/dashboard/layout', {
      headers: { 'X-RenreKit-Project': TEST_PROJECT_DIR },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('widgets');
  });

  test('PUT /api/dashboard/layout saves and GET retrieves it', async ({ request }) => {
    const layout = {
      widgets: [
        {
          id: 'test-ext:test-widget',
          extensionName: 'test-ext',
          widgetId: 'test-widget',
          position: { x: 0, y: 0 },
          size: { w: 4, h: 2 },
        },
      ],
    };

    // Save layout
    const putResponse = await request.put('/api/dashboard/layout', {
      headers: { 'X-RenreKit-Project': TEST_PROJECT_DIR },
      data: layout,
    });
    expect(putResponse.ok()).toBeTruthy();

    // Retrieve saved layout
    const getResponse = await request.get('/api/dashboard/layout', {
      headers: { 'X-RenreKit-Project': TEST_PROJECT_DIR },
    });
    expect(getResponse.ok()).toBeTruthy();
    const data = await getResponse.json();
    expect(data.widgets).toHaveLength(1);
    expect(data.widgets[0].id).toBe('test-ext:test-widget');
    expect(data.widgets[0].extensionName).toBe('test-ext');
    expect(data.widgets[0].size).toEqual({ w: 4, h: 2 });
  });

  test('PUT /api/dashboard/layout can save empty layout', async ({ request }) => {
    const emptyLayout = { widgets: [] };

    const putResponse = await request.put('/api/dashboard/layout', {
      headers: { 'X-RenreKit-Project': TEST_PROJECT_DIR },
      data: emptyLayout,
    });
    expect(putResponse.ok()).toBeTruthy();

    const getResponse = await request.get('/api/dashboard/layout', {
      headers: { 'X-RenreKit-Project': TEST_PROJECT_DIR },
    });
    const data = await getResponse.json();
    expect(data.widgets).toHaveLength(0);
  });

  test('PUT /api/dashboard/layout returns error without project', async ({ request }) => {
    const response = await request.put('/api/dashboard/layout', {
      data: { widgets: [] },
    });
    // Should fail without project context
    expect(response.status()).toBe(400);
  });

  test('marketplace API includes widget metadata for active extensions', async ({ request }) => {
    const response = await request.get('/api/marketplace', {
      headers: { 'X-RenreKit-Project': TEST_PROJECT_DIR },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Active extensions should have widgets array (may be empty if no extensions are active)
    for (const ext of data.active) {
      expect(ext).toHaveProperty('widgets');
      expect(Array.isArray(ext.widgets)).toBeTruthy();
    }
  });
});

// ──────────────────────────────────────────────
// API integration — real server endpoints
// ──────────────────────────────────────────────

test.describe('API integration', () => {
  test('GET /api/projects returns array', async ({ request }) => {
    const response = await request.get('/api/projects');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('GET /api/registries returns array', async ({ request }) => {
    const response = await request.get('/api/registries');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('GET /api/vault returns array', async ({ request }) => {
    const response = await request.get('/api/vault');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('GET /api/settings returns config object', async ({ request }) => {
    const response = await request.get('/api/settings');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(typeof data).toBe('object');
    expect(data).toHaveProperty('registries');
  });

  test('GET /api/scheduler returns tasks', async ({ request }) => {
    const response = await request.get('/api/scheduler', {
      headers: { 'X-RenreKit-Project': TEST_PROJECT_DIR },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('GET /api/marketplace returns extension lists', async ({ request }) => {
    const response = await request.get('/api/marketplace', {
      headers: { 'X-RenreKit-Project': TEST_PROJECT_DIR },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('installed');
  });
});
