import { execFileSync } from 'node:child_process';

const MAX_OUTPUT_LENGTH = 10_240;

export interface TaskExecResult {
  status: 'success' | 'error';
  output: string;
  durationMs: number;
  startedAt: string;
  finishedAt: string;
}

export function executeTaskCommand(
  command: string,
  parseCommand: (input: string) => string[],
): TaskExecResult {
  const startedAt = new Date().toISOString();
  const start = Date.now();
  let status: 'success' | 'error' = 'success';
  let output = '';

  try {
    const parts = parseCommand(command);
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

  return { status, output, durationMs, startedAt, finishedAt };
}
