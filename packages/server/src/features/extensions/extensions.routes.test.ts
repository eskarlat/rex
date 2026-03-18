import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import projectScope from '../../core/middleware/project-scope.js';

const mockInstall = vi.fn();
const mockRemove = vi.fn();
const mockListInstalled = vi.fn();
const mockActivate = vi.fn();
const mockDeactivate = vi.fn();
const mockGetActivated = vi.fn();
const mockGetDb = vi.fn();
const mockLoadGlobalConfig = vi.fn();
const mockResolveExtension = vi.fn();
const mockListAvailableExtensions = vi.fn();
const mockEnsureSynced = vi.fn();
const mockInstallExtension = vi.fn();
const mockGetExtensionDir = vi.fn();
const mockDb = {};

vi.mock('@renre-kit/cli/lib', () => ({
  install: (...args: unknown[]) => mockInstall(...args),
  remove: (...args: unknown[]) => mockRemove(...args),
  listInstalled: (...args: unknown[]) => mockListInstalled(...args),
  activate: (...args: unknown[]) => mockActivate(...args),
  deactivate: (...args: unknown[]) => mockDeactivate(...args),
  getActivated: (...args: unknown[]) => mockGetActivated(...args),
  getDb: () => mockGetDb(),
  EventBus: vi.fn().mockImplementation(() => ({})),
  loadGlobalConfig: () => mockLoadGlobalConfig(),
  resolveExtension: (...args: unknown[]) => mockResolveExtension(...args),
  listAvailableExtensions: (...args: unknown[]) => mockListAvailableExtensions(...args),
  ensureSynced: (...args: unknown[]) => mockEnsureSynced(...args),
  installExtension: (...args: unknown[]) => mockInstallExtension(...args),
  getExtensionDir: (...args: unknown[]) => mockGetExtensionDir(...args),
}));

const { default: extensionsRoutes } = await import('./extensions.routes.js');

describe('extensions routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockGetDb.mockReturnValue(mockDb);
    app = Fastify();
    await app.register(projectScope);
    await app.register(extensionsRoutes);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/marketplace', () => {
    it('returns active, installed, and available arrays', async () => {
      mockListInstalled.mockReturnValue([
        { name: 'ext1', version: '1.0.0', type: 'standard' },
        { name: 'ext2', version: '2.0.0', type: 'mcp-stdio' },
      ]);
      mockGetActivated.mockReturnValue({ ext1: '1.0.0' });
      mockLoadGlobalConfig.mockReturnValue({ registries: [] });
      mockListAvailableExtensions.mockReturnValue([]);

      const response = await app.inject({
        method: 'GET',
        url: '/api/marketplace',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.active).toHaveLength(1);
      expect(body.active[0].name).toBe('ext1');
      expect(body.installed).toHaveLength(1);
      expect(body.installed[0].name).toBe('ext2');
      expect(body.available).toEqual([]);
    });

    it('returns all as installed when no project context', async () => {
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '1.0.0', type: 'standard' }]);
      mockLoadGlobalConfig.mockReturnValue({ registries: [] });
      mockListAvailableExtensions.mockReturnValue([]);

      const response = await app.inject({ method: 'GET', url: '/api/marketplace' });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.active).toHaveLength(0);
      expect(body.installed).toHaveLength(1);
    });

    it('returns available extensions from registries excluding installed', async () => {
      mockListInstalled.mockReturnValue([
        { name: 'ext1', version: '1.0.0', type: 'standard' },
      ]);
      mockGetActivated.mockReturnValue({});
      mockLoadGlobalConfig.mockReturnValue({ registries: [{ name: 'default', url: 'https://example.com', priority: 0, cacheTTL: 3600 }] });
      mockListAvailableExtensions.mockReturnValue([
        { name: 'ext1', description: 'Already installed', gitUrl: 'https://example.com/ext1.git', latestVersion: '1.0.0', type: 'standard', icon: 'box', author: 'test' },
        { name: 'ext3', description: 'New extension', gitUrl: 'https://example.com/ext3.git', latestVersion: '2.0.0', type: 'mcp', icon: 'star', author: 'author1' },
      ]);

      const response = await app.inject({
        method: 'GET',
        url: '/api/marketplace',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.available).toHaveLength(1);
      expect(body.available[0]).toEqual({
        name: 'ext3',
        description: 'New extension',
        version: '2.0.0',
        type: 'mcp',
        author: 'author1',
        icon: 'star',
        status: 'available',
      });
    });
  });

  describe('POST /api/extensions/install', () => {
    it('installs an extension from registry', async () => {
      mockLoadGlobalConfig.mockReturnValue({ registries: [] });
      mockResolveExtension.mockReturnValue({
        name: 'ext1',
        gitUrl: 'https://github.com/test/ext1.git',
        latestVersion: '1.0.0',
        type: 'standard',
        registryName: 'default',
      });
      mockInstallExtension.mockResolvedValue('/path/to/ext1@1.0.0');

      const response = await app.inject({
        method: 'POST',
        url: '/api/extensions/install',
        payload: { name: 'ext1' },
      });
      expect(response.statusCode).toBe(201);
      expect(response.json().name).toBe('ext1');
    });

    it('returns 404 when extension not in registries', async () => {
      mockLoadGlobalConfig.mockReturnValue({ registries: [] });
      mockResolveExtension.mockReturnValue(null);

      const response = await app.inject({
        method: 'POST',
        url: '/api/extensions/install',
        payload: { name: 'nonexistent' },
      });
      expect(response.statusCode).toBe(404);
    });

    it('returns 400 when name is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/extensions/install',
        payload: {},
      });
      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/extensions/activate', () => {
    it('activates an extension', async () => {
      mockGetExtensionDir.mockReturnValue('/path/to/ext1@1.0.0');
      mockActivate.mockResolvedValue([]);

      const response = await app.inject({
        method: 'POST',
        url: '/api/extensions/activate',
        payload: { name: 'ext1', version: '1.0.0', projectPath: '/my/project' },
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ ok: true, missingKeys: [] });
    });

    it('returns 400 when projectPath is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/extensions/activate',
        payload: { name: 'ext1', version: '1.0.0' },
      });
      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/extensions/deactivate', () => {
    it('deactivates an extension', async () => {
      mockGetExtensionDir.mockReturnValue('/path/to/ext1@');
      mockDeactivate.mockResolvedValue(undefined);

      const response = await app.inject({
        method: 'POST',
        url: '/api/extensions/deactivate',
        payload: { name: 'ext1', projectPath: '/my/project' },
      });
      expect(response.statusCode).toBe(200);
    });

    it('returns 400 when projectPath is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/extensions/deactivate',
        payload: { name: 'ext1' },
      });
      expect(response.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/extensions/:name', () => {
    it('removes an installed extension', async () => {
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '1.0.0' }]);

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/extensions/ext1',
      });
      expect(response.statusCode).toBe(200);
      expect(mockRemove).toHaveBeenCalledWith('ext1', '1.0.0', mockDb);
    });

    it('returns 404 when extension not installed', async () => {
      mockListInstalled.mockReturnValue([]);

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/extensions/nonexistent',
      });
      expect(response.statusCode).toBe(404);
    });
  });
});
