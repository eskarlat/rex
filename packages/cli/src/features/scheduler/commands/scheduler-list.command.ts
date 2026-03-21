import * as clack from '@clack/prompts';
import type Database from 'better-sqlite3';

interface ScheduledTask {
  id: string;
  name: string;
  type: string;
  project_path: string | null;
  cron: string;
  command: string;
  enabled: number;
  last_run_at: string | null;
  last_status: string | null;
  next_run_at: string;
}

interface SchedulerListOptions {
  projectPath: string | null;
  db: Database.Database;
}

export function handleSchedulerList(options: SchedulerListOptions): void {
  const tasks = options.projectPath
    ? (options.db
        .prepare('SELECT * FROM scheduled_tasks WHERE project_path = ? OR project_path IS NULL')
        .all(options.projectPath) as ScheduledTask[])
    : (options.db.prepare('SELECT * FROM scheduled_tasks').all() as ScheduledTask[]);

  if (tasks.length === 0) {
    clack.log.info('No scheduled tasks.');
    return;
  }

  const lines = tasks.map((t) => {
    const status = t.enabled ? 'enabled' : 'paused';
    const lastRun = t.last_run_at ?? 'never';
    const lastStatus = t.last_status ?? '-';
    return `  ${t.id} [${status}] ${t.cron} → ${t.command}\n    Last: ${lastRun} (${lastStatus}) | Next: ${t.next_run_at}`;
  });

  clack.log.info(`Scheduled tasks:\n${lines.join('\n')}`);
}
