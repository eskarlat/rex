import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { ExecutionContext } from '../shared/types.js';

import clearLogs from './clear-logs.js';

const TEST_DIR = join(tmpdir(), 'renre-devtools-clearlogs-test-' + Date.now().toString());
const STORAGE_DIR = join(TEST_DIR, '.renre-kit', 'storage', 'renre-devtools');

function makeContext(): ExecutionContext {
  return {
    projectName: 'test',
    projectPath: TEST_DIR,
    args: { _positional: [] },
    config: {},
  };
}

beforeEach(() => {
  mkdirSync(STORAGE_DIR, { recursive: true });
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('clear-logs', () => {
  it('clears existing log files', () => {
    const networkLog = join(STORAGE_DIR, 'network.jsonl');
    const consoleLog = join(STORAGE_DIR, 'console.jsonl');
    writeFileSync(networkLog, 'some network data\n');
    writeFileSync(consoleLog, 'some console data\n');

    const result = clearLogs(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.cleared).toBe(2);
    expect(output.files).toEqual(['network.jsonl', 'console.jsonl']);

    expect(readFileSync(networkLog, 'utf-8')).toBe('');
    expect(readFileSync(consoleLog, 'utf-8')).toBe('');
  });

  it('handles missing log files gracefully', () => {
    const result = clearLogs(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.cleared).toBe(0);
  });

  it('clears only existing files when one is missing', () => {
    const networkLog = join(STORAGE_DIR, 'network.jsonl');
    writeFileSync(networkLog, 'network data\n');

    const result = clearLogs(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.cleared).toBe(1);

    expect(readFileSync(networkLog, 'utf-8')).toBe('');
  });
});
