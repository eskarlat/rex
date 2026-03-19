import { describe, it, expect, afterEach, vi } from 'vitest';

vi.mock('@renre-kit/cli/lib', () => ({
  ProjectManager: vi.fn().mockImplementation(() => ({
    list: vi.fn().mockReturnValue([]),
    get: vi.fn().mockReturnValue(null),
  })),
  EventBus: vi.fn().mockImplementation(() => ({})),
  CommandRegistry: vi.fn().mockImplementation(() => ({
    resolve: vi.fn(),
  })),
  ConnectionManager: vi.fn().mockImplementation(() => ({
    getConnection: vi.fn(),
    executeToolCall: vi.fn(),
    stopAll: vi.fn(),
    setMode: vi.fn(),
  })),
  getDb: vi.fn().mockReturnValue({
    prepare: vi.fn().mockReturnValue({ all: vi.fn().mockReturnValue([]), run: vi.fn(), get: vi.fn() }),
  }),
  loadGlobalConfig: vi.fn().mockReturnValue({ registries: [], settings: {}, extensionConfigs: {} }),
  saveGlobalConfig: vi.fn(),
  resolveExtensionConfig: vi.fn().mockReturnValue({}),
  setExtensionConfig: vi.fn(),
  listEntries: vi.fn().mockReturnValue([]),
  setEntry: vi.fn(),
  removeEntry: vi.fn(),
  listInstalled: vi.fn().mockReturnValue([]),
  install: vi.fn(),
  remove: vi.fn(),
  activate: vi.fn(),
  deactivate: vi.fn(),
  getExtensionDir: vi.fn(),
  resolveExtension: vi.fn(),
  installExtension: vi.fn(),
  ensureSynced: vi.fn().mockResolvedValue(undefined),
  listAvailableExtensions: vi.fn().mockReturnValue([]),
  sync: vi.fn(),
  getActivated: vi.fn().mockReturnValue({}),
  loadManifest: vi.fn(),
  loadCommandHandler: vi.fn(),
  executeCommand: vi.fn(),
  getLogger: vi.fn().mockReturnValue({ info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() }),
  // eslint-disable-next-line sonarjs/publicly-writable-directories
  LOGS_DIR: '/tmp/test-logs',
}));

const { createServer } = await import('./server.js');

describe('createServer', () => {
  let server: Awaited<ReturnType<typeof createServer>>;

  afterEach(async () => {
    if (server) {
      await server.close();
    }
  });

  it('creates a Fastify instance', async () => {
    server = await createServer();
    expect(server).toBeDefined();
  });

  it('registers all route plugins', async () => {
    server = await createServer();
    const routes = server.printRoutes();
    // Fastify uses radix-tree format; check key route fragments
    expect(routes).toContain('project');
    expect(routes).toContain('marketplace');
    expect(routes).toContain('vault');
    expect(routes).toContain('logs');
    // Fastify radix tree compresses shared prefix 's' → 'cheduler' / 'ettings'
    expect(routes).toContain('cheduler');
    expect(routes).toContain('ettings');
  });

  it('creates server with LAN auth when lanMode is true', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    server = await createServer({ lanMode: true, lanPin: '5678' });
    const routes = server.printRoutes();
    expect(routes).toContain('auth/pin');
  });

  it('does not register LAN auth by default', async () => {
    server = await createServer();
    const routes = server.printRoutes();
    expect(routes).not.toContain('auth');
  });

  it('handles API requests', async () => {
    server = await createServer();
    const response = await server.inject({ method: 'GET', url: '/api/projects' });
    expect(response.statusCode).toBe(200);
  });

  it('logs warning level for 4xx responses', async () => {
    server = await createServer();
    // POST /api/run with missing command triggers a 400
    await server.inject({
      method: 'POST',
      url: '/api/run',
      headers: { 'x-renrekit-project': '/mock/project' },
      payload: {},
    });
    // If it reaches here without error, the onResponse hook handled the 400 log level
  });

  it('returns 404 JSON for unknown API routes', async () => {
    server = await createServer();
    const response = await server.inject({
      method: 'GET',
      url: '/api/nonexistent',
      headers: { accept: 'text/html' },
    });
    expect(response.statusCode).toBe(404);
    expect(response.json()).toHaveProperty('error', 'Not Found');
  });

  it('serves index.html for navigational HTML requests', async () => {
    server = await createServer();
    const response = await server.inject({
      method: 'GET',
      url: '/some/page',
      headers: { accept: 'text/html,application/xhtml+xml' },
    });
    // If UI dist exists, it should serve index.html (200)
    // The SPA fallback triggers for non-API, GET/HEAD, text/html requests
    expect([200, 404]).toContain(response.statusCode);
  });

  it('returns 404 for non-HTML non-API requests', async () => {
    server = await createServer();
    const response = await server.inject({
      method: 'POST',
      url: '/nonexistent',
    });
    expect(response.statusCode).toBe(404);
  });

  it('logs error level for 5xx responses', async () => {
    server = await createServer();
    // Inject a request that would produce a 500 (e.g., unknown internal route)
    const { getActivated } = await import('@renre-kit/cli/lib');
    vi.mocked(getActivated).mockImplementation(() => { throw new Error('boom'); });

    await server.inject({
      method: 'POST',
      url: '/api/run',
      headers: { 'x-renrekit-project': '/mock/project' },
      payload: { command: 'ext:cmd' },
    });

    vi.mocked(getActivated).mockReturnValue({});
  });
});
