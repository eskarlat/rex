import { test, expect } from '@playwright/test';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TEST_PROJECT_DIR = join(tmpdir(), 'e2e-devtools-test');

// ──────────────────────────────────────────────
// Extension Panel Page — navigation
// ──────────────────────────────────────────────

test.describe('Renre Devtools — panel page', () => {
  test('extension panel page loads without crash', async ({ page }) => {
    await page.goto('/extensions/chrome-debugger');
    await expect(page.locator('#root')).toBeAttached();
  });

  test('shows extension name heading', async ({ page }) => {
    await page.goto('/extensions/chrome-debugger');
    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible();
  });
});

// ──────────────────────────────────────────────
// POST /api/run — command execution API
// ──────────────────────────────────────────────

test.describe('Renre Devtools — exec API', () => {
  test('POST /api/run returns error for unactivated extension', async ({ request }) => {
    const response = await request.post('/api/run', {
      headers: { 'X-RenreKit-Project': TEST_PROJECT_DIR },
      data: {
        command: 'chrome-debugger:status',
        args: {},
      },
    });
    // Extension is not activated in the E2E project, so should return 404
    expect(response.status()).toBe(404);
    const data = await response.json();
    expect(data.error).toContain('not activated');
  });

  test('POST /api/run validates command format', async ({ request }) => {
    const response = await request.post('/api/run', {
      headers: { 'X-RenreKit-Project': TEST_PROJECT_DIR },
      data: {
        command: 'invalid-format',
        args: {},
      },
    });
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Invalid command format');
  });

  test('POST /api/run requires command field', async ({ request }) => {
    const response = await request.post('/api/run', {
      headers: { 'X-RenreKit-Project': TEST_PROJECT_DIR },
      data: {},
    });
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('command is required');
  });

  test('POST /api/run requires project context', async ({ request }) => {
    const response = await request.post('/api/run', {
      data: {
        command: 'chrome-debugger:status',
        args: {},
      },
    });
    expect(response.status()).toBe(400);
  });
});

// ──────────────────────────────────────────────
// Dashboard — widget can be configured
// ──────────────────────────────────────────────

test.describe('Renre Devtools — dashboard layout API', () => {
  test('can save layout with chrome-debugger widget', async ({ request }) => {
    const layout = {
      widgets: [
        {
          id: 'chrome-debugger:browser-widget',
          extensionName: 'chrome-debugger',
          widgetId: 'browser-widget',
          position: { x: 0, y: 0 },
          size: { w: 4, h: 2 },
        },
      ],
    };

    const putResponse = await request.put('/api/dashboard/layout', {
      headers: { 'X-RenreKit-Project': TEST_PROJECT_DIR },
      data: layout,
    });
    expect(putResponse.ok()).toBeTruthy();

    const getResponse = await request.get('/api/dashboard/layout', {
      headers: { 'X-RenreKit-Project': TEST_PROJECT_DIR },
    });
    expect(getResponse.ok()).toBeTruthy();
    const data = await getResponse.json();
    expect(data.widgets).toHaveLength(1);
    expect(data.widgets[0].id).toBe('chrome-debugger:browser-widget');
    expect(data.widgets[0].extensionName).toBe('chrome-debugger');
    expect(data.widgets[0].size).toEqual({ w: 4, h: 2 });
  });

  test('can save layout with multiple widgets including chrome-debugger', async ({ request }) => {
    const layout = {
      widgets: [
        {
          id: 'hello-world:status-widget',
          extensionName: 'hello-world',
          widgetId: 'status-widget',
          position: { x: 0, y: 0 },
          size: { w: 4, h: 2 },
        },
        {
          id: 'chrome-debugger:browser-widget',
          extensionName: 'chrome-debugger',
          widgetId: 'browser-widget',
          position: { x: 4, y: 0 },
          size: { w: 4, h: 2 },
        },
      ],
    };

    const putResponse = await request.put('/api/dashboard/layout', {
      headers: { 'X-RenreKit-Project': TEST_PROJECT_DIR },
      data: layout,
    });
    expect(putResponse.ok()).toBeTruthy();

    const getResponse = await request.get('/api/dashboard/layout', {
      headers: { 'X-RenreKit-Project': TEST_PROJECT_DIR },
    });
    const data = await getResponse.json();
    expect(data.widgets).toHaveLength(2);
    expect(data.widgets[1].extensionName).toBe('chrome-debugger');
  });
});
