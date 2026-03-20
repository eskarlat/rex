import { test, expect } from '@playwright/test';
import { setupAPIMocks } from './helpers';

/** The toolbar toggle button for the terminal */
function toolbarTerminalButton(page: import('@playwright/test').Page) {
  // The toolbar button has visible "Terminal" text inside it
  return page.locator('button').filter({ hasText: 'Terminal' }).first();
}

/** The close (X) button inside the drawer header */
function drawerCloseButton(page: import('@playwright/test').Page) {
  // The drawer close button is inside a div with border-b (header bar),
  // distinct from the toolbar button
  return page.locator('[aria-label="Close terminal"]').last();
}

/** The resize handle on the left edge of the drawer */
function resizeHandle(page: import('@playwright/test').Page) {
  return page.getByRole('separator', { name: 'Resize terminal' });
}

test.describe('Terminal Panel', () => {
  test.beforeEach(async ({ page }) => {
    await setupAPIMocks(page);
    await page.goto('/');
  });

  test('toolbar shows Terminal button', async ({ page }) => {
    await expect(toolbarTerminalButton(page)).toBeVisible();
  });

  test('terminal panel is hidden by default', async ({ page }) => {
    // Resize handle should not be visible
    await expect(resizeHandle(page)).not.toBeVisible();
  });

  test('clicking Terminal button opens the panel', async ({ page }) => {
    await toolbarTerminalButton(page).click();

    // Resize handle and close button should appear
    await expect(resizeHandle(page)).toBeVisible();
    await expect(drawerCloseButton(page)).toBeVisible();
  });

  test('clicking Terminal button again closes the panel', async ({ page }) => {
    // Open
    await toolbarTerminalButton(page).click();
    await expect(resizeHandle(page)).toBeVisible();

    // Close via toolbar toggle
    await toolbarTerminalButton(page).click();
    await expect(resizeHandle(page)).not.toBeVisible();
  });

  test('close button on drawer header closes the panel', async ({ page }) => {
    await toolbarTerminalButton(page).click();
    await expect(resizeHandle(page)).toBeVisible();

    // Click the X button in the drawer header
    await drawerCloseButton(page).click();
    await expect(resizeHandle(page)).not.toBeVisible();
  });

  test('toolbar button changes aria-label when terminal is open', async ({ page }) => {
    const btn = toolbarTerminalButton(page);

    // Before opening
    await expect(btn).toHaveAttribute('aria-label', 'Open terminal');

    // Open terminal
    await btn.click();

    // After opening — aria-label changes
    await expect(btn).toHaveAttribute('aria-label', 'Close terminal');
  });

  test('terminal panel persists across page navigation', async ({ page }) => {
    // Open terminal
    await toolbarTerminalButton(page).click();
    await expect(resizeHandle(page)).toBeVisible();

    // Navigate to another page
    const sidebar = page.locator('aside');
    await sidebar.getByRole('link', { name: 'Scheduler', exact: true }).click();
    await expect(page).toHaveURL(/\/scheduler/);

    // Terminal should still be open
    await expect(resizeHandle(page)).toBeVisible();
    await expect(drawerCloseButton(page)).toBeVisible();
  });

  test('terminal panel can be resized by dragging the handle', async ({ page }) => {
    await toolbarTerminalButton(page).click();

    const handle = resizeHandle(page);
    await expect(handle).toBeVisible();

    // Get the drawer element (parent of the handle)
    const drawer = handle.locator('..');
    const initialBox = await drawer.boundingBox();
    expect(initialBox).toBeTruthy();
    const initialWidth = initialBox!.width;

    // Drag the handle left to make the panel wider
    const handleBox = await handle.boundingBox();
    expect(handleBox).toBeTruthy();

    await page.mouse.move(
      handleBox!.x + handleBox!.width / 2,
      handleBox!.y + handleBox!.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(handleBox!.x - 100, handleBox!.y + handleBox!.height / 2, {
      steps: 5,
    });
    await page.mouse.up();

    const finalBox = await drawer.boundingBox();
    expect(finalBox).toBeTruthy();
    expect(finalBox!.width).toBeGreaterThan(initialWidth);
  });

  test('terminal panel renders xterm container', async ({ page }) => {
    await toolbarTerminalButton(page).click();

    // xterm.js creates a div with class "xterm" inside the container
    const xtermContainer = page.locator('.xterm');
    await expect(xtermContainer).toBeVisible({ timeout: 5000 });
  });

  test('terminal button is next to Marketplace link', async ({ page }) => {
    const marketplaceLink = page.getByRole('link', { name: 'Marketplace' });
    const terminalButton = toolbarTerminalButton(page);

    const marketplaceBox = await marketplaceLink.boundingBox();
    const terminalBox = await terminalButton.boundingBox();

    expect(marketplaceBox).toBeTruthy();
    expect(terminalBox).toBeTruthy();

    // They should be on the same row (similar Y position)
    expect(Math.abs(marketplaceBox!.y - terminalBox!.y)).toBeLessThan(10);
    // Terminal button should be to the right of Marketplace
    expect(terminalBox!.x).toBeGreaterThan(marketplaceBox!.x);
  });

  test('terminal panel has non-zero width on open', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await toolbarTerminalButton(page).click();

    const handle = resizeHandle(page);
    const drawer = handle.locator('..');
    const box = await drawer.boundingBox();

    expect(box).toBeTruthy();
    // Panel should have substantial width (default 480px, may flex)
    expect(box!.width).toBeGreaterThan(200);
  });
});
