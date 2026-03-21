import type { Page } from '@playwright/test';

/** Standard mock data used across E2E tests */
export const mockProjects = [
  { name: 'test-project', path: '/tmp/test-project' },
  { name: 'another-project', path: '/tmp/another-project' },
];

export const mockActiveProject = {
  name: 'test-project',
  path: '/tmp/test-project',
  manifest: { name: 'test-project', version: '1.0.0' },
};

export const mockMarketplace = {
  active: [
    {
      name: 'hello-world',
      version: '1.0.0',
      type: 'standard',
      description: 'A sample extension',
      status: 'active',
      author: 'test-author',
      tags: ['demo', 'sample'],
      widgets: [
        {
          id: 'status-widget',
          title: 'Hello Status',
          defaultSize: { w: 4, h: 2 },
          minSize: { w: 3, h: 2 },
          maxSize: { w: 6, h: 4 },
        },
        {
          id: 'info-widget',
          title: 'Hello Info',
          defaultSize: { w: 3, h: 2 },
        },
      ],
    },
  ],
  installed: [
    {
      name: 'weather-mcp',
      version: '0.1.0',
      type: 'mcp-stdio',
      description: 'Weather MCP server',
      status: 'installed',
      author: 'renre',
      tags: ['mcp'],
    },
  ],
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
};

export const mockVaultEntries = [
  {
    key: 'API_KEY',
    tags: ['api', 'secret'],
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    key: 'DB_PASSWORD',
    tags: ['database'],
    created_at: '2026-01-20T08:00:00Z',
    updated_at: '2026-02-01T08:30:00Z',
  },
];

export const mockScheduledTasks = [
  {
    id: 1,
    name: 'Daily Sync',
    extension_name: 'hello-world',
    command: 'sync',
    cron: '0 0 * * *',
    enabled: true,
    last_run: '2026-03-16T00:00:00Z',
    next_run: '2026-03-17T00:00:00Z',
  },
  {
    id: 2,
    name: 'Hourly Check',
    extension_name: 'weather-mcp',
    command: 'check',
    cron: '0 * * * *',
    enabled: false,
    last_run: null,
    next_run: null,
  },
];

export const mockSettings = {
  port: 4200,
  theme: 'light',
  logLevel: 'info',
};

export const mockRegistries = [
  {
    name: 'official',
    url: 'https://registry.renre-kit.dev',
    priority: 1,
    last_synced: '2026-03-16T12:00:00Z',
  },
  {
    name: 'community',
    url: 'https://community.renre-kit.dev',
    priority: 2,
    last_synced: '2026-03-15T06:00:00Z',
  },
];

export const mockTaskHistory = [
  {
    id: 1,
    task_id: 1,
    started_at: '2026-03-16T00:00:00Z',
    finished_at: '2026-03-16T00:00:05Z',
    duration_ms: 5000,
    status: 'success',
    output: 'Sync completed successfully',
  },
  {
    id: 2,
    task_id: 1,
    started_at: '2026-03-15T00:00:00Z',
    finished_at: '2026-03-15T00:00:10Z',
    duration_ms: 10000,
    status: 'failure',
    error: 'Connection timeout',
  },
];

export const mockDashboardLayout = {
  widgets: [
    {
      id: 'hello-world:status-widget',
      extensionName: 'hello-world',
      widgetId: 'status-widget',
      position: { x: 0, y: 0 },
      size: { w: 4, h: 2 },
    },
  ],
};

export const mockEmptyDashboardLayout = {
  widgets: [],
};

/**
 * Set up all common API route mocks for a page.
 * Call this before navigating to any page.
 */
export async function setupAPIMocks(page: Page): Promise<void> {
  await page.route('**/api/projects', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: mockProjects });
    }
    return route.fulfill({ status: 200, json: { ok: true } });
  });

  await page.route('**/api/project', (route) => route.fulfill({ json: mockActiveProject }));

  await page.route('**/api/projects/active', (route) => route.fulfill({ json: { ok: true } }));

  await page.route('**/api/marketplace', (route) => route.fulfill({ json: mockMarketplace }));

  await page.route('**/api/extensions/install', (route) => route.fulfill({ json: { ok: true } }));

  await page.route('**/api/extensions/activate', (route) => route.fulfill({ json: { ok: true } }));

  await page.route('**/api/extensions/deactivate', (route) =>
    route.fulfill({ json: { ok: true } }),
  );

  await page.route('**/api/vault', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: mockVaultEntries });
    }
    return route.fulfill({ json: { ok: true } });
  });

  await page.route('**/api/vault/*', (route) => route.fulfill({ json: { ok: true } }));

  await page.route('**/api/scheduler', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: mockScheduledTasks });
    }
    return route.fulfill({ json: { ok: true } });
  });

  await page.route('**/api/scheduler/*/history', (route) =>
    route.fulfill({ json: mockTaskHistory }),
  );

  await page.route('**/api/scheduler/*/trigger', (route) => route.fulfill({ json: { ok: true } }));

  // Catch-all for scheduler task operations (PUT, DELETE on /api/scheduler/:id)
  // Must be registered AFTER more specific routes above
  await page.route(/\/api\/scheduler\/\d+$/, (route) => route.fulfill({ json: { ok: true } }));

  await page.route('**/api/settings', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: mockSettings });
    }
    return route.fulfill({ json: { ok: true } });
  });

  await page.route('**/api/registries', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: mockRegistries });
    }
    return route.fulfill({ json: { ok: true } });
  });

  await page.route('**/api/registries/*', (route) => route.fulfill({ json: { ok: true } }));

  await page.route('**/api/dashboard/layout', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: mockDashboardLayout });
    }
    return route.fulfill({ json: { ok: true } });
  });

  await page.route('**/api/settings/extensions/*', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        json: {
          schema: {
            apiKey: { type: 'string', description: 'API Key' },
            maxRetries: { type: 'number', description: 'Max retries' },
            verbose: { type: 'boolean', description: 'Verbose logging' },
          },
          values: { apiKey: 'test-key', maxRetries: 3, verbose: false },
        },
      });
    }
    return route.fulfill({ json: { ok: true } });
  });
}
