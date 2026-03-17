import { getDb } from '@renre-kit/cli/lib';
import { parseExpression } from 'cron-parser';

const TICK_INTERVAL_MS = 60_000;

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
  const interval = parseExpression(cronExpression);
  return interval.next().toISOString();
}

function executeDueTask(task: ScheduledTaskRow): void {
  const db = getDb();
  const now = new Date().toISOString();
  let status = 'success';

  try {
    // Record execution start
    db.prepare(
      'INSERT INTO task_history (task_id, started_at, status) VALUES (?, ?, ?)',
    ).run(task.id, now, 'running');
  } catch {
    status = 'failed';
  }

  // Compute next run
  let nextRun: string;
  try {
    nextRun = computeNextRun(task.cron);
  } catch {
    nextRun = '';
    status = 'failed';
  }

  // Update task record
  db.prepare(
    'UPDATE scheduled_tasks SET last_run_at = ?, last_status = ?, next_run_at = ? WHERE id = ?',
  ).run(now, status, nextRun, task.id);

  // Update history record
  db.prepare(
    'UPDATE task_history SET status = ?, finished_at = ? WHERE task_id = ? AND started_at = ?',
  ).run(status, new Date().toISOString(), task.id, now);
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
