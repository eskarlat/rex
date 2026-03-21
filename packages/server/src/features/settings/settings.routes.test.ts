import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import projectScope from '../../core/middleware/project-scope.js';

const mockLoadGlobalConfig = vi.fn();
const mockSaveGlobalConfig = vi.fn();
const mockResolveExtensionConfig = vi.fn();
const mockSetExtensionConfig = vi.fn();

const mockGetActivated = vi.fn().mockReturnValue({});
const mockGetExtensionDir = vi.fn().mockReturnValue('/mock/ext');
const mockLoadManifest = vi.fn().mockReturnValue({ commands: {}, config: { schema: {} } });

vi.mock('@renre-kit/cli/lib', () => ({
  loadGlobalConfig: () => mockLoadGlobalConfig(),
  saveGlobalConfig: (...args: unknown[]) => mockSaveGlobalConfig(...args),
  resolveExtensionConfig: (...args: unknown[]) => mockResolveExtensionConfig(...args),
  setExtensionConfig: (...args: unknown[]) => mockSetExtensionConfig(...args),
  getActivated: (...args: unknown[]) => mockGetActivated(...args),
  getExtensionDir: (...args: unknown[]) => mockGetExtensionDir(...args),
  loadManifest: (...args: unknown[]) => mockLoadManifest(...args),
  getLogger: vi.fn().mockReturnValue({ info: vi.fn(), setLevel: vi.fn() }),
}));

const { default: settingsRoutes } = await import('./settings.routes.js');

describe('settings routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify();
    await app.register(projectScope);
    await app.register(settingsRoutes);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/settings', () => {
    it('returns global config', async () => {
      const config = { registries: [], settings: {}, extensionConfigs: {} };
      mockLoadGlobalConfig.mockReturnValue(config);

      const response = await app.inject({ method: 'GET', url: '/api/settings' });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(config);
    });
  });

  describe('PUT /api/settings', () => {
    it('saves global config', async () => {
      const config = { registries: [], settings: { key: 'value' }, extensionConfigs: {} };
      const response = await app.inject({
        method: 'PUT',
        url: '/api/settings',
        payload: config,
      });
      expect(response.statusCode).toBe(200);
      expect(mockSaveGlobalConfig).toHaveBeenCalledWith(config);
    });

    it('applies log level change when logLevels are provided', async () => {
      const { getLogger } = await import('@renre-kit/cli/lib');
      const config = {
        registries: [],
        settings: { logLevels: ['warn', 'error'] },
        extensionConfigs: {},
      };
      const response = await app.inject({
        method: 'PUT',
        url: '/api/settings',
        payload: config,
      });
      expect(response.statusCode).toBe(200);
      expect(vi.mocked(getLogger)().setLevel).toHaveBeenCalledWith('warn');
    });
  });

  describe('GET /api/settings/extensions/:name', () => {
    it('returns resolved extension config', async () => {
      mockGetActivated.mockReturnValue({ 'my-ext': '1.0.0' });
      mockResolveExtensionConfig.mockReturnValue({ apiKey: '***' });

      const response = await app.inject({
        method: 'GET',
        url: '/api/settings/extensions/my-ext',
        headers: { 'x-renrekit-project': '/mock/project' },
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ schema: {}, values: { apiKey: '***' } });
    });

    it('returns 404 when extension is not activated', async () => {
      mockGetActivated.mockReturnValue({});

      const response = await app.inject({
        method: 'GET',
        url: '/api/settings/extensions/not-active',
        headers: { 'x-renrekit-project': '/mock/project' },
      });
      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /api/settings/extensions/:name', () => {
    it('sets extension config mapping', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/settings/extensions/my-ext',
        payload: { fieldName: 'apiKey', mapping: { source: 'vault', value: 'my-key' } },
      });
      expect(response.statusCode).toBe(200);
      expect(mockSetExtensionConfig).toHaveBeenCalledWith('my-ext', 'apiKey', {
        source: 'vault',
        value: 'my-key',
      });
    });

    it('returns 400 when fieldName or mapping is missing', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/settings/extensions/my-ext',
        payload: {},
      });
      expect(response.statusCode).toBe(400);
    });
  });
});
