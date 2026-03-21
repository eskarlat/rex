import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { ExecutionContext } from '../shared/types.js';

const TEST_DIR = join(tmpdir(), 'renre-devtools-console-test-' + Date.now().toString());
const STORAGE_DIR = join(TEST_DIR, '.renre-kit', 'storage', 'renre-devtools');
const CONSOLE_LOG = join(STORAGE_DIR, 'console.jsonl');

vi.mock('../shared/state.js', () => ({
  ensureBrowserRunning: vi.fn().mockImplementation(() => ({
    wsEndpoint: 'ws://localhost:9222',
    pid: 1234,
    port: 9222,
    launchedAt: '2024-01-01T00:00:00Z',
    networkLogPath: join(STORAGE_DIR, 'network.jsonl'),
    consoleLogPath: CONSOLE_LOG,
  })),
}));

import consoleCommand from './console.js';

function makeContext(args: Record<string, unknown> = {}): ExecutionContext {
  return {
    projectName: 'test',
    projectPath: TEST_DIR,
    args: { _positional: [], ...args },
    config: {},
  };
}

beforeEach(() => {
  mkdirSync(STORAGE_DIR, { recursive: true });
  vi.clearAllMocks();
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('console', () => {
  it('returns message when no log file exists', () => {
    const result = consoleCommand(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('No console messages');
  });

  it('parses and displays console entries', () => {
    const entries = [
      JSON.stringify({ timestamp: '2024-01-15T10:00:00.000Z', level: 'log', text: 'Hello' }),
      JSON.stringify({ timestamp: '2024-01-15T10:00:01.000Z', level: 'error', text: 'Oops' }),
    ];
    writeFileSync(CONSOLE_LOG, entries.join('\n'));

    const result = consoleCommand(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Console Messages (2)');
    expect(result.output).toContain('LOG');
    expect(result.output).toContain('ERROR');
    expect(result.output).toContain('Hello');
    expect(result.output).toContain('Oops');
  });

  it('filters by level', () => {
    const entries = [
      JSON.stringify({ timestamp: '2024-01-15T10:00:00.000Z', level: 'log', text: 'Info msg' }),
      JSON.stringify({ timestamp: '2024-01-15T10:00:01.000Z', level: 'error', text: 'Error msg' }),
    ];
    writeFileSync(CONSOLE_LOG, entries.join('\n'));

    const result = consoleCommand(makeContext({ level: 'error' }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('1)');
    expect(result.output).toContain('Error msg');
    expect(result.output).not.toContain('Info msg');
  });

  it('respects limit parameter', () => {
    const entries = Array.from({ length: 10 }, (_, i) =>
      JSON.stringify({
        timestamp: `2024-01-15T10:00:0${String(i)}.000Z`,
        level: 'log',
        text: `Message ${String(i)}`,
      })
    );
    writeFileSync(CONSOLE_LOG, entries.join('\n'));

    const result = consoleCommand(makeContext({ limit: 3 }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('3)');
  });

  it('respects offset parameter', () => {
    const entries = Array.from({ length: 5 }, (_, i) =>
      JSON.stringify({
        timestamp: `2024-01-15T10:00:0${String(i)}.000Z`,
        level: 'log',
        text: `Message ${String(i)}`,
      })
    );
    writeFileSync(CONSOLE_LOG, entries.join('\n'));

    // Offset 3 means skip first 3 lines, leaving 2 entries
    const result = consoleCommand(makeContext({ offset: 3 }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Console Messages (2)');
    expect(result.output).toContain('Message 3');
    expect(result.output).toContain('Message 4');
    expect(result.output).not.toContain('Message 0');
  });

  it('returns json format when format=json', () => {
    const entries = [
      JSON.stringify({ timestamp: '2024-01-15T10:00:00.000Z', level: 'log', text: 'Hello' }),
      JSON.stringify({ timestamp: '2024-01-15T10:00:01.000Z', level: 'error', text: 'Oops' }),
    ];
    writeFileSync(CONSOLE_LOG, entries.join('\n'));

    const result = consoleCommand(makeContext({ format: 'json' }));
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.entries).toHaveLength(2);
    expect(output.total).toBe(2);
    expect(output.entries[0].text).toBe('Hello');
    expect(output.entries[1].text).toBe('Oops');
  });

  it('returns empty json when no log file and format=json', () => {
    const result = consoleCommand(makeContext({ format: 'json' }));
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.entries).toEqual([]);
    expect(output.total).toBe(0);
  });

  it('returns empty json when log file is empty and format=json', () => {
    writeFileSync(CONSOLE_LOG, '');
    const result = consoleCommand(makeContext({ format: 'json' }));
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.entries).toEqual([]);
    expect(output.total).toBe(0);
  });

  it('combines offset, limit, and format=json', () => {
    const entries = Array.from({ length: 10 }, (_, i) =>
      JSON.stringify({
        timestamp: `2024-01-15T10:00:0${String(i)}.000Z`,
        level: 'log',
        text: `Message ${String(i)}`,
      })
    );
    writeFileSync(CONSOLE_LOG, entries.join('\n'));

    const result = consoleCommand(makeContext({ offset: 2, limit: 3, format: 'json' }));
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.entries).toHaveLength(3);
    expect(output.total).toBe(10);
    // offset=2 skips first 2, then limit=3 takes last 3 of remaining 8 (indices 7,8,9)
    expect(output.entries[0].text).toBe('Message 7');
  });
});
