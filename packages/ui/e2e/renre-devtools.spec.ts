import { test, expect, type Page } from '@playwright/test';
import { setupAPIMocks, mockMarketplace } from './helpers';

/** Marketplace mock that includes renre-devtools as active extension. */
const devtoolsMarketplace = {
  active: [
    ...mockMarketplace.active,
    {
      name: 'renre-devtools',
      version: '1.0.0',
      type: 'mcp',
      description: 'Browser automation and debugging via Puppeteer MCP server',
      status: 'active',
      author: 'renre',
      tags: ['browser', 'devtools', 'mcp'],
      panels: [{ id: 'browser-panel', title: 'Browser Devtools' }],
      widgets: [
        {
          id: 'browser-widget',
          title: 'Browser Status',
          defaultSize: { w: 4, h: 2 },
          minSize: { w: 3, h: 2 },
          maxSize: { w: 6, h: 4 },
        },
      ],
    },
  ],
  installed: mockMarketplace.installed,
  available: mockMarketplace.available,
};

/**
 * Set up all common API route mocks with renre-devtools included.
 */
async function setupDevtoolsAPIMocks(page: Page): Promise<void> {
  await setupAPIMocks(page);
  // Override the marketplace route to include renre-devtools
  await page.route('**/api/marketplace', (route) =>
    route.fulfill({ json: devtoolsMarketplace }),
  );
}

/**
 * Set up mocks with ONLY renre-devtools (no other extensions).
 * Useful for isolated install/activate flow tests.
 */
async function setupIsolatedMocks(
  page: Page,
  marketplace: { active: unknown[]; installed: unknown[]; available: unknown[] },
): Promise<void> {
  await page.route('**/api/projects', (route) =>
    route.fulfill({ json: [] }),
  );
  await page.route('**/api/project', (route) =>
    route.fulfill({ json: null }),
  );
  await page.route('**/api/marketplace', (route) =>
    route.fulfill({ json: marketplace }),
  );
  await page.route('**/api/extensions/install', (route) =>
    route.fulfill({ json: { ok: true } }),
  );
  await page.route('**/api/extensions/activate', (route) =>
    route.fulfill({ json: { ok: true } }),
  );
  await page.route('**/api/extensions/deactivate', (route) =>
    route.fulfill({ json: { ok: true } }),
  );
}

const devtoolsExtension = {
  name: 'renre-devtools',
  version: '1.0.0',
  type: 'mcp',
  description: 'Browser automation and debugging via Puppeteer MCP server',
  status: 'active',
  author: 'renre',
  tags: ['browser', 'devtools'],
};

// ──────────────────────────────────────────────
// Extension Panel Page
// ──────────────────────────────────────────────

test.describe('Renre Devtools — Extension Panel Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupDevtoolsAPIMocks(page);
  });

  test('displays extension name as heading', async ({ page }) => {
    await page.goto('/extensions/renre-devtools');
    await expect(
      page.getByRole('heading', { name: 'renre-devtools' }),
    ).toBeVisible();
  });

  test('shows extension panel subtitle', async ({ page }) => {
    await page.goto('/extensions/renre-devtools');
    await expect(page.getByText('Extension panel')).toBeVisible();
  });

  test('shows error alert when panel fails to load', async ({ page }) => {
    await page.route('**/api/extensions/renre-devtools/panels/browser-panel.js', (route) =>
      route.fulfill({ status: 404, body: 'Not found' }),
    );
    await page.goto('/extensions/renre-devtools');
    await expect(page.getByText('Failed to load panel')).toBeVisible({ timeout: 10000 });
  });
});

// ──────────────────────────────────────────────
// Marketplace Listing
// ──────────────────────────────────────────────

test.describe('Renre Devtools — Marketplace', () => {
  test.beforeEach(async ({ page }) => {
    await setupDevtoolsAPIMocks(page);
    await page.goto('/marketplace');
  });

  test('shows renre-devtools in active extensions tab', async ({ page }) => {
    await page.getByRole('tab', { name: /active/i }).click();
    const tabPanel = page.getByRole('tabpanel');
    await expect(tabPanel.getByText('renre-devtools')).toBeVisible();
  });

  test('shows mcp type badge for renre-devtools', async ({ page }) => {
    await page.getByRole('tab', { name: /active/i }).click();
    // Scope to the renre-devtools card area
    await expect(
      page.getByText(/browser automation and debugging/i),
    ).toBeVisible();
  });

  test('shows extension description', async ({ page }) => {
    await page.getByRole('tab', { name: /active/i }).click();
    await expect(
      page.getByText(/browser automation and debugging/i),
    ).toBeVisible();
  });

  test('has deactivate button for renre-devtools', async ({ page }) => {
    await page.getByRole('tab', { name: /active/i }).click();
    // With 2 active extensions, we should have 2 deactivate buttons
    const deactivateButtons = page.getByRole('button', { name: /deactivate/i });
    await expect(deactivateButtons).toHaveCount(2);
  });

  test('deactivate triggers API call', async ({ page }) => {
    let deactivateCalled = false;
    await page.route('**/api/extensions/deactivate', (route) => {
      deactivateCalled = true;
      return route.fulfill({ json: { ok: true } });
    });

    await page.getByRole('tab', { name: /active/i }).click();
    const buttons = page.getByRole('button', { name: /deactivate/i });
    await buttons.nth(1).click();

    await page.waitForTimeout(500);
    expect(deactivateCalled).toBe(true);
  });
});

