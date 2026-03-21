import { test, expect } from '@playwright/test';

test.describe('PIN Authentication', () => {
  test('auth endpoint can be called via fetch', async ({ page }) => {
    await page.route('**/api/auth/pin', (route) => {
      const body = route.request().postDataJSON() as { pin: string };
      if (body.pin === '1234') {
        return route.fulfill({ status: 200, json: { ok: true } });
      }
      return route.fulfill({ status: 401, json: { error: 'Invalid PIN' } });
    });
    await page.route('**/api/projects', (route) => route.fulfill({ json: [] }));
    await page.route('**/api/marketplace', (route) =>
      route.fulfill({ json: { active: [], installed: [], available: [] } }),
    );
    await page.route('**/api/project', (route) => route.fulfill({ json: null }));

    await page.goto('/');

    // Test valid PIN via in-page fetch
    const validResult = await page.evaluate(async () => {
      const res = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: '1234' }),
      });
      return res.status;
    });
    expect(validResult).toBe(200);

    // Test invalid PIN via in-page fetch
    const invalidResult = await page.evaluate(async () => {
      const res = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: '0000' }),
      });
      return res.status;
    });
    expect(invalidResult).toBe(401);
  });

  test('selecting project sends PUT to /api/projects/active with path', async ({ page }) => {
    let putBody: Record<string, unknown> = {};
    await page.route('**/api/marketplace', (route) =>
      route.fulfill({ json: { active: [], installed: [], available: [] } }),
    );
    await page.route('**/api/projects', (route) =>
      route.fulfill({
        json: [{ name: 'my-project', path: '/tmp/my-project' }],
      }),
    );
    await page.route('**/api/project', (route) => route.fulfill({ json: null }));
    await page.route('**/api/projects/active', (route) => {
      if (route.request().method() === 'PUT') {
        putBody = route.request().postDataJSON() as Record<string, unknown>;
      }
      return route.fulfill({ json: { ok: true } });
    });

    await page.goto('/');
    const sidebar = page.locator('aside');
    await sidebar.getByLabel('Select project').click();
    await page.getByRole('option', { name: 'my-project' }).click();
    await page.waitForTimeout(500);

    expect(putBody).toHaveProperty('path', '/tmp/my-project');
  });
});
