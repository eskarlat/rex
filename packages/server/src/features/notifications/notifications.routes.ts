import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import {
  getDb,
  listNotifications,
  createNotification,
  countUnread,
  markRead,
  markAllRead,
  deleteNotification,
} from '@renre-kit/cli/lib';

import { publishEvent } from '../../core/utils/event-hub.js';

interface NotificationIdParams {
  id: string;
}

interface CreateNotificationBody {
  extension_name?: string;
  title?: string;
  message?: string;
  variant?: string;
  action_url?: string;
}

const VALID_VARIANTS = ['info', 'success', 'warning', 'error'];
const MAX_QUERY_LIMIT = 1000;

const notificationsRoutes: FastifyPluginCallback = (fastify: FastifyInstance, _opts, done) => {
  fastify.get('/api/notifications', (request: FastifyRequest, reply: FastifyReply) => {
    const db = getDb();
    const { unreadOnly, limit } = request.query as { unreadOnly?: string; limit?: string };

    let parsedLimit: number | undefined;
    if (limit) {
      parsedLimit = Number.parseInt(limit, 10);
      if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
        return reply.code(400).send({ error: 'limit must be a positive integer' });
      }
      parsedLimit = Math.min(parsedLimit, MAX_QUERY_LIMIT);
    }

    const result = listNotifications(db, {
      unreadOnly: unreadOnly === 'true',
      limit: parsedLimit,
    });
    return reply.send(result);
  });

  fastify.get('/api/notifications/count', () => {
    const db = getDb();
    return { unread: countUnread(db) };
  });

  fastify.post('/api/notifications', (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as CreateNotificationBody;
    if (!body.extension_name || !body.title || !body.message) {
      return reply.code(400).send({ error: 'extension_name, title, and message are required' });
    }

    if (body.variant && !VALID_VARIANTS.includes(body.variant)) {
      return reply.code(400).send({ error: `Invalid variant. Must be one of: ${VALID_VARIANTS.join(', ')}` });
    }

    const db = getDb();
    const notification = createNotification(db, {
      extension_name: body.extension_name,
      title: body.title,
      message: body.message,
      variant: body.variant as 'info' | 'success' | 'warning' | 'error' | undefined,
      action_url: body.action_url,
    });

    publishEvent({
      type: 'system:notification:created',
      source: notification.extension_name,
      data: notification as unknown as Record<string, unknown>,
    });

    return reply.code(201).send(notification);
  });

  fastify.patch('/api/notifications/:id/read', (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as NotificationIdParams;
    const db = getDb();
    const result = markRead(db, Number(params.id));
    if (!result) {
      return reply.code(404).send({ error: 'Notification not found' });
    }
    return reply.send({ ok: true });
  });

  fastify.patch('/api/notifications/read-all', () => {
    const db = getDb();
    const count = markAllRead(db);
    return { ok: true, count };
  });

  fastify.delete('/api/notifications/:id', (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as NotificationIdParams;
    const db = getDb();
    const result = deleteNotification(db, Number(params.id));
    if (!result) {
      return reply.code(404).send({ error: 'Notification not found' });
    }
    return reply.send({ ok: true });
  });

  done();
};

export default notificationsRoutes;
