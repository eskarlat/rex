import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';

const mockPrepare = vi.fn();
const mockDb = {
  prepare: mockPrepare,
};

vi.mock('@renre-kit/cli/lib', () => ({
  getDb: () => mockDb,
}));

const { default: schedulerRoutes } = await import('./scheduler.routes.js');

describe('scheduler routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify();
    await app.register(schedulerRoutes);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/scheduler', () => {
    it('returns all scheduled tasks', async () => {
      const tasks = [{ id: 1, name: 'task1', command: 'ext:backup', cron: '0 * * * *', enabled: 1 }];
      mockPrepare.mockReturnValue({ all: () => tasks });

      const response = await app.inject({ method: 'GET', url: '/api/scheduler' });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(tasks);
    });
  });

  describe('POST /api/scheduler', () => {
    it('creates a scheduled task', async () => {
      mockPrepare.mockReturnValue({ run: () => ({ lastInsertRowid: 1 }) });

      const response = await app.inject({
        method: 'POST',
        url: '/api/scheduler',
        payload: { name: 'backup', command: 'ext:backup', cron: '0 * * * *' },
      });
      expect(response.statusCode).toBe(201);
      expect(response.json().name).toBe('backup');
    });

    it('returns 400 when required fields are missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/scheduler',
        payload: { name: 'backup' },
      });
      expect(response.statusCode).toBe(400);
    });

    it('defaults enabled to 1', async () => {
      mockPrepare.mockReturnValue({ run: () => ({ lastInsertRowid: 2 }) });

      const response = await app.inject({
        method: 'POST',
        url: '/api/scheduler',
        payload: { name: 'test', command: 'cmd', cron: '* * * * *' },
      });
      expect(response.json().enabled).toBe(1);
    });
  });

  describe('PUT /api/scheduler/:id', () => {
    it('updates a scheduled task', async () => {
      const existing = { id: 1, name: 'old', command: 'cmd', cron: '* * * * *', enabled: 1 };
      mockPrepare.mockReturnValueOnce({ get: () => existing });
      mockPrepare.mockReturnValueOnce({ run: vi.fn() });

      const response = await app.inject({
        method: 'PUT',
        url: '/api/scheduler/1',
        payload: { name: 'updated' },
      });
      expect(response.statusCode).toBe(200);
    });

    it('returns 404 when task not found', async () => {
      mockPrepare.mockReturnValue({ get: () => undefined });

      const response = await app.inject({
        method: 'PUT',
        url: '/api/scheduler/999',
        payload: { name: 'test' },
      });
      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/scheduler/:id', () => {
    it('deletes a scheduled task', async () => {
      mockPrepare.mockReturnValue({ run: () => ({ changes: 1 }) });

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/scheduler/1',
      });
      expect(response.statusCode).toBe(200);
    });

    it('returns 404 when task not found', async () => {
      mockPrepare.mockReturnValue({ run: () => ({ changes: 0 }) });

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/scheduler/999',
      });
      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /api/scheduler/:id/trigger', () => {
    it('triggers a task immediately', async () => {
      const task = { id: 1, name: 'task', command: 'cmd', cron: '* * * * *' };
      mockPrepare.mockReturnValueOnce({ get: () => task });
      mockPrepare.mockReturnValueOnce({ run: vi.fn() });
      mockPrepare.mockReturnValueOnce({ run: vi.fn() });

      const response = await app.inject({
        method: 'POST',
        url: '/api/scheduler/1/trigger',
      });
      expect(response.statusCode).toBe(200);
      expect(response.json().ok).toBe(true);
    });

    it('returns 404 when task not found', async () => {
      mockPrepare.mockReturnValue({ get: () => undefined });

      const response = await app.inject({
        method: 'POST',
        url: '/api/scheduler/999/trigger',
      });
      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/scheduler/:id/history', () => {
    it('returns task history', async () => {
      const history = [{ id: 1, task_id: 1, started_at: '2024-01-01', status: 'success' }];
      mockPrepare.mockReturnValue({ all: () => history });

      const response = await app.inject({
        method: 'GET',
        url: '/api/scheduler/1/history',
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(history);
    });
  });
});
