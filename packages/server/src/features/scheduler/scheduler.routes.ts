import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import { getDb } from '@renre-kit/cli/lib';

interface SchedulerIdParams {
  id: string;
}

interface CreateTaskBody {
  name?: string;
  extension_name?: string;
  type?: 'manual' | 'extension';
  command: string;
  cron: string;
  project_path?: string;
  enabled?: boolean;
}

interface UpdateTaskBody {
  command?: string;
  cron?: string;
  enabled?: number;
}

interface ScheduledTask {
  id: string;
  name: string;
  type: string;
  project_path: string | null;
  cron: string;
  command: string;
  enabled: number;
  next_run_at: string | null;
  last_run_at: string | null;
  last_status: string | null;
  created_at: string;
}

const HISTORY_LIMIT = 50;

function generateId(): string {
  const bytes = new Uint8Array(8);
  globalThis.crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${Date.now()}-${hex}`;
}

const schedulerRoutes: FastifyPluginCallback = (fastify: FastifyInstance, _opts, done) => {
  fastify.get('/api/scheduler', () => {
    const db = getDb();
    return db.prepare('SELECT * FROM scheduled_tasks ORDER BY created_at DESC').all() as ScheduledTask[];
  });

  fastify.post('/api/scheduler', (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as CreateTaskBody;
    const name = body.name ?? body.extension_name;
    const type = body.type ?? (body.extension_name ? 'extension' : 'manual');
    if (!name || !body.command || !body.cron) {
      reply.code(400);
      return { error: 'name, command, and cron are required' };
    }

    const db = getDb();
    const id = generateId();
    const enabled = body.enabled !== false ? 1 : 0;
    const now = new Date().toISOString();
    const projectPath = body.project_path ?? request.projectPath ?? fastify.activeProjectPath ?? null;

    db.prepare(
      'INSERT INTO scheduled_tasks (id, name, type, project_path, cron, command, enabled, next_run_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ).run(id, name, type, projectPath, body.cron, body.command, enabled, now, now);

    reply.code(201);
    return {
      id,
      name,
      type,
      project_path: projectPath,
      cron: body.cron,
      command: body.command,
      enabled,
      next_run_at: now,
      last_run_at: null,
      last_status: null,
      created_at: now,
    };
  });

  fastify.put('/api/scheduler/:id', (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as SchedulerIdParams;
    const body = request.body as UpdateTaskBody;
    const db = getDb();

    const existing = db.prepare('SELECT * FROM scheduled_tasks WHERE id = ?').get(params.id) as ScheduledTask | undefined;
    if (!existing) {
      reply.code(404);
      return { error: 'Task not found' };
    }

    const command = body.command ?? existing.command;
    const cron = body.cron ?? existing.cron;
    const enabled = body.enabled ?? existing.enabled;

    db.prepare(
      'UPDATE scheduled_tasks SET command = ?, cron = ?, enabled = ? WHERE id = ?',
    ).run(command, cron, enabled, params.id);

    return { ok: true };
  });

  fastify.delete('/api/scheduler/:id', (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as SchedulerIdParams;
    const db = getDb();
    const result = db.prepare('DELETE FROM scheduled_tasks WHERE id = ?').run(params.id);
    if (result.changes === 0) {
      reply.code(404);
      return { error: 'Task not found' };
    }
    return { ok: true };
  });

  fastify.post('/api/scheduler/:id/trigger', (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as SchedulerIdParams;
    const db = getDb();
    const task = db.prepare('SELECT * FROM scheduled_tasks WHERE id = ?').get(params.id) as ScheduledTask | undefined;
    if (!task) {
      reply.code(404);
      return { error: 'Task not found' };
    }

    const now = new Date().toISOString();
    db.prepare(
      'UPDATE scheduled_tasks SET last_run_at = ?, last_status = ? WHERE id = ?',
    ).run(now, 'triggered', params.id);

    db.prepare(
      'INSERT INTO task_history (task_id, started_at, status) VALUES (?, ?, ?)',
    ).run(params.id, now, 'triggered');

    return { ok: true, triggered_at: now };
  });

  fastify.get('/api/scheduler/:id/history', (request: FastifyRequest) => {
    const params = request.params as SchedulerIdParams;
    const db = getDb();
    return db.prepare(
      'SELECT * FROM task_history WHERE task_id = ? ORDER BY started_at DESC LIMIT ?',
    ).all(params.id, HISTORY_LIMIT);
  });

  done();
};

export default schedulerRoutes;
