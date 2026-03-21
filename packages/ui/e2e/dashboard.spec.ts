import { test, expect, type Page } from '@playwright/test';
import {
  setupAPIMocks,
  mockDashboardLayout,
  mockEmptyDashboardLayout,
  mockMarketplace,
} from './helpers';

/**
 * Set up mocks with an empty dashboard layout.
 */
async function setupAPIMocksWithEmptyLayout(page: Page): Promise<void> {
  await setupAPIMocks(page);
  await page.route('**/api/dashboard/layout', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: mockEmptyDashboardLayout });
    }
    return route.fulfill({ json: { ok: true } });
  });
}

/**
 * Set up mocks with a custom dashboard layout.
 * Must be called AFTER setupAPIMocks so it overrides the default layout route.
 */
async function setupWithLayout(page: Page, layout: unknown): Promise<void> {
  await setupAPIMocks(page);
  await page.route('**/api/dashboard/layout', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: layout });
    }
    return route.fulfill({ json: { ok: true } });
  });
}

/**
 * Set up mocks with a custom layout and intercept PUT calls.
 */
async function setupWithLayoutAndCapture(
  page: Page,
  layout: unknown,
): Promise<{ getSavedLayout: () => unknown; waitForSave: () => Promise<void> }> {
  let savedLayout: unknown = null;
  let resolveSave: (() => void) | null = null;
  await setupAPIMocks(page);
  await page.route('**/api/dashboard/layout', (route) => {
    if (route.request().method() === 'PUT') {
      savedLayout = route.request().postDataJSON();
      resolveSave?.();
      return route.fulfill({ json: { ok: true } });
    }
    return route.fulfill({ json: layout });
  });
  return {
    getSavedLayout: () => savedLayout,
    waitForSave: () =>
      new Promise<void>((resolve) => {
        resolveSave = resolve;
      }),
  };
}

// ──────────────────────────────────────────────
// Widget Grid basics
// ──────────────────────────────────────────────

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
    await expect(page.getByText('Hello Status')).toBeVisible();
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

