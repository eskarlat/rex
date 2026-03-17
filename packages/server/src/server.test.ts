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
  sync: vi.fn(),
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
});
