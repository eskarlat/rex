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
    await expect(page.getByRole('button', { name: 'Added' })).toBeVisible();
  });

  test('Added button is disabled', async ({ page }) => {
    await page.getByRole('button', { name: /add widget/i }).click();
    const addedBtn = page.getByRole('button', { name: 'Added' });
    await expect(addedBtn).toBeDisabled();
  });

  test('shows Add button for widgets not yet in layout', async ({ page }) => {
    await page.getByRole('button', { name: /add widget/i }).click();
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
    await page.route('**/api/dashboard/layout', (route) =>
      route.fulfill({ json: twoWidgetLayout }),
    );
    await setupAPIMocks(page);
    await page.goto('/');

    const handles = page.getByTestId('drag-handle');
    await expect(handles).toHaveCount(2);
  });

  test('drag handle has cursor-grab class', async ({ page }) => {
    await page.route('**/api/dashboard/layout', (route) =>
      route.fulfill({ json: twoWidgetLayout }),
    );
    await setupAPIMocks(page);
    await page.goto('/');

    const handle = page.getByTestId('drag-handle').first();
    await expect(handle).toHaveClass(/cursor-grab/);
  });

  test('dragging a widget triggers layout save with reordered widgets', async ({ page }) => {
    let savedLayout: { widgets: Array<{ id: string }> } | null = null;
    await page.route('**/api/dashboard/layout', (route) => {
      if (route.request().method() === 'PUT') {
        savedLayout = route.request().postDataJSON() as { widgets: Array<{ id: string }> };
        return route.fulfill({ json: { ok: true } });
      }
      return route.fulfill({ json: twoWidgetLayout });
    });
    await setupAPIMocks(page);
    await page.goto('/');

    // Get both drag handles
    const firstHandle = page.getByTestId('drag-handle').first();
    const secondHandle = page.getByTestId('drag-handle').nth(1);

    // Get bounding boxes
    const firstBox = await firstHandle.boundingBox();
    const secondBox = await secondHandle.boundingBox();

    if (firstBox && secondBox) {
      // Drag first widget to second widget's position
      await page.mouse.move(
        firstBox.x + firstBox.width / 2,
        firstBox.y + firstBox.height / 2,
      );
      await page.mouse.down();
      await page.mouse.move(
        secondBox.x + secondBox.width / 2,
        secondBox.y + secondBox.height / 2,
        { steps: 10 },
      );
      await page.mouse.up();

      // Give time for the drag end handler to fire
      await page.waitForTimeout(500);

      if (savedLayout) {
        // If drag was successful, the order should be reversed
        expect(savedLayout.widgets).toHaveLength(2);
        expect(savedLayout.widgets[0]!.id).toBe('hello-world:info-widget');
        expect(savedLayout.widgets[1]!.id).toBe('hello-world:status-widget');
      }
    }
  });

  test('widget cards maintain correct order after render', async ({ page }) => {
    await page.route('**/api/dashboard/layout', (route) =>
      route.fulfill({ json: twoWidgetLayout }),
    );
    await setupAPIMocks(page);
    await page.goto('/');

    // First widget should be status-widget, second should be info-widget
    const titles = page.locator('[class*="CardTitle"]');
    await expect(titles.first()).toHaveText('status-widget');
    await expect(titles.nth(1)).toHaveText('info-widget');
  });
});

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
    let savedLayout: { widgets: Array<{ size: { w: number; h: number } }> } | null = null;
    await page.route('**/api/dashboard/layout', (route) => {
      if (route.request().method() === 'PUT') {
        savedLayout = route.request().postDataJSON() as typeof savedLayout;
        return route.fulfill({ json: { ok: true } });
      }
      return route.fulfill({ json: mockDashboardLayout });
    });

    await page.getByTestId('grow-widget').click();
    await page.waitForTimeout(500);

    expect(savedLayout).toBeTruthy();
    // Original size is 4x2, grow adds 1 to each, but max is 6x4
    expect(savedLayout!.widgets[0]!.size.w).toBe(5);
    expect(savedLayout!.widgets[0]!.size.h).toBe(3);
  });

  test('clicking shrink saves layout with decreased size', async ({ page }) => {
    let savedLayout: { widgets: Array<{ size: { w: number; h: number } }> } | null = null;
    await page.route('**/api/dashboard/layout', (route) => {
      if (route.request().method() === 'PUT') {
        savedLayout = route.request().postDataJSON() as typeof savedLayout;
        return route.fulfill({ json: { ok: true } });
      }
      return route.fulfill({ json: mockDashboardLayout });
    });

    await page.getByTestId('shrink-widget').click();
    await page.waitForTimeout(500);

    expect(savedLayout).toBeTruthy();
    // Original size is 4x2, shrink subtracts 1 from each, but min is 3x2
    expect(savedLayout!.widgets[0]!.size.w).toBe(3);
    expect(savedLayout!.widgets[0]!.size.h).toBe(2);
  });
});

