import { existsSync, readFileSync } from 'node:fs';

import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { ensureBrowserRunning } from '../shared/state.js';
import { markdownTable, truncate, formatTimestamp } from '../shared/formatters.js';
import type { CommandResult, ConsoleEntry } from '../shared/types.js';

function emptyResponse(format: string): CommandResult {
  if (format === 'json') {
    return { output: JSON.stringify({ entries: [], total: 0 }), exitCode: 0 };
  }
  return { output: 'No console messages captured yet.', exitCode: 0 };
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

export default defineCommand({
  args: {
    level: z.string().nullable().default(null),
    limit: z.number().default(50),
    offset: z.number().default(0),
    format: z.enum(['json', 'markdown']).default('markdown'),
  },
  handler: (ctx) => {
    const state = ensureBrowserRunning(ctx.projectPath);
    const { level: levelFilter, limit, offset, format } = ctx.args;

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
  },
});
