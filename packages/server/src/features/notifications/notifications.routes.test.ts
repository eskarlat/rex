import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';

const mockListNotifications = vi.fn();
const mockCreateNotification = vi.fn();
const mockCountUnread = vi.fn();
const mockMarkRead = vi.fn();
const mockMarkAllRead = vi.fn();
const mockDeleteNotification = vi.fn();
const mockDb = {};

vi.mock('@renre-kit/cli/lib', () => ({
  getDb: () => mockDb,
  listNotifications: (...args: unknown[]) => mockListNotifications(...args),
  createNotification: (...args: unknown[]) => mockCreateNotification(...args),
  countUnread: (...args: unknown[]) => mockCountUnread(...args),
  markRead: (...args: unknown[]) => mockMarkRead(...args),
  markAllRead: (...args: unknown[]) => mockMarkAllRead(...args),
  deleteNotification: (...args: unknown[]) => mockDeleteNotification(...args),
}));

const { default: notificationsRoutes } = await import('./notifications.routes.js');

describe('notifications routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify();
    await app.register(notificationsRoutes);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/notifications', () => {
    it('returns notifications list', async () => {
      const notifications = [{ id: 1, title: 'Test', variant: 'info' }];
      mockListNotifications.mockReturnValue(notifications);

      const response = await app.inject({ method: 'GET', url: '/api/notifications' });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(notifications);
    });

    it('passes unreadOnly and limit query params', async () => {
      mockListNotifications.mockReturnValue([]);

      await app.inject({
        method: 'GET',
        url: '/api/notifications?unreadOnly=true&limit=10',
      });

      expect(mockListNotifications).toHaveBeenCalledWith(mockDb, {
        unreadOnly: true,
        limit: 10,
      });
    });

    it('returns 400 for non-numeric limit', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/notifications?limit=abc',
      });
      expect(response.statusCode).toBe(400);
    });

    it('returns 400 for negative limit', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/notifications?limit=-5',
      });
      expect(response.statusCode).toBe(400);
    });

    it('caps limit at 1000', async () => {
      mockListNotifications.mockReturnValue([]);

      await app.inject({
        method: 'GET',
        url: '/api/notifications?limit=9999',
      });

      expect(mockListNotifications).toHaveBeenCalledWith(mockDb, {
        unreadOnly: false,
        limit: 1000,
      });
    });
  });

  describe('GET /api/notifications/count', () => {
    it('returns unread count', async () => {
      mockCountUnread.mockReturnValue(5);

      const response = await app.inject({ method: 'GET', url: '/api/notifications/count' });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ unread: 5 });
    });
  });

  describe('POST /api/notifications', () => {
    it('creates a notification and returns 201', async () => {
      const notification = { id: 1, title: 'Hello', variant: 'info' };
      mockCreateNotification.mockReturnValue(notification);

      const response = await app.inject({
        method: 'POST',
        url: '/api/notifications',
        payload: { extension_name: 'ext:test', title: 'Hello', message: 'World' },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toEqual(notification);
    });

    it('returns 400 when required fields are missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/notifications',
        payload: { title: 'Hello' },
      });

      expect(response.statusCode).toBe(400);
    });

    it('returns 400 for invalid variant', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/notifications',
        payload: {
          extension_name: 'ext:test',
          title: 'Hello',
          message: 'World',
          variant: 'invalid',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error).toContain('Invalid variant');
    });
  });

  describe('PATCH /api/notifications/:id/read', () => {
    it('marks notification as read', async () => {
      mockMarkRead.mockReturnValue(true);

      const response = await app.inject({
        method: 'PATCH',
        url: '/api/notifications/1/read',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ ok: true });
    });

    it('returns 404 for missing notification', async () => {
      mockMarkRead.mockReturnValue(false);

      const response = await app.inject({
        method: 'PATCH',
        url: '/api/notifications/999/read',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/notifications/read-all', () => {
    it('marks all as read', async () => {
      mockMarkAllRead.mockReturnValue(3);

      const response = await app.inject({
        method: 'PATCH',
        url: '/api/notifications/read-all',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ ok: true, count: 3 });
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    it('deletes notification', async () => {
      mockDeleteNotification.mockReturnValue(true);

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/notifications/1',
      });

      expect(response.statusCode).toBe(200);
    });

    it('returns 404 for missing notification', async () => {
      mockDeleteNotification.mockReturnValue(false);

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/notifications/999',
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
