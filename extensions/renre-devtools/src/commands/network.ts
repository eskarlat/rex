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

export default function network(context: ExecutionContext): CommandResult {
  const state = ensureBrowserRunning(context.projectPath);
  const filter = typeof context.args.filter === 'string' ? context.args.filter : null;
  const method = typeof context.args.method === 'string' ? context.args.method.toUpperCase() : null;
  const limit = typeof context.args.limit === 'number' ? context.args.limit : 50;

  if (!existsSync(state.networkLogPath)) {
    return { output: 'No network requests captured yet.', exitCode: 0 };
  }

  const raw = readFileSync(state.networkLogPath, 'utf-8').trim();
  if (raw.length === 0) {
    return { output: 'No network requests captured yet.', exitCode: 0 };
  }

  let entries: NetworkEntry[] = raw
    .split('\n')
    .map((line) => JSON.parse(line) as NetworkEntry);

  if (filter) {
    const pattern = filter.toLowerCase();
    entries = entries.filter((e) => e.url.toLowerCase().includes(pattern));
  }

  if (method) {
    entries = entries.filter((e) => e.method === method);
  }

  entries = entries.slice(-limit);

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
