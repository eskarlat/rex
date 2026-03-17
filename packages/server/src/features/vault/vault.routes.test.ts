import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';

const mockListEntries = vi.fn();
const mockSetEntry = vi.fn();
const mockRemoveEntry = vi.fn();

vi.mock('@renre-kit/cli/lib', () => ({
  listEntries: () => mockListEntries(),
  setEntry: (...args: unknown[]) => mockSetEntry(...args),
  removeEntry: (...args: unknown[]) => mockRemoveEntry(...args),
}));

const { default: vaultRoutes } = await import('./vault.routes.js');

describe('vault routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify();
    await app.register(vaultRoutes);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/vault', () => {
    it('returns masked vault entries', async () => {
      const entries = [
        { key: 'api-key', value: '********', secret: true, tags: ['api'] },
        { key: 'host', value: 'localhost', secret: false, tags: [] },
      ];
      mockListEntries.mockReturnValue(entries);

      const response = await app.inject({ method: 'GET', url: '/api/vault' });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(entries);
    });
  });

  describe('POST /api/vault', () => {
    it('creates a new vault entry', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/vault',
        payload: { key: 'api-key', value: 'secret123', secret: true, tags: ['api'] },
      });
      expect(response.statusCode).toBe(201);
      expect(mockSetEntry).toHaveBeenCalledWith('api-key', 'secret123', true, ['api']);
    });

    it('returns 400 when key is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/vault',
        payload: { value: 'test', secret: false },
      });
      expect(response.statusCode).toBe(400);
    });

    it('returns 400 when value is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/vault',
        payload: { key: 'test', secret: false },
      });
      expect(response.statusCode).toBe(400);
    });
  });

  describe('PUT /api/vault/:key', () => {
    it('updates an existing entry', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/vault/api-key',
        payload: { value: 'new-secret', secret: true, tags: [] },
      });
      expect(response.statusCode).toBe(200);
      expect(mockSetEntry).toHaveBeenCalledWith('api-key', 'new-secret', true, []);
    });

    it('returns 400 when value is missing', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/vault/api-key',
        payload: { secret: true },
      });
      expect(response.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/vault/:key', () => {
    it('removes a vault entry', async () => {
      mockRemoveEntry.mockReturnValue(true);

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/vault/api-key',
      });
      expect(response.statusCode).toBe(200);
    });

    it('returns 404 when key not found', async () => {
      mockRemoveEntry.mockReturnValue(false);

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/vault/nonexistent',
      });
      expect(response.statusCode).toBe(404);
    });
  });
});
