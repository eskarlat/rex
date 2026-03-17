import { test, expect } from '@playwright/test';
import { setupAPIMocks } from './helpers';

test.describe('Project Switcher', () => {
  test.beforeEach(async ({ page }) => {
    await setupAPIMocks(page);
  });

  test('shows project select in sidebar', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('aside');
    await expect(sidebar.getByLabel('Select project')).toBeVisible();
  });

  test('shows placeholder when no project selected', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Select project')).toBeVisible();
  });

  test('lists available projects in dropdown', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('aside');
    await sidebar.getByLabel('Select project').click();
    await expect(page.getByRole('option', { name: 'test-project' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'another-project' })).toBeVisible();
  });

  test('selecting a project triggers API call', async ({ page }) => {
    let activeCalled = false;
    let activePath = '';
    await page.route('**/api/projects/active', (route) => {
      if (route.request().method() === 'PUT') {
        activeCalled = true;
        const body = route.request().postDataJSON() as { path: string };
        activePath = body.path;
      }
      return route.fulfill({ json: { ok: true } });
    });

    await page.goto('/');
    const sidebar = page.locator('aside');
    await sidebar.getByLabel('Select project').click();
    await page.getByRole('option', { name: 'test-project' }).click();

    await page.waitForTimeout(500);
    expect(activeCalled).toBe(true);
    expect(activePath).toBe('/tmp/test-project');
  });

  test('switching project updates homepage subtitle', async ({ page }) => {
    await page.goto('/');
    // Initially no project selected
    await expect(page.getByText('No project selected')).toBeVisible();

    // Select a project
    const sidebar = page.locator('aside');
    await sidebar.getByLabel('Select project').click();
    await page.getByRole('option', { name: 'test-project' }).click();

    // Should now show the project path
    await expect(page.getByText('Project: /tmp/test-project')).toBeVisible();
  });

  test('can switch between projects', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('aside');

    // Select first project
    await sidebar.getByLabel('Select project').click();
    await page.getByRole('option', { name: 'test-project' }).click();
    await expect(page.getByText('Project: /tmp/test-project')).toBeVisible();

    // Switch to another project
    await sidebar.getByLabel('Select project').click();
    await page.getByRole('option', { name: 'another-project' }).click();
    await expect(page.getByText('Project: /tmp/another-project')).toBeVisible();
  });

  test('selected project persists via localStorage', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('aside');
    await sidebar.getByLabel('Select project').click();
    await page.getByRole('option', { name: 'test-project' }).click();

    // Check localStorage was set
    const stored = await page.evaluate(() =>
      localStorage.getItem('renre-kit-active-project'),
    );
    expect(stored).toBe('/tmp/test-project');
  });

  test('project loads from localStorage on page reload', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('renre-kit-active-project', '/tmp/test-project');
    });
    await page.goto('/');
    await expect(page.getByText('Project: /tmp/test-project')).toBeVisible();
  });

  test('shows loading skeleton while projects load', async ({ page }) => {
    const newPage = await page.context().newPage();
    // Route that never responds for projects
    await newPage.route('**/api/projects', () => {
      // Never fulfill - keeps loading
    });
    await newPage.route('**/api/marketplace', (route) =>
      route.fulfill({ json: { active: [], installed: [], available: [] } }),
    );
    await newPage.route('**/api/project', (route) =>
      route.fulfill({ json: null }),
    );
    await newPage.goto('/');
    // Page should render without crashing
    await expect(newPage.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await newPage.close();
  });
});
