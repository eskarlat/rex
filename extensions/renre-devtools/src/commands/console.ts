import { existsSync, readFileSync } from 'node:fs';
import { ensureBrowserRunning } from '../shared/state.js';
import { markdownTable, truncate, formatTimestamp } from '../shared/formatters.js';
import type { ExecutionContext, CommandResult, ConsoleEntry } from '../shared/types.js';

export default function consoleCommand(context: ExecutionContext): CommandResult {
  const state = ensureBrowserRunning(context.projectPath);
  const levelFilter =
    typeof context.args.level === 'string' ? context.args.level : null;
  const limit = typeof context.args.limit === 'number' ? context.args.limit : 50;

  if (!existsSync(state.consoleLogPath)) {
    return { output: 'No console messages captured yet.', exitCode: 0 };
  }

  const raw = readFileSync(state.consoleLogPath, 'utf-8').trim();
  if (raw.length === 0) {
    return { output: 'No console messages captured yet.', exitCode: 0 };
  }

  let entries: ConsoleEntry[] = raw
    .split('\n')
    .map((line) => JSON.parse(line) as ConsoleEntry);

  if (levelFilter) {
    entries = entries.filter((e) => e.level === levelFilter);
  }

  entries = entries.slice(-limit);

  const rows = entries.map((e) => [
    formatTimestamp(e.timestamp),
    e.level.toUpperCase(),
    truncate(e.text, 80),
  ]);

  const table = markdownTable(['Time', 'Level', 'Message'], rows);

  return {
    output: [`## Console Messages (${String(entries.length)})`, '', table].join('\n'),
    exitCode: 0,
  };
}
