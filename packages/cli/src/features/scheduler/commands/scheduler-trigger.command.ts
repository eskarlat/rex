import * as clack from '@clack/prompts';
import { execFileSync } from 'node:child_process';
import type Database from 'better-sqlite3';

interface ScheduledTask {
  id: string;
  command: string;
  enabled: number;
}

interface SchedulerTriggerOptions {
  taskId: string;
  db: Database.Database;
}

export function handleSchedulerTrigger(options: SchedulerTriggerOptions): void {
  const task = options.db
    .prepare('SELECT * FROM scheduled_tasks WHERE id = ?')
    .get(options.taskId) as ScheduledTask | undefined;

  if (!task) {
    clack.log.error(`Task "${options.taskId}" not found.`);
    return;
  }

  const startedAt = new Date().toISOString();
  const start = Date.now();

  let status = 'success';
  let output = '';

  try {
    const parts = task.command.split(/\s+/);
    const cmd = parts[0] ?? '';
    const args = parts.slice(1);
    const result = execFileSync(cmd, args, {
      encoding: 'utf-8',
      timeout: 60_000,
    });
    output = result.slice(0, 10_240);
    clack.log.success(`Task "${options.taskId}" completed successfully.`);
  } catch (err) {
    status = 'error';
    output = err instanceof Error ? err.message : String(err);
    output = output.slice(0, 10_240);
    clack.log.error(`Task "${options.taskId}" failed: ${output}`);
  }

  const durationMs = Date.now() - start;
  const finishedAt = new Date().toISOString();

  options.db
    .prepare('UPDATE scheduled_tasks SET last_run_at = ?, last_status = ? WHERE id = ?')
    .run(finishedAt, status, options.taskId);

  options.db
    .prepare(
      'INSERT INTO task_history (task_id, started_at, finished_at, duration_ms, status, output) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .run(options.taskId, startedAt, finishedAt, durationMs, status, output);
}
