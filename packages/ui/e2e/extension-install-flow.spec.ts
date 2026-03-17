import { test, expect } from '@playwright/test';

test.describe('Extension Install → Accessible in UI', () => {
  test('install extension from available → appears in installed tab', async ({ page }) => {
    const installedExtension = {
      name: 'new-ext',
      version: '2.0.0',
      type: 'standard',
      description: 'Available extension',
      status: 'installed',
      author: 'community',
      tags: ['utils'],
    };

    let installCalled = false;

    // Initial state: new-ext is available
    await page.route('**/api/marketplace', (route) => {
      if (installCalled) {
        // After install, move it to installed list
        return route.fulfill({
          json: {
            active: [],
            installed: [installedExtension],
            available: [],
          },
        });
      }
      return route.fulfill({
        json: {
          active: [],
          installed: [],
          available: [
            {
              name: 'new-ext',
              version: '2.0.0',
              type: 'standard',
              description: 'Available extension',
              status: 'available',
              author: 'community',
              tags: ['utils'],
            },
          ],
        },
      });
    });

    await page.route('**/api/extensions/install', (route) => {
      installCalled = true;
      return route.fulfill({ json: { ok: true } });
    });

    await page.route('**/api/projects', (route) =>
      route.fulfill({ json: [] }),
    );
    await page.route('**/api/project', (route) =>
      route.fulfill({ json: null }),
    );

    await page.goto('/marketplace');

    // See it in Available tab
    await page.getByRole('tab', { name: /available/i }).click();
    await expect(page.getByText('new-ext')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Install' })).toBeVisible();

    // Install it
    await page.getByRole('button', { name: 'Install' }).click();
    await page.waitForTimeout(500);

    // After install + refetch, check installed tab
    await page.getByRole('tab', { name: /installed/i }).click();
    await expect(page.getByText('new-ext')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Activate' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Remove' })).toBeVisible();
  });

  test('activate installed extension → appears in active tab', async ({ page }) => {
    const activeExtension = {
      name: 'hello-world',
      version: '1.0.0',
      type: 'standard',
      description: 'A sample extension',
      status: 'active',
      author: 'test-author',
      tags: ['demo'],
    };

    let activateCalled = false;

    await page.route('**/api/marketplace', (route) => {
      if (activateCalled) {
        return route.fulfill({
          json: {
            active: [activeExtension],
            installed: [],
            available: [],
          },
        });
      }
      return route.fulfill({
        json: {
          active: [],
          installed: [
            {
              name: 'hello-world',
              version: '1.0.0',
              type: 'standard',
              description: 'A sample extension',
              status: 'installed',
              author: 'test-author',
              tags: ['demo'],
            },
          ],
          available: [],
        },
      });
    });

    await page.route('**/api/extensions/activate', (route) => {
      activateCalled = true;
      return route.fulfill({ json: { ok: true } });
    });

    await page.route('**/api/projects', (route) =>
      route.fulfill({ json: [] }),
    );
    await page.route('**/api/project', (route) =>
      route.fulfill({ json: null }),
    );

    await page.goto('/marketplace');

    // See it in Installed tab
    await page.getByRole('tab', { name: /installed/i }).click();
    await expect(page.getByText('hello-world')).toBeVisible();

    // Activate it
    await page.getByRole('button', { name: 'Activate' }).click();
    await page.waitForTimeout(500);

    // After activate, check active tab
    await page.getByRole('tab', { name: /active/i }).click();
    await expect(page.getByText('hello-world')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Deactivate' })).toBeVisible();
  });

  test('active extension count reflects marketplace data on home page', async ({ page }) => {
    await page.route('**/api/marketplace', (route) =>
      route.fulfill({
        json: {
          active: [
            {
              name: 'ext-a',
              version: '1.0.0',
              type: 'standard',
              description: 'Active ext A',
              status: 'active',
            },
            {
              name: 'ext-b',
              version: '2.0.0',
              type: 'standard',
              description: 'Active ext B',
              status: 'active',
            },
          ],
          installed: [],
          available: [],
        },
      }),
    );

    await page.route('**/api/projects', (route) =>
      route.fulfill({
        json: [{ name: 'my-project', path: '/tmp/my-project' }],
      }),
    );
    await page.route('**/api/project', (route) =>
      route.fulfill({
        json: { name: 'my-project', path: '/tmp/my-project' },
      }),
    );

    await page.goto('/');
    await expect(page.getByText('Active Extensions')).toBeVisible();
    // Should show count of 2
    await expect(page.getByText('2')).toBeVisible();
  });

  test('installed extension shows in extension settings page', async ({ page }) => {
    await page.route('**/api/marketplace', (route) =>
      route.fulfill({
        json: {
          active: [
            {
              name: 'hello-world',
              version: '1.0.0',
              type: 'standard',
              description: 'A sample extension',
              status: 'active',
            },
          ],
          installed: [],
          available: [],
        },
      }),
    );
    await page.route('**/api/projects', (route) =>
      route.fulfill({ json: [] }),
    );
    await page.route('**/api/project', (route) =>
      route.fulfill({ json: null }),
    );
    await page.route('**/api/settings/extensions/hello-world', (route) =>
      route.fulfill({
        json: {
          schema: {
            greeting: { type: 'string', description: 'Custom greeting' },
          },
          values: { greeting: 'Hello' },
        },
      }),
    );

    // Navigate to extension settings
    await page.goto('/settings/extensions/hello-world');
    await expect(
      page.getByRole('heading', { name: 'hello-world' }),
    ).toBeVisible();
    await expect(page.getByText('Extension settings')).toBeVisible();
    await expect(page.getByText('Custom greeting')).toBeVisible();
  });

  test('extension panel page is accessible after activation', async ({ page }) => {
    await page.route('**/api/marketplace', (route) =>
      route.fulfill({
        json: {
          active: [
            {
              name: 'hello-world',
              version: '1.0.0',
              type: 'standard',
              description: 'A sample extension',
              status: 'active',
            },
          ],
          installed: [],
          available: [],
        },
      }),
    );
    await page.route('**/api/projects', (route) =>
      route.fulfill({ json: [] }),
    );
    await page.route('**/api/project', (route) =>
      route.fulfill({ json: null }),
    );

    // Navigate directly to extension panel
    await page.goto('/extensions/hello-world');
    await expect(
      page.getByRole('heading', { name: 'hello-world' }),
    ).toBeVisible();
    await expect(page.getByText('Extension panel')).toBeVisible();
  });
});
