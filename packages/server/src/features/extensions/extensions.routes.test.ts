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
const mockCheckEngineConstraints = vi.fn();
const mockResolveRegistryIcon = vi.fn();
const mockReadUpdateCache = vi.fn();
const mockRefreshUpdateCache = vi.fn();
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
  checkEngineConstraints: (...args: unknown[]) => mockCheckEngineConstraints(...args),
  readUpdateCache: () => mockReadUpdateCache(),
  refreshUpdateCache: (...args: unknown[]) => mockRefreshUpdateCache(...args),
  resolveRegistryIcon: (...args: unknown[]) => mockResolveRegistryIcon(...args),
  CLI_VERSION: '0.0.1',
  SDK_VERSION: '0.0.1',
  getLogger: () => ({ warn: vi.fn(), info: vi.fn(), error: vi.fn() }),
}));

const { default: extensionsRoutes } = await import('./extensions.routes.js');

describe('extensions routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockGetDb.mockReturnValue(mockDb);
    mockLoadGlobalConfig.mockReturnValue({ registries: [] });
    mockCheckEngineCompat.mockReturnValue({ compatible: true, issues: [] });
    mockCheckEngineConstraints.mockReturnValue({ compatible: true, issues: [] });
    mockReadUpdateCache.mockReturnValue(null);
    mockRefreshUpdateCache.mockReturnValue(undefined);
    mockEnsureSynced.mockResolvedValue(undefined);
    mockResolveRegistryIcon.mockReturnValue(null);
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
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '1.0.0', type: 'standard' }]);
      mockGetActivated.mockReturnValue({});
      mockLoadGlobalConfig.mockReturnValue({
        registries: [{ name: 'default', url: 'https://example.com', priority: 0, cacheTTL: 3600 }],
      });
      mockListAvailableExtensions.mockReturnValue([
        {
          name: 'ext1',
          description: 'Already installed',
          gitUrl: 'https://example.com/ext1.git',
          latestVersion: '1.0.0',
          type: 'standard',
          icon: 'box',
          author: 'test',
        },
        {
          name: 'ext3',
          description: 'New extension',
          gitUrl: 'https://example.com/ext3.git',
          latestVersion: '2.0.0',
          type: 'mcp',
          icon: 'star',
          author: 'author1',
        },
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
        hasIcon: false,
        gitUrl: 'https://example.com/ext3.git',
      });
    });

    it('handles loadManifest failure gracefully for active extensions', async () => {
      mockListInstalled.mockReturnValue([
        { name: 'broken-ext', version: '1.0.0', type: 'standard' },
      ]);
      mockGetActivated.mockReturnValue({ 'broken-ext': '1.0.0' });
      mockLoadGlobalConfig.mockReturnValue({ registries: [] });
      mockListAvailableExtensions.mockReturnValue([]);
      mockGetExtensionDir.mockReturnValue('/fake/dir');
      mockLoadManifest.mockImplementation(() => {
        throw new Error('Manifest not found');
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/marketplace',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.active).toHaveLength(1);
      expect(body.active[0].name).toBe('broken-ext');
      expect(body.active[0].hasConfig).toBe(false);
    });

    it('handles loadManifest failure gracefully for installed extensions', async () => {
      mockListInstalled.mockReturnValue([
        { name: 'broken-ext', version: '1.0.0', type: 'standard' },
      ]);
      mockGetActivated.mockReturnValue({});
      mockLoadGlobalConfig.mockReturnValue({ registries: [] });
      mockListAvailableExtensions.mockReturnValue([]);
      mockGetExtensionDir.mockReturnValue('/fake/dir');
      mockLoadManifest.mockImplementation(() => {
        throw 'non-error string';
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/marketplace',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.installed).toHaveLength(1);
      expect(body.installed[0].name).toBe('broken-ext');
    });

    it('passes tags through for available extensions', async () => {
      mockListInstalled.mockReturnValue([]);
      mockGetActivated.mockReturnValue({});
      mockLoadGlobalConfig.mockReturnValue({
        registries: [{ name: 'default', url: 'https://example.com', priority: 0, cacheTTL: 3600 }],
      });
      mockListAvailableExtensions.mockReturnValue([
        {
          name: 'tagged-ext',
          description: 'Has tags',
          gitUrl: 'https://example.com/ext.git',
          latestVersion: '1.0.0',
          type: 'standard',
          icon: '',
          author: 'test',
          tags: ['example', 'utility'],
        },
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
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '1.0.0', type: 'standard' }]);
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
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '1.0.0', type: 'standard' }]);
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
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '1.0.0', type: 'standard' }]);
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

    it('returns installedAt, registrySource, and installPath for active extensions', async () => {
      mockListInstalled.mockReturnValue([
        {
          name: 'ext1',
          version: '1.0.0',
          type: 'standard',
          installed_at: '2025-01-15T10:00:00Z',
          registry_source: 'default',
        },
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
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/marketplace',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.active[0].installedAt).toBe('2025-01-15T10:00:00Z');
      expect(body.active[0].registrySource).toBe('default');
      expect(body.active[0].installPath).toBe('/path/to/ext1@1.0.0');
    });

    it('returns installedAt, registrySource, and installPath for installed extensions', async () => {
      mockListInstalled.mockReturnValue([
        {
          name: 'ext1',
          version: '1.0.0',
          type: 'standard',
          installed_at: '2025-02-20T08:30:00Z',
          registry_source: 'custom',
        },
      ]);
      mockGetActivated.mockReturnValue({});
      mockLoadGlobalConfig.mockReturnValue({ registries: [] });
      mockListAvailableExtensions.mockReturnValue([]);
      mockGetExtensionDir.mockReturnValue('/path/to/ext1@1.0.0');
      mockLoadManifest.mockReturnValue({
        name: 'ext1',
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
      expect(body.installed[0].installedAt).toBe('2025-02-20T08:30:00Z');
      expect(body.installed[0].registrySource).toBe('custom');
      expect(body.installed[0].installPath).toBe('/path/to/ext1@1.0.0');
    });

    it('omits registrySource when registry_source is null', async () => {
      mockListInstalled.mockReturnValue([
        {
          name: 'ext1',
          version: '1.0.0',
          type: 'standard',
          installed_at: '2025-01-15T10:00:00Z',
          registry_source: null,
        },
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
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/marketplace',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.active[0].registrySource).toBeUndefined();
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

    it('auto-resolves version from installed extensions when not provided', async () => {
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '2.0.0' }]);
      mockGetExtensionDir.mockReturnValue('/path/to/ext1@2.0.0');
      mockActivate.mockResolvedValue([]);

      const response = await app.inject({
        method: 'POST',
        url: '/api/extensions/activate',
        payload: { name: 'ext1', projectPath: '/my/project' },
      });
      expect(response.statusCode).toBe(200);
      expect(mockGetExtensionDir).toHaveBeenCalledWith('ext1', '2.0.0');
    });

    it('returns 404 when extension is not installed and no version provided', async () => {
      mockListInstalled.mockReturnValue([]);

      const response = await app.inject({
        method: 'POST',
        url: '/api/extensions/activate',
        payload: { name: 'nonexistent', projectPath: '/my/project' },
      });
      expect(response.statusCode).toBe(404);
    });

    it('returns missing keys when activation requires config', async () => {
      mockGetExtensionDir.mockReturnValue('/path/to/ext1@1.0.0');
      mockActivate.mockResolvedValue(['API_KEY', 'SECRET']);

      const response = await app.inject({
        method: 'POST',
        url: '/api/extensions/activate',
        payload: { name: 'ext1', version: '1.0.0', projectPath: '/my/project' },
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ ok: true, missingKeys: ['API_KEY', 'SECRET'] });
    });
  });

  describe('POST /api/extensions/deactivate', () => {
    it('deactivates an extension', async () => {
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '1.0.0' }]);
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

    it('returns 404 when extension is not installed', async () => {
      mockListInstalled.mockReturnValue([]);

      const response = await app.inject({
        method: 'POST',
        url: '/api/extensions/deactivate',
        payload: { name: 'nonexistent', projectPath: '/my/project' },
      });
      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/extensions/:name/panel.js', () => {
    it('serves the default panel', async () => {
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '1.0.0', type: 'standard' }]);
      mockGetActivated.mockReturnValue({ ext1: '1.0.0' });
      mockGetExtensionDir.mockReturnValue('/path/to/ext1@1.0.0');
      mockLoadManifest.mockReturnValue({
        name: 'ext1',
        version: '1.0.0',
        type: 'standard',
        commands: {},
        ui: {
          panels: [{ id: 'main', title: 'Main', entry: 'dist/panel.js' }],
        },
      });
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('export default {}');

      const response = await app.inject({
        method: 'GET',
        url: '/api/extensions/ext1/panel.js',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toBe('application/javascript');
    });

    it('returns 404 when panel not found', async () => {
      mockListInstalled.mockReturnValue([]);
      mockGetActivated.mockReturnValue({});

      const response = await app.inject({
        method: 'GET',
        url: '/api/extensions/nonexistent/panel.js',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/extensions/:name/panels/:panelId.js', () => {
    it('serves a specific panel by ID', async () => {
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '1.0.0', type: 'standard' }]);
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
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '1.0.0', type: 'standard' }]);
      mockGetActivated.mockReturnValue({ ext1: '1.0.0' });
      mockGetExtensionDir.mockReturnValue('/path/to/ext1@1.0.0');
      mockLoadManifest.mockReturnValue({
        name: 'ext1',
        version: '1.0.0',
        type: 'standard',
        commands: {},
        ui: {
          panels: [{ id: 'main', title: 'Main', entry: 'dist/panel.js' }],
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

  describe('GET /api/extensions/:name/widgets/:widgetId.js', () => {
    it('serves a widget by ID', async () => {
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '1.0.0', type: 'standard' }]);
      mockGetActivated.mockReturnValue({ ext1: '1.0.0' });
      mockGetExtensionDir.mockReturnValue('/path/to/ext1@1.0.0');
      mockLoadManifest.mockReturnValue({
        name: 'ext1',
        version: '1.0.0',
        type: 'standard',
        commands: {},
        ui: {
          panels: [],
          widgets: [
            {
              id: 'status',
              title: 'Status',
              entry: 'dist/status-widget.js',
              defaultSize: { w: 4, h: 2 },
            },
          ],
        },
      });
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('export default function StatusWidget() {}');

      const response = await app.inject({
        method: 'GET',
        url: '/api/extensions/ext1/widgets/status.js',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toBe('application/javascript');
      expect(response.body).toBe('export default function StatusWidget() {}');
    });

    it('returns 404 for unknown widget ID', async () => {
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '1.0.0', type: 'standard' }]);
      mockGetActivated.mockReturnValue({ ext1: '1.0.0' });
      mockGetExtensionDir.mockReturnValue('/path/to/ext1@1.0.0');
      mockLoadManifest.mockReturnValue({
        name: 'ext1',
        version: '1.0.0',
        type: 'standard',
        commands: {},
        ui: {
          panels: [],
          widgets: [],
        },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/extensions/ext1/widgets/nonexistent.js',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(404);
    });
  });

  describe('marketplace widget metadata', () => {
    it('returns widgets metadata for active extensions', async () => {
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '1.0.0', type: 'standard' }]);
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
          panels: [],
          widgets: [
            {
              id: 'status',
              title: 'Status',
              entry: 'dist/status.js',
              defaultSize: { w: 4, h: 2 },
              minSize: { w: 2, h: 1 },
            },
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
      expect(body.active[0].widgets).toHaveLength(1);
      expect(body.active[0].widgets[0]).toEqual({
        id: 'status',
        title: 'Status',
        defaultSize: { w: 4, h: 2 },
        minSize: { w: 2, h: 1 },
      });
    });

    it('returns empty widgets when manifest has no widgets', async () => {
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '1.0.0', type: 'standard' }]);
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
      expect(body.active[0].widgets).toEqual([]);
    });
  });

  describe('marketplace update info', () => {
    it('includes updateAvailable and engineCompatible fields for active extensions', async () => {
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '1.0.0', type: 'standard' }]);
      mockGetActivated.mockReturnValue({ ext1: '1.0.0' });
      mockLoadGlobalConfig.mockReturnValue({ registries: [] });
      mockListAvailableExtensions.mockReturnValue([]);
      mockReadUpdateCache.mockReturnValue({
        checkedAt: '2026-01-01T00:00:00Z',
        updates: [
          {
            name: 'ext1',
            installedVersion: '1.0.0',
            availableVersion: '2.0.0',
            engineCompatible: true,
            engineIssues: [],
            registryName: 'default',
          },
        ],
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/marketplace',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.active[0].updateAvailable).toBe('2.0.0');
      expect(body.active[0].engineCompatible).toBe(true);
    });

    it('includes updateAvailable for installed-only extensions', async () => {
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '1.0.0', type: 'standard' }]);
      mockGetActivated.mockReturnValue({});
      mockLoadGlobalConfig.mockReturnValue({ registries: [] });
      mockListAvailableExtensions.mockReturnValue([]);
      mockReadUpdateCache.mockReturnValue({
        checkedAt: '2026-01-01T00:00:00Z',
        updates: [
          {
            name: 'ext1',
            installedVersion: '1.0.0',
            availableVersion: '2.0.0',
            engineCompatible: false,
            engineIssues: ['Requires renre-kit >=5.0.0'],
            registryName: 'default',
          },
        ],
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/marketplace',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.installed[0].updateAvailable).toBe('2.0.0');
      expect(body.installed[0].engineCompatible).toBe(false);
    });

    it('returns null updateAvailable when no cache exists', async () => {
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '1.0.0', type: 'standard' }]);
      mockGetActivated.mockReturnValue({ ext1: '1.0.0' });
      mockLoadGlobalConfig.mockReturnValue({ registries: [] });
      mockListAvailableExtensions.mockReturnValue([]);
      mockReadUpdateCache.mockReturnValue(null);

      const response = await app.inject({
        method: 'GET',
        url: '/api/marketplace',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.active[0].updateAvailable).toBeNull();
      expect(body.active[0].engineCompatible).toBe(true);
    });
  });

  describe('GET /api/updates', () => {
    it('returns update cache when available', async () => {
      mockReadUpdateCache.mockReturnValue({
        checkedAt: '2026-01-01T00:00:00Z',
        updates: [
          {
            name: 'ext1',
            installedVersion: '1.0.0',
            availableVersion: '2.0.0',
            engineCompatible: true,
            engineIssues: [],
            registryName: 'default',
          },
        ],
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/updates',
      });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.checkedAt).toBe('2026-01-01T00:00:00Z');
      expect(body.updates).toHaveLength(1);
    });

    it('returns empty updates when no cache exists', async () => {
      mockReadUpdateCache.mockReturnValue(null);

      const response = await app.inject({
        method: 'GET',
        url: '/api/updates',
      });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.checkedAt).toBeNull();
      expect(body.updates).toEqual([]);
    });
  });

  describe('GET /api/extensions/:name/icon', () => {
    it('serves icon when manifest has icon path and file exists', async () => {
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '1.0.0', type: 'standard' }]);
      mockGetActivated.mockReturnValue({ ext1: '1.0.0' });
      mockGetExtensionDir.mockReturnValue('/path/to/ext1@1.0.0');
      mockLoadManifest.mockReturnValue({
        name: 'ext1',
        version: '1.0.0',
        type: 'standard',
        commands: {},
        icon: 'icon.svg',
      });
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('<svg></svg>');

      const response = await app.inject({
        method: 'GET',
        url: '/api/extensions/ext1/icon',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toBe('image/svg+xml');
    });

    it('falls back to registry icon for available extensions', async () => {
      mockListInstalled.mockReturnValue([]);
      mockGetActivated.mockReturnValue({});
      mockLoadGlobalConfig.mockReturnValue({ registries: [] });
      mockResolveRegistryIcon.mockReturnValue(
        '/path/to/registries/default/.renre-kit/icons/ext1.svg',
      );
      vi.mocked(readFileSync).mockReturnValue('<svg>registry icon</svg>');

      const response = await app.inject({
        method: 'GET',
        url: '/api/extensions/ext1/icon',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toBe('image/svg+xml');
    });

    it('returns 404 when no icon found anywhere', async () => {
      mockListInstalled.mockReturnValue([]);
      mockGetActivated.mockReturnValue({});
      mockLoadGlobalConfig.mockReturnValue({ registries: [] });
      mockResolveRegistryIcon.mockReturnValue(null);

      const response = await app.inject({
        method: 'GET',
        url: '/api/extensions/nonexistent/icon',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /api/extensions/update', () => {
    it('updates an installed extension', async () => {
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '1.0.0', type: 'standard' }]);
      mockLoadGlobalConfig.mockReturnValue({ registries: [] });
      mockResolveExtension.mockReturnValue({
        name: 'ext1',
        gitUrl: 'https://github.com/test/ext1.git',
        latestVersion: '2.0.0',
        type: 'standard',
        registryName: 'default',
      });
      mockInstallExtension.mockResolvedValue('/path/to/ext1@2.0.0');
      mockGetActivated.mockReturnValue({});

      const response = await app.inject({
        method: 'POST',
        url: '/api/extensions/update',
        payload: { name: 'ext1' },
      });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.name).toBe('ext1');
      expect(body.oldVersion).toBe('1.0.0');
      expect(body.newVersion).toBe('2.0.0');
      expect(mockRefreshUpdateCache).toHaveBeenCalled();
    });

    it('returns 404 when extension is not installed', async () => {
      mockListInstalled.mockReturnValue([]);

      const response = await app.inject({
        method: 'POST',
        url: '/api/extensions/update',
        payload: { name: 'nonexistent' },
      });
      expect(response.statusCode).toBe(404);
    });

    it('returns 409 when engine is incompatible and no force', async () => {
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '1.0.0', type: 'standard' }]);
      mockLoadGlobalConfig.mockReturnValue({ registries: [] });
      mockResolveExtension.mockReturnValue({
        name: 'ext1',
        gitUrl: '',
        latestVersion: '2.0.0',
        type: 'standard',
        registryName: 'default',
        engines: { 'renre-kit': '>=5.0.0' },
      });
      mockCheckEngineConstraints.mockReturnValue({
        compatible: false,
        issues: ['Requires renre-kit >=5.0.0'],
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/extensions/update',
        payload: { name: 'ext1' },
      });
      expect(response.statusCode).toBe(409);
      expect(response.json().issues).toHaveLength(1);
    });

    it('allows update with force despite engine incompatibility', async () => {
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '1.0.0', type: 'standard' }]);
      mockLoadGlobalConfig.mockReturnValue({ registries: [] });
      mockResolveExtension.mockReturnValue({
        name: 'ext1',
        gitUrl: 'https://github.com/test/ext1.git',
        latestVersion: '2.0.0',
        type: 'standard',
        registryName: 'default',
        engines: { 'renre-kit': '>=5.0.0' },
      });
      mockCheckEngineConstraints.mockReturnValue({
        compatible: false,
        issues: ['Requires renre-kit >=5.0.0'],
      });
      mockInstallExtension.mockResolvedValue('/path/to/ext1@2.0.0');
      mockGetActivated.mockReturnValue({});

      const response = await app.inject({
        method: 'POST',
        url: '/api/extensions/update',
        payload: { name: 'ext1', force: true },
      });
      expect(response.statusCode).toBe(200);
      expect(response.json().newVersion).toBe('2.0.0');
    });

    it('returns 400 when name is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/extensions/update',
        payload: {},
      });
      expect(response.statusCode).toBe(400);
    });

    it('returns already up to date when version is not newer', async () => {
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '2.0.0', type: 'standard' }]);
      mockLoadGlobalConfig.mockReturnValue({ registries: [] });
      mockResolveExtension.mockReturnValue({
        name: 'ext1',
        gitUrl: '',
        latestVersion: '2.0.0',
        type: 'standard',
        registryName: 'default',
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/extensions/update',
        payload: { name: 'ext1' },
      });
      expect(response.statusCode).toBe(200);
      expect(response.json().message).toBe('Already up to date');
      expect(mockInstallExtension).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/extensions/:name/changelog', () => {
    it('returns changelog content when CHANGELOG.md exists', async () => {
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '1.0.0', type: 'standard' }]);
      mockGetActivated.mockReturnValue({ ext1: '1.0.0' });
      mockGetExtensionDir.mockReturnValue('/path/to/ext1@1.0.0');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('# Changelog\n\n## [1.0.0]\n\n### Added\n\n- Feature');

      const response = await app.inject({
        method: 'GET',
        url: '/api/extensions/ext1/changelog',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.changelog).toBe('# Changelog\n\n## [1.0.0]\n\n### Added\n\n- Feature');
    });

    it('returns 404 when CHANGELOG.md does not exist', async () => {
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '1.0.0', type: 'standard' }]);
      mockGetActivated.mockReturnValue({ ext1: '1.0.0' });
      mockGetExtensionDir.mockReturnValue('/path/to/ext1@1.0.0');
      vi.mocked(existsSync).mockReturnValue(false);

      const response = await app.inject({
        method: 'GET',
        url: '/api/extensions/ext1/changelog',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(404);
    });

    it('returns 404 when extension is not installed', async () => {
      mockListInstalled.mockReturnValue([]);
      mockGetActivated.mockReturnValue({});

      const response = await app.inject({
        method: 'GET',
        url: '/api/extensions/nonexistent/changelog',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/extensions/:name/readme', () => {
    it('returns readme content when README.md exists', async () => {
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '1.0.0', type: 'standard' }]);
      mockGetActivated.mockReturnValue({ ext1: '1.0.0' });
      mockGetExtensionDir.mockReturnValue('/path/to/ext1@1.0.0');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('# Ext1\n\nA great extension.');

      const response = await app.inject({
        method: 'GET',
        url: '/api/extensions/ext1/readme',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.readme).toBe('# Ext1\n\nA great extension.');
    });

    it('returns 404 when README.md does not exist', async () => {
      mockListInstalled.mockReturnValue([{ name: 'ext1', version: '1.0.0', type: 'standard' }]);
      mockGetActivated.mockReturnValue({ ext1: '1.0.0' });
      mockGetExtensionDir.mockReturnValue('/path/to/ext1@1.0.0');
      vi.mocked(existsSync).mockReturnValue(false);

      const response = await app.inject({
        method: 'GET',
        url: '/api/extensions/ext1/readme',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(404);
    });

    it('returns 404 when extension is not installed', async () => {
      mockListInstalled.mockReturnValue([]);
      mockGetActivated.mockReturnValue({});

      const response = await app.inject({
        method: 'GET',
        url: '/api/extensions/nonexistent/readme',
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
