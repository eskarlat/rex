import { test, expect } from '@playwright/test';
import { setupAPIMocks, mockDashboardLayout, mockEmptyDashboardLayout } from './helpers';

test.describe('Dashboard Widget Grid', () => {
  test.beforeEach(async ({ page }) => {
    await setupAPIMocks(page);
    await page.goto('/');
  });

  test('displays Widgets heading on home page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Widgets' })).toBeVisible();
  });

  test('displays Add Widget button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /add widget/i })).toBeVisible();
  });

  test('shows widget card for existing widget in layout', async ({ page }) => {
    // The mock layout has a 'status-widget' from 'hello-world'
    await expect(page.getByText('status-widget')).toBeVisible();
  });

  test('widget card has drag handle', async ({ page }) => {
    await expect(page.getByTestId('drag-handle')).toBeVisible();
  });

  test('widget card has remove button', async ({ page }) => {
    await expect(page.getByTestId('remove-widget')).toBeVisible();
  });

  test('shows empty state when no widgets configured', async ({ page }) => {
    const emptyPage = await page.context().newPage();
    await setupAPIMocksWithEmptyLayout(emptyPage);
    await emptyPage.goto('/');
    await expect(
      emptyPage.getByText('No widgets yet. Click Add Widget to get started.'),
    ).toBeVisible();
    await emptyPage.close();
  });
});

test.describe('Widget Picker Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await setupAPIMocks(page);
    await page.goto('/');
  });

  test('opens Add Widget dialog on button click', async ({ page }) => {
    await page.getByRole('button', { name: /add widget/i }).click();
    await expect(page.getByRole('heading', { name: 'Add Widget' })).toBeVisible();
  });

  test('shows available widgets from active extensions', async ({ page }) => {
    await page.getByRole('button', { name: /add widget/i }).click();
    await expect(page.getByText('Hello Status')).toBeVisible();
    await expect(page.getByText('Hello Info')).toBeVisible();
  });

  test('shows extension name under widget title', async ({ page }) => {
    await page.getByRole('button', { name: /add widget/i }).click();
    const pickerList = page.getByTestId('widget-picker-list');
    await expect(pickerList.getByText('hello-world').first()).toBeVisible();
  });

  test('shows Added button for widgets already in layout', async ({ page }) => {
    await page.getByRole('button', { name: /add widget/i }).click();
    // status-widget is already in the mock layout
    await expect(page.getByRole('button', { name: 'Added' })).toBeVisible();
  });

  test('Added button is disabled', async ({ page }) => {
    await page.getByRole('button', { name: /add widget/i }).click();
    const addedBtn = page.getByRole('button', { name: 'Added' });
    await expect(addedBtn).toBeDisabled();
  });

  test('shows Add button for widgets not yet in layout', async ({ page }) => {
    await page.getByRole('button', { name: /add widget/i }).click();
    // info-widget is not in the mock layout
    const addBtns = page.getByTestId('widget-picker-list').getByRole('button', { name: 'Add' });
    await expect(addBtns).toHaveCount(1);
  });

  test('dialog can be closed with Escape', async ({ page }) => {
    await page.getByRole('button', { name: /add widget/i }).click();
    await expect(page.getByRole('heading', { name: 'Add Widget' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'Add Widget' })).not.toBeVisible();
  });

  test('clicking Add triggers layout save API call', async ({ page }) => {
    let saveCalled = false;
    await page.route('**/api/dashboard/layout', (route) => {
      if (route.request().method() === 'PUT') {
        saveCalled = true;
        return route.fulfill({ json: { ok: true } });
      }
      return route.fulfill({ json: mockDashboardLayout });
    });

    await page.getByRole('button', { name: /add widget/i }).click();
    const addBtn = page.getByTestId('widget-picker-list').getByRole('button', { name: 'Add' });
    await addBtn.click();

    await page.waitForTimeout(500);
    expect(saveCalled).toBe(true);
  });

  test('dialog closes after adding a widget', async ({ page }) => {
    await page.getByRole('button', { name: /add widget/i }).click();
    const addBtn = page.getByTestId('widget-picker-list').getByRole('button', { name: 'Add' });
    await addBtn.click();
    await expect(page.getByRole('heading', { name: 'Add Widget' })).not.toBeVisible({
      timeout: 3000,
    });
  });

  test('shows empty message when no extensions have widgets', async ({ page }) => {
    const emptyPage = await page.context().newPage();
    await emptyPage.route('**/api/marketplace', (route) =>
      route.fulfill({
        json: {
          active: [
            {
              name: 'no-widgets-ext',
              version: '1.0.0',
              type: 'standard',
              status: 'active',
            },
          ],
          installed: [],
          available: [],
        },
      }),
    );
    await emptyPage.route('**/api/projects', (route) =>
      route.fulfill({ json: [] }),
    );
    await emptyPage.route('**/api/project', (route) =>
      route.fulfill({ json: { name: 'test', path: '/tmp/test' } }),
    );
    await emptyPage.route('**/api/dashboard/layout', (route) =>
      route.fulfill({ json: mockEmptyDashboardLayout }),
    );

    await emptyPage.goto('/');
    await emptyPage.getByRole('button', { name: /add widget/i }).click();
    await expect(
      emptyPage.getByText('No widgets available. Install and activate extensions with widgets.'),
    ).toBeVisible();
    await emptyPage.close();
  });
});

