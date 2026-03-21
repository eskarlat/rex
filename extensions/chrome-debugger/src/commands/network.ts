import { existsSync, readFileSync } from 'node:fs';

import { ensureBrowserRunning } from '../shared/state.js';
import {
  markdownTable,
  truncate,
  formatBytes,
  formatDuration,
  formatTimestamp,
} from '../shared/formatters.js';
import type { ExecutionContext, CommandResult, NetworkEntry } from '../shared/types.js';

function emptyResponse(format: string): CommandResult {
  if (format === 'json') {
    return { output: JSON.stringify({ entries: [], total: 0 }), exitCode: 0 };
  }
  return { output: 'No network requests captured yet.', exitCode: 0 };
}

function parseArgs(context: ExecutionContext): { filter: string | null; method: string | null; limit: number; offset: number; format: string } {
  return {
    filter: typeof context.args.filter === 'string' ? context.args.filter : null,
    method: typeof context.args.method === 'string' ? context.args.method.toUpperCase() : null,
    limit: typeof context.args.limit === 'number' ? context.args.limit : 50,
    offset: typeof context.args.offset === 'number' ? context.args.offset : 0,
    format: context.args.format === 'json' ? 'json' : 'markdown',
  };
}

function applyFilters(entries: NetworkEntry[], filter: string | null, method: string | null): NetworkEntry[] {
  let result = entries;
  if (filter) {
    const pattern = filter.toLowerCase();
    result = result.filter((e) => e.url.toLowerCase().includes(pattern));
  }
  if (method) {
    result = result.filter((e) => e.method === method);
  }
  return result;
}

function formatAsJson(entries: NetworkEntry[], total: number): CommandResult {
  return {
    output: JSON.stringify({ entries, total }),
    exitCode: 0,
  };
}

function formatAsMarkdown(entries: NetworkEntry[]): CommandResult {
  const rows = entries.map((e) => [
    formatTimestamp(e.timestamp),
    e.method,
    String(e.status),
    e.type,
    truncate(e.url, 60),
    formatBytes(e.size),
    formatDuration(e.duration),
  ]);

  const table = markdownTable(
    ['Time', 'Method', 'Status', 'Type', 'URL', 'Size', 'Duration'],
    rows
  );

  return {
    output: [`## Network Requests (${String(entries.length)})`, '', table].join('\n'),
    exitCode: 0,
  };
}

export default function network(context: ExecutionContext): CommandResult {
  const state = ensureBrowserRunning(context.projectPath);
  const { filter, method, limit, offset, format } = parseArgs(context);

  if (!existsSync(state.networkLogPath)) {
    return emptyResponse(format);
  }

  const raw = readFileSync(state.networkLogPath, 'utf-8').trim();
  if (raw.length === 0) {
    return emptyResponse(format);
  }

  const allLines = raw.split('\n');
  const parsed: NetworkEntry[] = allLines
    .slice(offset)
    .map((line) => JSON.parse(line) as NetworkEntry);

  const filtered = applyFilters(parsed, filter, method);
  const entries = filtered.slice(-limit);

  return format === 'json'
    ? formatAsJson(entries, allLines.length)
    : formatAsMarkdown(entries);
}
