import { execFileSync } from 'node:child_process';
import { getDb } from '@renre-kit/cli/lib';
import { Cron } from 'croner';

const TICK_INTERVAL_MS = 60_000;
const MAX_OUTPUT_LENGTH = 10_240;

interface ScheduledTaskRow {
  id: number;
  name: string;
  command: string;
  cron: string;
  enabled: number;
  next_run_at: string | null;
  last_run_at: string | null;
  last_status: string | null;
}

function computeNextRun(cronExpression: string): string {
  const job = new Cron(cronExpression);
  const next = job.nextRun();
  if (!next) {
    throw new Error(`No next run for cron expression: ${cronExpression}`);
  }
  return next.toISOString();
}

export function parseCommandString(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  let escaped = false;

  for (const ch of input) {
    if (escaped) {
      current += ch;
      escaped = false;
    } else if (ch === '\\' && !inSingle) {
      escaped = true;
    } else if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
    } else if (/\s/.test(ch) && !inSingle && !inDouble) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
    } else {
      current += ch;
    }
  }
  if (current.length > 0) {
    tokens.push(current);
  }
  return tokens;
}

function executeDueTask(task: ScheduledTaskRow): void {
  const db = getDb();
  const startedAt = new Date().toISOString();
  const start = Date.now();
  let status = 'success';
  let output = '';

  // Execute the command
  try {
    const parts = parseCommandString(task.command);
    const cmd = parts[0] ?? '';
    const args = parts.slice(1);
    const result = execFileSync(cmd, args, {
      encoding: 'utf-8',
      timeout: 60_000,
    });
    output = result.slice(0, MAX_OUTPUT_LENGTH);
  } catch (err) {
    status = 'error';
    output = err instanceof Error ? err.message : String(err);
    output = output.slice(0, MAX_OUTPUT_LENGTH);
  }

  const durationMs = Date.now() - start;
  const finishedAt = new Date().toISOString();

  // Compute next run
  let nextRun: string | null;
  try {
    nextRun = computeNextRun(task.cron);
  } catch {
    // Invalid cron — disable further scheduling
    nextRun = null;
    if (status === 'success') {
      status = 'error';
    }
  }

  // Update task record
  db.prepare(
    'UPDATE scheduled_tasks SET last_run_at = ?, last_status = ?, next_run_at = ? WHERE id = ?',
  ).run(finishedAt, status, nextRun, task.id);

  // Record history
  db.prepare(
    'INSERT INTO task_history (task_id, started_at, finished_at, duration_ms, status, output) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(task.id, startedAt, finishedAt, durationMs, status, output);
}

export class SchedulerRunner {
  private timer: ReturnType<typeof setInterval> | null = null;

  start(): void {
    if (this.timer) {
      return;
    }
    this.timer = setInterval(() => {
      this.tick();
    }, TICK_INTERVAL_MS);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  tick(): void {
    const db = getDb();
    const now = new Date().toISOString();

    const dueTasks = db.prepare(
      'SELECT * FROM scheduled_tasks WHERE enabled = 1 AND next_run_at <= ?',
    ).all(now) as ScheduledTaskRow[];

    for (const task of dueTasks) {
      executeDueTask(task);
    }
  }

  /** Initialize next_run_at for tasks that have none set */
  initializeNextRuns(): void {
    const db = getDb();
    const tasks = db.prepare(
      'SELECT * FROM scheduled_tasks WHERE enabled = 1 AND next_run_at IS NULL',
    ).all() as ScheduledTaskRow[];

    for (const task of tasks) {
      try {
        const nextRun = computeNextRun(task.cron);
        db.prepare('UPDATE scheduled_tasks SET next_run_at = ? WHERE id = ?').run(nextRun, task.id);
      } catch {
        // Invalid cron expression — skip
      }
    }
  }
}
