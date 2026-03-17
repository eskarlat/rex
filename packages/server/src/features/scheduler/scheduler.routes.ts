import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import { getDb } from '@renre-kit/cli/lib';

interface SchedulerIdParams {
  id: string;
}

interface CreateTaskBody {
  name: string;
  command: string;
  cron: string;
  enabled?: boolean;
}

interface UpdateTaskBody {
  name?: string;
  command?: string;
  cron?: string;
  enabled?: boolean;
}

interface ScheduledTask {
  id: number;
  name: string;
  command: string;
  cron: string;
  enabled: number;
  next_run_at: string | null;
  last_run_at: string | null;
  last_status: string | null;
  created_at: string;
}

const HISTORY_LIMIT = 50;

const schedulerRoutes: FastifyPluginCallback = (fastify: FastifyInstance, _opts, done) => {
  fastify.get('/api/scheduler', () => {
    const db = getDb();
    const tasks = db.prepare('SELECT * FROM scheduled_tasks ORDER BY created_at DESC').all() as ScheduledTask[];
    return tasks;
  });

  fastify.post('/api/scheduler', (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as CreateTaskBody;
    if (!body.name || !body.command || !body.cron) {
      reply.code(400);
      return { error: 'name, command, and cron are required' };
    }

    const db = getDb();
    const enabled = body.enabled !== false ? 1 : 0;
    const now = new Date().toISOString();

    const result = db.prepare(
      'INSERT INTO scheduled_tasks (name, command, cron, enabled, created_at) VALUES (?, ?, ?, ?, ?)',
    ).run(body.name, body.command, body.cron, enabled, now);

    reply.code(201);
    return {
      id: result.lastInsertRowid,
      name: body.name,
      command: body.command,
      cron: body.cron,
      enabled,
      created_at: now,
    };
  });

  fastify.put('/api/scheduler/:id', (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as SchedulerIdParams;
    const body = request.body as UpdateTaskBody;
    const db = getDb();

    const existing = db.prepare('SELECT * FROM scheduled_tasks WHERE id = ?').get(Number(params.id)) as ScheduledTask | undefined;
    if (!existing) {
      reply.code(404);
      return { error: 'Task not found' };
    }

    const name = body.name ?? existing.name;
    const command = body.command ?? existing.command;
    const cron = body.cron ?? existing.cron;
    let enabled = existing.enabled;
    if (body.enabled !== undefined) {
      enabled = body.enabled ? 1 : 0;
    }

    db.prepare(
      'UPDATE scheduled_tasks SET name = ?, command = ?, cron = ?, enabled = ? WHERE id = ?',
    ).run(name, command, cron, enabled, Number(params.id));

    return { ok: true };
  });

  fastify.delete('/api/scheduler/:id', (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as SchedulerIdParams;
    const db = getDb();
    const result = db.prepare('DELETE FROM scheduled_tasks WHERE id = ?').run(Number(params.id));
    if (result.changes === 0) {
      reply.code(404);
      return { error: 'Task not found' };
    }
    return { ok: true };
  });

  fastify.post('/api/scheduler/:id/trigger', (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as SchedulerIdParams;
    const db = getDb();
    const task = db.prepare('SELECT * FROM scheduled_tasks WHERE id = ?').get(Number(params.id)) as ScheduledTask | undefined;
    if (!task) {
      reply.code(404);
      return { error: 'Task not found' };
    }

    const now = new Date().toISOString();
    db.prepare(
      'UPDATE scheduled_tasks SET last_run_at = ?, last_status = ? WHERE id = ?',
    ).run(now, 'triggered', Number(params.id));

    db.prepare(
      'INSERT INTO task_history (task_id, started_at, status) VALUES (?, ?, ?)',
    ).run(Number(params.id), now, 'triggered');

    return { ok: true, triggered_at: now };
  });

  fastify.get('/api/scheduler/:id/history', (request: FastifyRequest) => {
    const params = request.params as SchedulerIdParams;
    const db = getDb();
    const history = db.prepare(
      'SELECT * FROM task_history WHERE task_id = ? ORDER BY started_at DESC LIMIT ?',
    ).all(Number(params.id), HISTORY_LIMIT);
    return history;
  });

  done();
};

export default schedulerRoutes;