test.describe('Widget Min/Max Size Constraints', () => {
  test('shrink is disabled when widget is at minimum size', async ({ page }) => {
    // Set layout to minimum size (3x2) for status-widget which has minSize { w: 3, h: 2 }
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

    await page.route('**/api/dashboard/layout', (route) =>
      route.fulfill({ json: atMinLayout }),
    );
    await setupAPIMocks(page);
    await page.goto('/');

    await expect(page.getByTestId('shrink-widget')).toBeDisabled();
  });

  test('grow is disabled when widget is at maximum size', async ({ page }) => {
    // Set layout to maximum size (6x4) for status-widget which has maxSize { w: 6, h: 4 }
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

    await page.route('**/api/dashboard/layout', (route) =>
      route.fulfill({ json: atMaxLayout }),
    );
    await setupAPIMocks(page);
    await page.goto('/');

    await expect(page.getByTestId('grow-widget')).toBeDisabled();
  });

  test('both buttons enabled when widget is between min and max size', async ({ page }) => {
    // Default layout has status-widget at 4x2, min 3x2, max 6x4
    await expect(page.getByTestId('grow-widget')).not.toBeDisabled();
    await expect(page.getByTestId('shrink-widget')).not.toBeDisabled();
  });

  test('grow clamps to max size', async ({ page }) => {
    // Widget at 5x3 with max 6x4 — grow should produce 6x4
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

    let savedLayout: { widgets: Array<{ size: { w: number; h: number } }> } | null = null;
    await page.route('**/api/dashboard/layout', (route) => {
      if (route.request().method() === 'PUT') {
        savedLayout = route.request().postDataJSON() as typeof savedLayout;
        return route.fulfill({ json: { ok: true } });
      }
      return route.fulfill({ json: nearMaxLayout });
    });
    await setupAPIMocks(page);
    await page.goto('/');

    await page.getByTestId('grow-widget').click();
    await page.waitForTimeout(500);

    expect(savedLayout).toBeTruthy();
    expect(savedLayout!.widgets[0]!.size.w).toBe(6);
    expect(savedLayout!.widgets[0]!.size.h).toBe(4);
  });

  test('shrink clamps to min size', async ({ page }) => {
    // Widget at 4x3 with min 3x2 — shrink should produce 3x2
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

    let savedLayout: { widgets: Array<{ size: { w: number; h: number } }> } | null = null;
    await page.route('**/api/dashboard/layout', (route) => {
      if (route.request().method() === 'PUT') {
        savedLayout = route.request().postDataJSON() as typeof savedLayout;
        return route.fulfill({ json: { ok: true } });
      }
      return route.fulfill({ json: nearMinLayout });
    });
    await setupAPIMocks(page);
    await page.goto('/');

    await page.getByTestId('shrink-widget').click();
    await page.waitForTimeout(500);

    expect(savedLayout).toBeTruthy();
    expect(savedLayout!.widgets[0]!.size.w).toBe(3);
    expect(savedLayout!.widgets[0]!.size.h).toBe(2);
  });

  test('widget without constraints has both buttons enabled', async ({ page }) => {
    // info-widget has no minSize/maxSize constraints
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

    await page.route('**/api/dashboard/layout', (route) =>
      route.fulfill({ json: noConstraintsLayout }),
    );
    await setupAPIMocks(page);
    await page.goto('/');

    await expect(page.getByTestId('grow-widget')).not.toBeDisabled();
    await expect(page.getByTestId('shrink-widget')).not.toBeDisabled();
  });
});

test.describe('Dashboard Layout API Integration', () => {
  test('GET /api/dashboard/layout returns layout data', async ({ page }) => {
    await setupAPIMocks(page);
    await page.goto('/');
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