test.describe('Widget Removal', () => {
  test.beforeEach(async ({ page }) => {
    await setupAPIMocks(page);
    await page.goto('/');
  });

  test('clicking remove triggers layout save without the widget', async ({ page }) => {
    let savedLayout: { widgets: unknown[] } | null = null;
    await page.route('**/api/dashboard/layout', (route) => {
      if (route.request().method() === 'PUT') {
        savedLayout = route.request().postDataJSON() as { widgets: unknown[] };
        return route.fulfill({ json: { ok: true } });
      }
      return route.fulfill({ json: mockDashboardLayout });
    });

    await page.getByTestId('remove-widget').click();
    await page.waitForTimeout(500);

    expect(savedLayout).toBeTruthy();
    expect(savedLayout!.widgets).toHaveLength(0);
  });
});

test.describe('Dashboard Layout API Integration', () => {
  test('GET /api/dashboard/layout returns layout data', async ({ page }) => {
    await setupAPIMocks(page);
    await page.goto('/');

    // Verify the page renders with the layout data
    await expect(page.getByText('status-widget')).toBeVisible();
  });

  test('PUT /api/dashboard/layout sends correct payload when adding widget', async ({ page }) => {
    let putPayload: Record<string, unknown> | null = null;
    await setupAPIMocks(page);

    await page.route('**/api/dashboard/layout', (route) => {
      if (route.request().method() === 'PUT') {
        putPayload = route.request().postDataJSON() as Record<string, unknown>;
        return route.fulfill({ json: { ok: true } });
      }
      return route.fulfill({ json: mockDashboardLayout });
    });

    await page.goto('/');
    await page.getByRole('button', { name: /add widget/i }).click();
    await page.getByTestId('widget-picker-list').getByRole('button', { name: 'Add' }).click();

    await page.waitForTimeout(500);
    expect(putPayload).toBeTruthy();
    const widgets = (putPayload as Record<string, unknown>).widgets as unknown[];
    expect(widgets).toHaveLength(2);
  });
});

test.describe('Dashboard with Multiple Widgets', () => {
  test('renders multiple widget cards', async ({ page }) => {
    const multiWidgetLayout = {
      widgets: [
        {
          id: 'hello-world:status-widget',
          extensionName: 'hello-world',
          widgetId: 'status-widget',
          position: { x: 0, y: 0 },
          size: { w: 4, h: 2 },
        },
        {
          id: 'hello-world:info-widget',
          extensionName: 'hello-world',
          widgetId: 'info-widget',
          position: { x: 4, y: 0 },
          size: { w: 3, h: 2 },
        },
      ],
    };

    await page.route('**/api/dashboard/layout', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({ json: multiWidgetLayout });
      }
      return route.fulfill({ json: { ok: true } });
    });

    // Setup remaining mocks
    await setupAPIMocks(page);
    await page.goto('/');

    const cards = page.getByTestId('drag-handle');
    await expect(cards).toHaveCount(2);
  });

  test('all widgets in picker show Added when all are in layout', async ({ page }) => {
    const fullLayout = {
      widgets: [
        {
          id: 'hello-world:status-widget',
          extensionName: 'hello-world',
          widgetId: 'status-widget',
          position: { x: 0, y: 0 },
          size: { w: 4, h: 2 },
        },
        {
          id: 'hello-world:info-widget',
          extensionName: 'hello-world',
          widgetId: 'info-widget',
          position: { x: 4, y: 0 },
          size: { w: 3, h: 2 },
        },
      ],
    };

    await page.route('**/api/dashboard/layout', (route) =>
      route.fulfill({ json: fullLayout }),
    );
    await setupAPIMocks(page);
    await page.goto('/');

    await page.getByRole('button', { name: /add widget/i }).click();

    const addedBtns = page.getByRole('button', { name: 'Added' });
    await expect(addedBtns).toHaveCount(2);
    const addBtns = page.getByTestId('widget-picker-list').getByRole('button', { name: 'Add' });
    await expect(addBtns).toHaveCount(0);
  });
});

/**
 * Helper to set up mocks with an empty dashboard layout.
 */
async function setupAPIMocksWithEmptyLayout(page: import('@playwright/test').Page): Promise<void> {
  await setupAPIMocks(page);
  await page.route('**/api/dashboard/layout', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: mockEmptyDashboardLayout });
    }
    return route.fulfill({ json: { ok: true } });
  });
}
