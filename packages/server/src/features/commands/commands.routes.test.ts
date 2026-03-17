import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';

const mockResolve = vi.fn();

vi.mock('@renre-kit/cli/lib', () => ({
  CommandRegistry: vi.fn().mockImplementation(() => ({
    resolve: mockResolve,
  })),
}));

const { default: commandsRoutes } = await import('./commands.routes.js');

describe('commands routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify();
    await app.register(commandsRoutes);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/run', () => {
    it('executes a resolved command', async () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      mockResolve.mockReturnValue({ handler, metadata: { description: 'test' } });

      const response = await app.inject({
        method: 'POST',
        url: '/api/run',
        payload: { command: 'ext:hello', args: { name: 'world' } },
      });
      expect(response.statusCode).toBe(200);
      expect(handler).toHaveBeenCalledWith({ name: 'world' });
    });

    it('returns 404 when command not found', async () => {
      mockResolve.mockReturnValue(undefined);

      const response = await app.inject({
        method: 'POST',
        url: '/api/run',
        payload: { command: 'unknown:cmd' },
      });
      expect(response.statusCode).toBe(404);
    });

    it('returns 400 when command is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/run',
        payload: {},
      });
      expect(response.statusCode).toBe(400);
    });

    it('uses empty object for args when not provided', async () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      mockResolve.mockReturnValue({ handler, metadata: {} });

      const response = await app.inject({
        method: 'POST',
        url: '/api/run',
        payload: { command: 'ext:hello' },
      });
      expect(response.statusCode).toBe(200);
      expect(handler).toHaveBeenCalledWith({});
    });
  });
});
