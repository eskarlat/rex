import { existsSync, readFileSync } from 'node:fs';

import { ensureBrowserRunning } from '../shared/state.js';
import { markdownTable, truncate, formatTimestamp } from '../shared/formatters.js';
import type { ExecutionContext, CommandResult, ConsoleEntry } from '../shared/types.js';

function emptyResponse(format: string): CommandResult {
  if (format === 'json') {
    return { output: JSON.stringify({ entries: [], total: 0 }), exitCode: 0 };
  }
  return { output: 'No console messages captured yet.', exitCode: 0 };
}

function parseArgs(context: ExecutionContext): { levelFilter: string | null; limit: number; offset: number; format: string } {
  return {
    levelFilter: typeof context.args.level === 'string' ? context.args.level : null,
    limit: typeof context.args.limit === 'number' ? context.args.limit : 50,
    offset: typeof context.args.offset === 'number' ? context.args.offset : 0,
    format: context.args.format === 'json' ? 'json' : 'markdown',
  };
}

function formatAsJson(entries: ConsoleEntry[], total: number): CommandResult {
  return {
    output: JSON.stringify({ entries, total }),
    exitCode: 0,
  };
}

function formatAsMarkdown(entries: ConsoleEntry[]): CommandResult {
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

export default function consoleCommand(context: ExecutionContext): CommandResult {
  const state = ensureBrowserRunning(context.projectPath);
  const { levelFilter, limit, offset, format } = parseArgs(context);

  if (!existsSync(state.consoleLogPath)) {
    return emptyResponse(format);
  }

  const raw = readFileSync(state.consoleLogPath, 'utf-8').trim();
  if (raw.length === 0) {
    return emptyResponse(format);
  }

  const allLines = raw.split('\n');
  let entries: ConsoleEntry[] = allLines
    .slice(offset)
    .map((line) => JSON.parse(line) as ConsoleEntry);

  if (levelFilter) {
    entries = entries.filter((e) => e.level === levelFilter);
  }

  entries = entries.slice(-limit);

  return format === 'json'
    ? formatAsJson(entries, allLines.length)
    : formatAsMarkdown(entries);
}
