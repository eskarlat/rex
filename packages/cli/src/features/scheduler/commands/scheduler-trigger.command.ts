import * as clack from '@clack/prompts';
import type Database from 'better-sqlite3';
import { executeTaskCommand } from '../../../shared/task-execution.js';

interface ScheduledTask {
  id: string;
  command: string;
  enabled: number;
}

interface SchedulerTriggerOptions {
  taskId: string;
  db: Database.Database;
}

interface ParseState {
  tokens: string[];
  current: string;
  inSingle: boolean;
  inDouble: boolean;
  escaped: boolean;
}

function createParseState(): ParseState {
  return { tokens: [], current: '', inSingle: false, inDouble: false, escaped: false };
}

function isQuoteToggle(ch: string, state: ParseState): boolean {
  return (ch === "'" && !state.inDouble) || (ch === '"' && !state.inSingle);
}

function processChar(ch: string, state: ParseState): void {
  if (state.escaped) {
    state.current += ch;
    state.escaped = false;
    return;
  }
  if (ch === '\\' && !state.inSingle) {
    state.escaped = true;
    return;
  }
  if (isQuoteToggle(ch, state)) {
    if (ch === "'") state.inSingle = !state.inSingle;
    else state.inDouble = !state.inDouble;
    return;
  }
  if (/\s/.test(ch) && !state.inSingle && !state.inDouble) {
    if (state.current.length > 0) {
      state.tokens.push(state.current);
      state.current = '';
    }
    return;
  }
  state.current += ch;
}

export function parseCommandString(input: string): string[] {
  const state = createParseState();
  for (const ch of input) {
    processChar(ch, state);
  }
  if (state.current.length > 0) {
    state.tokens.push(state.current);
  }
  return state.tokens;
}

export function handleSchedulerTrigger(options: SchedulerTriggerOptions): void {
  const task = options.db
    .prepare('SELECT * FROM scheduled_tasks WHERE id = ?')
    .get(options.taskId) as ScheduledTask | undefined;

  if (!task) {
    clack.log.error(`Task "${options.taskId}" not found.`);
    return;
  }

  const result = executeTaskCommand(task.command, parseCommandString);
  const { status, output, durationMs, startedAt, finishedAt } = result;

  if (status === 'success') {
    clack.log.success(`Task "${options.taskId}" completed successfully.`);
  } else {
    clack.log.error(`Task "${options.taskId}" failed: ${output}`);
  }

  options.db
    .prepare('UPDATE scheduled_tasks SET last_run_at = ?, last_status = ? WHERE id = ?')
    .run(finishedAt, status, options.taskId);

  options.db
    .prepare(
      'INSERT INTO task_history (task_id, started_at, finished_at, duration_ms, status, output) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .run(options.taskId, startedAt, finishedAt, durationMs, status, output);
}
