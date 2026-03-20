import { test, expect } from '@playwright/test';
import { setupAPIMocks } from './helpers';

/**
 * Mock auth status to simulate LAN mode requiring PIN authentication.
 * Must be called BEFORE setupAPIMocks (so its /api/auth/* routes take priority).
 */
async function setupLanAuthMocks(
  page: Parameters<typeof setupAPIMocks>[0],
  opts: { authenticated: boolean },
): Promise<void> {
  await page.route('**/api/auth/status', (route) =>
    route.fulfill({ json: { lanMode: true, authenticated: opts.authenticated } }),
  );

  await page.route('**/api/auth/pin', async (route) => {
    const body = route.request().postDataJSON() as { pin?: string } | null;
    if (body?.pin === '1234') {
      return route.fulfill({ json: { ok: true } });
    }
    return route.fulfill({ status: 401, json: { error: 'Invalid PIN' } });
  });
}

/**
 * Mock auth status to simulate non-LAN mode (no auth required).
 */
async function setupNoLanMocks(page: Parameters<typeof setupAPIMocks>[0]): Promise<void> {
  // Simulate /api/auth/status not existing (server without LAN mode)
  await page.route('**/api/auth/status', (route) =>
    route.fulfill({ status: 404, json: { message: 'Not Found' } }),
  );
}

test.describe('LAN Auth — PIN Prompt', () => {
  test('shows PIN prompt when LAN mode is active and not authenticated', async ({ page }) => {
    await setupLanAuthMocks(page, { authenticated: false });
    await setupAPIMocks(page);
    await page.goto('/');

    // PIN prompt should be visible (CardTitle renders as <div>, not a heading)
    await expect(page.getByText('RenreKit Dashboard')).toBeVisible();
    await expect(
      page.getByText('Enter the PIN displayed in your terminal to access the dashboard.'),
    ).toBeVisible();
    await expect(page.getByLabel('PIN')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();

    // Dashboard should NOT be visible
    await expect(page.getByRole('heading', { name: 'Dashboard' })).not.toBeVisible();
  });

  test('shows dashboard directly when not in LAN mode', async ({ page }) => {
    await setupNoLanMocks(page);
    await setupAPIMocks(page);
    await page.goto('/');

    // Dashboard should load without PIN prompt
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByLabel('PIN')).not.toBeVisible();
  });

  test('shows dashboard directly when LAN mode is active but already authenticated', async ({
    page,
  }) => {
    await setupLanAuthMocks(page, { authenticated: true });
    await setupAPIMocks(page);
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByLabel('PIN')).not.toBeVisible();
  });

  test('submitting correct PIN shows the dashboard', async ({ page }) => {
    await setupLanAuthMocks(page, { authenticated: false });
    await setupAPIMocks(page);
    await page.goto('/');

    // Fill in the correct PIN
    await page.getByLabel('PIN').fill('1234');
    await page.getByRole('button', { name: 'Submit' }).click();

    // Dashboard should appear after successful PIN entry
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByLabel('PIN')).not.toBeVisible();
  });

  test('submitting wrong PIN shows error and stays on prompt', async ({ page }) => {
    await setupLanAuthMocks(page, { authenticated: false });
    await setupAPIMocks(page);
    await page.goto('/');

    // Fill in an incorrect PIN
    await page.getByLabel('PIN').fill('0000');
    await page.getByRole('button', { name: 'Submit' }).click();

    // Should show error message
    await expect(page.getByText('Invalid PIN. Please try again.')).toBeVisible();

    // PIN prompt should still be visible
    await expect(page.getByLabel('PIN')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).not.toBeVisible();
  });

  test('PIN input only accepts numeric characters', async ({ page }) => {
    await setupLanAuthMocks(page, { authenticated: false });
    await setupAPIMocks(page);
    await page.goto('/');

    const pinInput = page.getByLabel('PIN');
    await pinInput.fill('abcd');
    await expect(pinInput).toHaveValue('');

    await pinInput.fill('12ab34');
    // The input filter strips non-digits — type character by character to trigger onChange
    await pinInput.clear();
    await pinInput.pressSequentially('12ab34');
    await expect(pinInput).toHaveValue('1234');
  });

  test('submit button is disabled when PIN is less than 4 digits', async ({ page }) => {
    await setupLanAuthMocks(page, { authenticated: false });
    await setupAPIMocks(page);
    await page.goto('/');

    const submitButton = page.getByRole('button', { name: 'Submit' });

    // Initially disabled (empty)
    await expect(submitButton).toBeDisabled();

    // Still disabled with partial PIN
    await page.getByLabel('PIN').pressSequentially('12');
    await expect(submitButton).toBeDisabled();

    // Enabled with full 4-digit PIN
    await page.getByLabel('PIN').pressSequentially('34');
    await expect(submitButton).toBeEnabled();
  });

  test('can recover from wrong PIN and enter correct PIN', async ({ page }) => {
    await setupLanAuthMocks(page, { authenticated: false });
    await setupAPIMocks(page);
    await page.goto('/');

    // First attempt: wrong PIN
    await page.getByLabel('PIN').fill('9999');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText('Invalid PIN. Please try again.')).toBeVisible();

    // Second attempt: correct PIN
    await page.getByLabel('PIN').fill('1234');
    await page.getByRole('button', { name: 'Submit' }).click();

    // Dashboard should load
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('mid-session auth expiry shows PIN prompt again', async ({ page }) => {
    await setupLanAuthMocks(page, { authenticated: true });
    await setupAPIMocks(page);
    await page.goto('/');

    // Dashboard should be visible initially
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Simulate session expiry: next API call returns 401
    await page.route('**/api/projects', (route) =>
      route.fulfill({ status: 401, json: { error: 'PIN required' } }),
    );

    // Trigger an API call that will get 401 (navigate to force refetch)
    await page.goto('/marketplace');

    // PIN prompt should reappear (CardTitle renders as <div>, not a heading)
    await expect(page.getByText('RenreKit Dashboard')).toBeVisible();
    await expect(page.getByLabel('PIN')).toBeVisible();
  });
});