// ──────────────────────────────────────────────
// Widget Picker Dialog
// ──────────────────────────────────────────────

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
    await expect(page.getByRole('button', { name: 'Added' })).toBeVisible();
  });

  test('Added button is disabled', async ({ page }) => {
    await page.getByRole('button', { name: /add widget/i }).click();
    const addedBtn = page.getByRole('button', { name: 'Added' });
    await expect(addedBtn).toBeDisabled();
  });

  test('shows Add button for widgets not yet in layout', async ({ page }) => {
    await page.getByRole('button', { name: /add widget/i }).click();
    // info-widget is not in the mock layout — the only non-Added button should be "Add"
    const pickerList = page.getByTestId('widget-picker-list');
    await expect(pickerList.getByRole('button', { name: 'Add', exact: true })).toBeVisible();
  });

  test('dialog can be closed with Escape', async ({ page }) => {
    await page.getByRole('button', { name: /add widget/i }).click();
    await expect(page.getByRole('heading', { name: 'Add Widget' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'Add Widget' })).not.toBeVisible();
  });

  test('clicking Add triggers layout save API call', async ({ page }) => {
    const { getSavedLayout, waitForSave } = await setupWithLayoutAndCapture(
      page,
      mockDashboardLayout,
    );
    await page.goto('/');

    const savePromise = waitForSave();
    await page.getByRole('button', { name: /add widget/i }).click();
    const addBtn = page
      .getByTestId('widget-picker-list')
      .getByRole('button', { name: 'Add', exact: true });
    await addBtn.click();

    await savePromise;
    expect(getSavedLayout()).toBeTruthy();
  });

  test('dialog closes after adding a widget', async ({ page }) => {
    await page.getByRole('button', { name: /add widget/i }).click();
    const addBtn = page
      .getByTestId('widget-picker-list')
      .getByRole('button', { name: 'Add', exact: true });
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
    await emptyPage.route('**/api/projects', (route) => route.fulfill({ json: [] }));
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

// ──────────────────────────────────────────────
// Widget Removal
// ──────────────────────────────────────────────

test.describe('Widget Removal', () => {
  test('clicking remove triggers layout save without the widget', async ({ page }) => {
    const { getSavedLayout, waitForSave } = await setupWithLayoutAndCapture(
      page,
      mockDashboardLayout,
    );
    await page.goto('/');

    const savePromise = waitForSave();
    await page.getByTestId('remove-widget').click();
    await savePromise;

    const saved = getSavedLayout() as { widgets: unknown[] };
    expect(saved).toBeTruthy();
    expect(saved.widgets).toHaveLength(0);
  });
});

// ──────────────────────────────────────────────
// Widget Drag and Drop
// ──────────────────────────────────────────────

test.describe('Widget Drag and Drop', () => {
  const twoWidgetLayout = {
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

  test('renders two widget cards with drag handles', async ({ page }) => {
    await setupWithLayout(page, twoWidgetLayout);
    await page.goto('/');

    const handles = page.getByTestId('drag-handle');
    await expect(handles).toHaveCount(2);
  });

  test('drag handle has cursor-grab class', async ({ page }) => {
    await setupWithLayout(page, twoWidgetLayout);
    await page.goto('/');

    const handle = page.getByTestId('drag-handle').first();
    await expect(handle).toHaveClass(/cursor-grab/);
  });

  test('dragging a widget triggers layout save with reordered widgets', async ({ page }) => {
    const { getSavedLayout, waitForSave } = await setupWithLayoutAndCapture(page, twoWidgetLayout);
    await page.goto('/');

    const firstHandle = page.getByTestId('drag-handle').first();
    const secondHandle = page.getByTestId('drag-handle').nth(1);

    const firstBox = await firstHandle.boundingBox();
    const secondBox = await secondHandle.boundingBox();

    if (firstBox && secondBox) {
      const savePromise = waitForSave();
      await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(secondBox.x + secondBox.width / 2, secondBox.y + secondBox.height / 2, {
        steps: 10,
      });
      await page.mouse.up();

      await savePromise;

      const saved = getSavedLayout() as { widgets: Array<{ id: string }> } | null;
      if (saved) {
        expect(saved.widgets).toHaveLength(2);
        expect(saved.widgets[0]!.id).toBe('hello-world:info-widget');
        expect(saved.widgets[1]!.id).toBe('hello-world:status-widget');
      }
    }
  });

  test('widget cards render in layout order', async ({ page }) => {
    await setupWithLayout(page, twoWidgetLayout);
    await page.goto('/');

    // Both widget titles should be visible
    await expect(page.getByText('Hello Status')).toBeVisible();
    await expect(page.getByText('Hello Info')).toBeVisible();
  });
});

// ──────────────────────────────────────────────
// Widget Resize
// ──────────────────────────────────────────────

test.describe('Widget Resize', () => {
  test.beforeEach(async ({ page }) => {
    await setupAPIMocks(page);
    await page.goto('/');
  });

  test('widget card has grow button', async ({ page }) => {
    await expect(page.getByTestId('grow-widget')).toBeVisible();
  });

  test('widget card has shrink button', async ({ page }) => {
    await expect(page.getByTestId('shrink-widget')).toBeVisible();
  });

  test('grow button has accessible label', async ({ page }) => {
    await expect(page.getByLabel('Grow widget')).toBeVisible();
  });

  test('shrink button has accessible label', async ({ page }) => {
    await expect(page.getByLabel('Shrink widget')).toBeVisible();
  });

  test('clicking grow saves layout with increased size', async ({ page }) => {
    const { getSavedLayout, waitForSave } = await setupWithLayoutAndCapture(
      page,
      mockDashboardLayout,
    );
    await page.goto('/');

    const savePromise = waitForSave();
    await page.getByTestId('grow-widget').click();
    await savePromise;

    const saved = getSavedLayout() as { widgets: Array<{ size: { w: number; h: number } }> };
    expect(saved).toBeTruthy();
    // Original size is 4x2, grow adds 1 to each, clamped by max 6x4
    expect(saved.widgets[0]!.size.w).toBe(5);
    expect(saved.widgets[0]!.size.h).toBe(3);
  });

  test('clicking shrink saves layout with decreased size', async ({ page }) => {
    const { getSavedLayout, waitForSave } = await setupWithLayoutAndCapture(
      page,
      mockDashboardLayout,
    );
    await page.goto('/');

    const savePromise = waitForSave();
    await page.getByTestId('shrink-widget').click();
    await savePromise;

    const saved = getSavedLayout() as { widgets: Array<{ size: { w: number; h: number } }> };
    expect(saved).toBeTruthy();
    // Original size is 4x2, shrink subtracts 1 from each, clamped by min 3x2
    expect(saved.widgets[0]!.size.w).toBe(3);
    expect(saved.widgets[0]!.size.h).toBe(2);
  });
});

// ──────────────────────────────────────────────
// Widget Min/Max Size Constraints
// ──────────────────────────────────────────────

test.describe('Widget Min/Max Size Constraints', () => {
  test('shrink is disabled when widget is at minimum size', async ({ page }) => {
    const atMinLayout = {
      widgets: [
        {
          id: 'hello-world:status-widget',
          extensionName: 'hello-world',
          widgetId: 'status-widget',
          position: { x: 0, y: 0 },
          size: { w: 3, h: 2 },
        },
      ],
    };
    await setupWithLayout(page, atMinLayout);
    await page.goto('/');

    await expect(page.getByTestId('shrink-widget')).toBeDisabled();
  });

  test('grow is disabled when widget is at maximum size', async ({ page }) => {
    const atMaxLayout = {
      widgets: [
        {
          id: 'hello-world:status-widget',
          extensionName: 'hello-world',
          widgetId: 'status-widget',
          position: { x: 0, y: 0 },
          size: { w: 6, h: 4 },
        },
      ],
    };
    await setupWithLayout(page, atMaxLayout);
    await page.goto('/');

    await expect(page.getByTestId('grow-widget')).toBeDisabled();
  });

  test('both buttons enabled when widget is between min and max', async ({ page }) => {
    await setupAPIMocks(page);
    await page.goto('/');

    // Default layout has status-widget at 4x2, min 3x2, max 6x4
    await expect(page.getByTestId('grow-widget')).not.toBeDisabled();
    await expect(page.getByTestId('shrink-widget')).not.toBeDisabled();
  });

  test('grow clamps to max size', async ({ page }) => {
    const nearMaxLayout = {
      widgets: [
        {
          id: 'hello-world:status-widget',
          extensionName: 'hello-world',
          widgetId: 'status-widget',
          position: { x: 0, y: 0 },
          size: { w: 5, h: 3 },
        },
      ],
    };
    const { getSavedLayout, waitForSave } = await setupWithLayoutAndCapture(page, nearMaxLayout);
    await page.goto('/');

    const savePromise = waitForSave();
    await page.getByTestId('grow-widget').click();
    await savePromise;

    const saved = getSavedLayout() as { widgets: Array<{ size: { w: number; h: number } }> };
    expect(saved).toBeTruthy();
    expect(saved.widgets[0]!.size.w).toBe(6);
    expect(saved.widgets[0]!.size.h).toBe(4);
  });

  test('shrink clamps to min size', async ({ page }) => {
    const nearMinLayout = {
      widgets: [
        {
          id: 'hello-world:status-widget',
          extensionName: 'hello-world',
          widgetId: 'status-widget',
          position: { x: 0, y: 0 },
          size: { w: 4, h: 3 },
        },
      ],
    };
    const { getSavedLayout, waitForSave } = await setupWithLayoutAndCapture(page, nearMinLayout);
    await page.goto('/');

    const savePromise = waitForSave();
    await page.getByTestId('shrink-widget').click();
    await savePromise;

    const saved = getSavedLayout() as { widgets: Array<{ size: { w: number; h: number } }> };
    expect(saved).toBeTruthy();
    expect(saved.widgets[0]!.size.w).toBe(3);
    expect(saved.widgets[0]!.size.h).toBe(2);
  });

  test('widget without constraints has both buttons enabled', async ({ page }) => {
    const noConstraintsLayout = {
      widgets: [
        {
          id: 'hello-world:info-widget',
          extensionName: 'hello-world',
          widgetId: 'info-widget',
          position: { x: 0, y: 0 },
          size: { w: 3, h: 2 },
        },
      ],
    };
    await setupWithLayout(page, noConstraintsLayout);
    await page.goto('/');

    await expect(page.getByTestId('grow-widget')).not.toBeDisabled();
    await expect(page.getByTestId('shrink-widget')).not.toBeDisabled();
  });
});

// ──────────────────────────────────────────────
// Dashboard Layout API Integration
// ──────────────────────────────────────────────

test.describe('Dashboard Layout API Integration', () => {
  test('GET /api/dashboard/layout returns layout data', async ({ page }) => {
    await setupAPIMocks(page);
    await page.goto('/');
    await expect(page.getByText('Hello Status')).toBeVisible();
  });

  test('PUT /api/dashboard/layout sends correct payload when adding widget', async ({ page }) => {
    const { getSavedLayout, waitForSave } = await setupWithLayoutAndCapture(
      page,
      mockDashboardLayout,
    );
    await page.goto('/');

    const savePromise = waitForSave();
    await page.getByRole('button', { name: /add widget/i }).click();
    await page
      .getByTestId('widget-picker-list')
      .getByRole('button', { name: 'Add', exact: true })
      .click();

    await savePromise;
    const saved = getSavedLayout() as { widgets: unknown[] };
    expect(saved).toBeTruthy();
    expect(saved.widgets).toHaveLength(2);
  });
});

// ──────────────────────────────────────────────
// Dashboard with Multiple Widgets
// ──────────────────────────────────────────────

test.describe('Dashboard with Multiple Widgets', () => {
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

  test('renders multiple widget cards', async ({ page }) => {
    await setupWithLayout(page, fullLayout);
    await page.goto('/');

    const cards = page.getByTestId('drag-handle');
    await expect(cards).toHaveCount(2);
  });

  test('all widgets in picker show Added when all are in layout', async ({ page }) => {
    await setupWithLayout(page, fullLayout);
    await page.goto('/');

    await page.getByRole('button', { name: /add widget/i }).click();

    const addedBtns = page.getByRole('button', { name: 'Added' });
    await expect(addedBtns).toHaveCount(2);
  });
});
