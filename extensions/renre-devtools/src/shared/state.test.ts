import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, existsSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  readState,
  writeState,
  deleteState,
  ensureBrowserRunning,
  getLogDir,
} from './state.js';
import type { BrowserState } from './types.js';

const TEST_DIR = join(tmpdir(), 'renre-devtools-test-' + Date.now().toString());

const mockState: BrowserState = {
  wsEndpoint: 'ws://127.0.0.1:9222/devtools/browser/abc123',
  pid: 12345,
  port: 9222,
  launchedAt: '2024-01-15T10:00:00.000Z',
  networkLogPath: join(TEST_DIR, '.renre-kit', 'storage', 'renre-devtools', 'network.jsonl'),
  consoleLogPath: join(TEST_DIR, '.renre-kit', 'storage', 'renre-devtools', 'console.jsonl'),
};

beforeEach(() => {
  mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('readState', () => {
  it('returns null when no state file exists', () => {
    expect(readState(TEST_DIR)).toBeNull();
  });

  it('reads and parses existing state file', () => {
    writeState(TEST_DIR, mockState);
    const result = readState(TEST_DIR);
    expect(result).toEqual(mockState);
  });
});

describe('writeState', () => {
  it('creates storage directory and writes state', () => {
    writeState(TEST_DIR, mockState);

    const statePath = join(
      TEST_DIR,
      '.renre-kit',
      'storage',
      'renre-devtools',
      'state.json'
    );
    expect(existsSync(statePath)).toBe(true);

    const raw = readFileSync(statePath, 'utf-8');
    expect(JSON.parse(raw)).toEqual(mockState);
  });

  it('overwrites existing state', () => {
    writeState(TEST_DIR, mockState);
    const updated = { ...mockState, pid: 99999 };
    writeState(TEST_DIR, updated);

    const result = readState(TEST_DIR);
    expect(result?.pid).toBe(99999);
  });
});

describe('deleteState', () => {
  it('deletes existing state file', () => {
    writeState(TEST_DIR, mockState);
    deleteState(TEST_DIR);
    expect(readState(TEST_DIR)).toBeNull();
  });

  it('does not throw when state file does not exist', () => {
    expect(() => deleteState(TEST_DIR)).not.toThrow();
  });
});

describe('ensureBrowserRunning', () => {
  it('returns state when browser is running', () => {
    writeState(TEST_DIR, mockState);
    const result = ensureBrowserRunning(TEST_DIR);
    expect(result).toEqual(mockState);
  });

  it('throws when no browser is running', () => {
    expect(() => ensureBrowserRunning(TEST_DIR)).toThrow(
      'No browser is running'
    );
  });
});

describe('getLogDir', () => {
  it('returns the storage directory path', () => {
    const logDir = getLogDir(TEST_DIR);
    expect(logDir).toBe(
      join(TEST_DIR, '.renre-kit', 'storage', 'renre-devtools')
    );
  });
});