// ──────────────────────────────────────────────
// Dashboard Widget
// ──────────────────────────────────────────────

test.describe('Renre Devtools — Dashboard Widget', () => {
  test('widget appears in Add Widget picker', async ({ page }) => {
    await setupDevtoolsAPIMocks(page);
    await page.goto('/');

    await page.getByRole('button', { name: /add widget/i }).click();
    await expect(page.getByText('Browser Status')).toBeVisible();
  });

  test('widget shows extension name in picker', async ({ page }) => {
    await setupDevtoolsAPIMocks(page);
    await page.goto('/');

    await page.getByRole('button', { name: /add widget/i }).click();
    const pickerList = page.getByTestId('widget-picker-list');
    await expect(pickerList.getByText('renre-devtools')).toBeVisible();
  });

  test('widget renders in dashboard when in layout', async ({ page }) => {
    await setupDevtoolsAPIMocks(page);
    await page.route('**/api/dashboard/layout', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          json: {
            widgets: [
              {
                id: 'renre-devtools:browser-widget',
                extensionName: 'renre-devtools',
                widgetId: 'browser-widget',
                position: { x: 0, y: 0 },
                size: { w: 4, h: 2 },
              },
            ],
          },
        });
      }
      return route.fulfill({ json: { ok: true } });
    });

    await page.goto('/');
    await expect(page.getByText('Browser Status')).toBeVisible();
  });
});

// ──────────────────────────────────────────────
// Extension Install Flow
// ──────────────────────────────────────────────

test.describe('Renre Devtools — Install Flow', () => {
  test('install from available → appears in installed tab', async ({ page }) => {
    let installCalled = false;

    const availableState = {
      active: [],
      installed: [],
      available: [{ ...devtoolsExtension, status: 'available' }],
    };

    const installedState = {
      active: [],
      installed: [{ ...devtoolsExtension, status: 'installed' }],
      available: [],
    };

    await page.route('**/api/marketplace', (route) =>
      route.fulfill({ json: installCalled ? installedState : availableState }),
    );
    await page.route('**/api/extensions/install', (route) => {
      installCalled = true;
      return route.fulfill({ json: { ok: true } });
    });
    await page.route('**/api/projects', (route) => route.fulfill({ json: [] }));
    await page.route('**/api/project', (route) => route.fulfill({ json: null }));

    await page.goto('/marketplace');

    await page.getByRole('tab', { name: /available/i }).click();
    await expect(page.getByText('renre-devtools')).toBeVisible();

    await page.getByRole('button', { name: 'Install' }).click();
    await page.waitForTimeout(500);

    await page.getByRole('tab', { name: /installed/i }).click();
    await expect(page.getByText('renre-devtools')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Activate' })).toBeVisible();
  });

  test('activate installed → appears in active tab', async ({ page }) => {
    let activateCalled = false;

    const installedState = {
      active: [],
      installed: [{ ...devtoolsExtension, status: 'installed' }],
      available: [],
    };

    const activeState = {
      active: [devtoolsExtension],
      installed: [],
      available: [],
    };

    await page.route('**/api/marketplace', (route) =>
      route.fulfill({ json: activateCalled ? activeState : installedState }),
    );
    await page.route('**/api/extensions/activate', (route) => {
      activateCalled = true;
      return route.fulfill({ json: { ok: true } });
    });
    await page.route('**/api/projects', (route) => route.fulfill({ json: [] }));
    await page.route('**/api/project', (route) => route.fulfill({ json: null }));

    await page.goto('/marketplace');

    await page.getByRole('tab', { name: /installed/i }).click();
    await expect(page.getByText('renre-devtools')).toBeVisible();

    await page.getByRole('button', { name: 'Activate' }).click();
    await page.waitForTimeout(500);

    await page.getByRole('tab', { name: /active/i }).click();
    await expect(page.getByRole('button', { name: 'Deactivate' })).toBeVisible();
  });

  test('extension panel page is accessible after activation', async ({ page }) => {
    await setupIsolatedMocks(page, {
      active: [devtoolsExtension],
      installed: [],
      available: [],
    });

    await page.goto('/extensions/renre-devtools');
    await expect(
      page.getByRole('heading', { name: 'renre-devtools' }),
    ).toBeVisible();
    await expect(page.getByText('Extension panel')).toBeVisible();
  });
});
