import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';

const mockLoadGlobalConfig = vi.fn();
const mockSaveGlobalConfig = vi.fn();
const mockSync = vi.fn();

vi.mock('@renre-kit/cli/lib', () => ({
  loadGlobalConfig: () => mockLoadGlobalConfig(),
  saveGlobalConfig: (...args: unknown[]) => mockSaveGlobalConfig(...args),
  sync: (...args: unknown[]) => mockSync(...args),
}));

const { default: registriesRoutes } = await import('./registries.routes.js');

describe('registries routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify();
    await app.register(registriesRoutes);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/registries', () => {
    it('returns list of registries', async () => {
      const registries = [{ name: 'default', url: 'https://example.com', priority: 100, cacheTTL: 3600 }];
      mockLoadGlobalConfig.mockReturnValue({ registries });

      const response = await app.inject({ method: 'GET', url: '/api/registries' });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(registries);
    });
  });

  describe('POST /api/registries', () => {
    it('adds a new registry', async () => {
      mockLoadGlobalConfig.mockReturnValue({ registries: [] });

      const response = await app.inject({
        method: 'POST',
        url: '/api/registries',
        payload: { name: 'custom', url: 'https://custom.com' },
      });
      expect(response.statusCode).toBe(201);
      expect(mockSaveGlobalConfig).toHaveBeenCalled();
      expect(response.json()).toMatchObject({ name: 'custom', url: 'https://custom.com' });
    });

    it('returns 409 when registry already exists', async () => {
      mockLoadGlobalConfig.mockReturnValue({
        registries: [{ name: 'custom', url: 'https://custom.com', priority: 100, cacheTTL: 3600 }],
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/registries',
        payload: { name: 'custom', url: 'https://other.com' },
      });
      expect(response.statusCode).toBe(409);
    });

    it('returns 400 when name or url is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/registries',
        payload: { name: 'test' },
      });
      expect(response.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/registries/:name', () => {
    it('removes a registry', async () => {
      mockLoadGlobalConfig.mockReturnValue({
        registries: [{ name: 'custom', url: 'https://custom.com', priority: 100, cacheTTL: 3600 }],
      });

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/registries/custom',
      });
      expect(response.statusCode).toBe(200);
      expect(mockSaveGlobalConfig).toHaveBeenCalled();
    });

    it('returns 404 when registry not found', async () => {
      mockLoadGlobalConfig.mockReturnValue({ registries: [] });

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/registries/nonexistent',
      });
      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /api/registries/:name/sync', () => {
    it('syncs a registry', async () => {
      const registry = { name: 'default', url: 'https://example.com', priority: 100, cacheTTL: 3600 };
      mockLoadGlobalConfig.mockReturnValue({ registries: [registry] });
      mockSync.mockResolvedValue(undefined);

      const response = await app.inject({
        method: 'POST',
        url: '/api/registries/default/sync',
      });
      expect(response.statusCode).toBe(200);
      expect(mockSync).toHaveBeenCalledWith('default', registry);
    });

    it('returns 404 when registry not found', async () => {
      mockLoadGlobalConfig.mockReturnValue({ registries: [] });

      const response = await app.inject({
        method: 'POST',
        url: '/api/registries/nonexistent/sync',
      });
      expect(response.statusCode).toBe(404);
    });
  });
});
