import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import projectScope from '../../core/middleware/project-scope.js';

vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs');
  return {
    ...actual,
    existsSync: vi.fn(actual.existsSync),
    readFileSync: vi.fn(actual.readFileSync),
  };
});

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
const mockLoadManifest = vi.fn();
const mockCheckEngineCompat = vi.fn();
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
  loadManifest: (...args: unknown[]) => mockLoadManifest(...args),
  resolveExtension: (...args: unknown[]) => mockResolveExtension(...args),
  listAvailableExtensions: (...args: unknown[]) => mockListAvailableExtensions(...args),
  ensureSynced: (...args: unknown[]) => mockEnsureSynced(...args),
  installExtension: (...args: unknown[]) => mockInstallExtension(...args),
  getExtensionDir: (...args: unknown[]) => mockGetExtensionDir(...args),
  checkEngineCompat: (...args: unknown[]) => mockCheckEngineCompat(...args),
  CLI_VERSION: '0.0.1',
  SDK_VERSION: '0.0.1',
}));

const { default: extensionsRoutes } = await import('./extensions.routes.js');

describe('extensions routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockGetDb.mockReturnValue(mockDb);
    mockLoadGlobalConfig.mockReturnValue({ registries: [] });
    mockCheckEngineCompat.mockReturnValue({ compatible: true, issues: [] });
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
        tags: [],
        status: 'available',
      });
    });

    it('passes tags through for available extensions', async () => {
      mockListInstalled.mockReturnValue([]);
      mockGetActivated.mockReturnValue({});
      mockLoadGlobalConfig.mockReturnValue({ registries: [{ name: 'default', url: 'https://example.com', priority: 0, cacheTTL: 3600 }] });
      mockListAvailableExtensions.mockReturnValue([
        { name: 'tagged-ext', description: 'Has tags', gitUrl: 'https://example.com/ext.git', latestVersion: '1.0.0', type: 'standard', icon: '', author: 'test', tags: ['example', 'utility'] },
      ]);

      const response = await app.inject({
        method: 'GET',
        url: '/api/marketplace',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.available[0].tags).toEqual(['example', 'utility']);
    });

    it('returns title and panels for active extensions from manifest', async () => {
      mockListInstalled.mockReturnValue([
        { name: 'ext1', version: '1.0.0', type: 'standard' },
      ]);
      mockGetActivated.mockReturnValue({ ext1: '1.0.0' });
      mockLoadGlobalConfig.mockReturnValue({ registries: [] });
      mockListAvailableExtensions.mockReturnValue([]);
      mockGetExtensionDir.mockReturnValue('/path/to/ext1@1.0.0');
      mockLoadManifest.mockReturnValue({
        name: 'ext1',
        title: 'Extension One',
        version: '1.0.0',
        type: 'standard',
        commands: {},
        config: { schema: {} },
        ui: {
          panels: [
            { id: 'main', title: 'Main Panel', entry: 'dist/panel.js' },
            { id: 'settings', title: 'Settings', entry: 'dist/settings.js' },
          ],
        },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/marketplace',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.active[0].title).toBe('Extension One');
      expect(body.active[0].panels).toEqual([
        { id: 'main', title: 'Main Panel' },
        { id: 'settings', title: 'Settings' },
      ]);
    });

    it('returns title for installed extensions from manifest', async () => {
      mockListInstalled.mockReturnValue([
        { name: 'ext1', version: '1.0.0', type: 'standard' },
      ]);
      mockGetActivated.mockReturnValue({});
      mockLoadGlobalConfig.mockReturnValue({ registries: [] });
      mockListAvailableExtensions.mockReturnValue([]);
      mockGetExtensionDir.mockReturnValue('/path/to/ext1@1.0.0');
      mockLoadManifest.mockReturnValue({
        name: 'ext1',
        title: 'Extension One',
        version: '1.0.0',
        type: 'standard',
        commands: {},
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/marketplace',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.installed[0].title).toBe('Extension One');
    });

    it('returns empty panels when manifest has no ui section', async () => {
      mockListInstalled.mockReturnValue([
        { name: 'ext1', version: '1.0.0', type: 'standard' },
      ]);
      mockGetActivated.mockReturnValue({ ext1: '1.0.0' });
      mockLoadGlobalConfig.mockReturnValue({ registries: [] });
      mockListAvailableExtensions.mockReturnValue([]);
      mockGetExtensionDir.mockReturnValue('/path/to/ext1@1.0.0');
      mockLoadManifest.mockReturnValue({
        name: 'ext1',
        version: '1.0.0',
        type: 'standard',
        commands: {},
        config: { schema: {} },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/marketplace',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.active[0].panels).toEqual([]);
    });

    it('classifies multi-version extensions by activated version', async () => {
      mockListInstalled.mockReturnValue([
        { name: 'ext1', version: '1.0.0', type: 'standard' },
        { name: 'ext1', version: '2.0.0', type: 'standard' },
      ]);
      mockGetActivated.mockReturnValue({ ext1: '2.0.0' });
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
      expect(body.active[0].version).toBe('2.0.0');
      expect(body.installed).toHaveLength(1);
      expect(body.installed[0].version).toBe('1.0.0');
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

    it('includes compatWarnings when engines do not match', async () => {
      mockLoadGlobalConfig.mockReturnValue({ registries: [] });
      mockResolveExtension.mockReturnValue({
        name: 'ext1',
        gitUrl: 'https://github.com/test/ext1.git',
        latestVersion: '1.0.0',
        type: 'standard',
        registryName: 'default',
      });
      mockInstallExtension.mockResolvedValue('/path/to/ext1@1.0.0');
      mockGetExtensionDir.mockReturnValue('/path/to/ext1@1.0.0');
      mockLoadManifest.mockReturnValue({
        name: 'ext1',
        version: '1.0.0',
        type: 'standard',
        commands: {},
        engines: { 'renre-kit': '>=99.0.0' },
      });
      mockCheckEngineCompat.mockReturnValue({
        compatible: false,
        issues: ['Extension "ext1" requires renre-kit >=99.0.0, but current version is 0.0.1'],
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/extensions/install',
        payload: { name: 'ext1' },
      });
      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.compatWarnings).toHaveLength(1);
      expect(body.compatWarnings[0]).toContain('renre-kit');
    });

    it('does not include compatWarnings when engines are compatible', async () => {
      mockLoadGlobalConfig.mockReturnValue({ registries: [] });
      mockResolveExtension.mockReturnValue({
        name: 'ext1',
        gitUrl: 'https://github.com/test/ext1.git',
        latestVersion: '1.0.0',
        type: 'standard',
        registryName: 'default',
      });
      mockInstallExtension.mockResolvedValue('/path/to/ext1@1.0.0');
      mockGetExtensionDir.mockReturnValue('/path/to/ext1@1.0.0');
      mockLoadManifest.mockReturnValue({
        name: 'ext1',
        version: '1.0.0',
        type: 'standard',
        commands: {},
      });
      mockCheckEngineCompat.mockReturnValue({
        compatible: true,
        issues: [],
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/extensions/install',
        payload: { name: 'ext1' },
      });
      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.compatWarnings).toBeUndefined();
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
      expect(response.json()).toEqual({ ok: true });
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

  describe('GET /api/extensions/:name/panels/:panelId.js', () => {
    it('serves a specific panel by ID', async () => {
      mockListInstalled.mockReturnValue([
        { name: 'ext1', version: '1.0.0', type: 'standard' },
      ]);
      mockGetActivated.mockReturnValue({ ext1: '1.0.0' });
      mockGetExtensionDir.mockReturnValue('/path/to/ext1@1.0.0');
      mockLoadManifest.mockReturnValue({
        name: 'ext1',
        version: '1.0.0',
        type: 'standard',
        commands: {},
        ui: {
          panels: [
            { id: 'main', title: 'Main', entry: 'dist/panel.js' },
            { id: 'settings', title: 'Settings', entry: 'dist/settings.js' },
          ],
        },
      });
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('export default function() {}');

      const response = await app.inject({
        method: 'GET',
        url: '/api/extensions/ext1/panels/settings.js',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toBe('application/javascript');
      expect(response.body).toBe('export default function() {}');
    });

    it('returns 404 for unknown panel ID', async () => {
      mockListInstalled.mockReturnValue([
        { name: 'ext1', version: '1.0.0', type: 'standard' },
      ]);
      mockGetActivated.mockReturnValue({ ext1: '1.0.0' });
      mockGetExtensionDir.mockReturnValue('/path/to/ext1@1.0.0');
      mockLoadManifest.mockReturnValue({
        name: 'ext1',
        version: '1.0.0',
        type: 'standard',
        commands: {},
        ui: {
          panels: [
            { id: 'main', title: 'Main', entry: 'dist/panel.js' },
          ],
        },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/extensions/ext1/panels/nonexistent.js',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(404);
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
