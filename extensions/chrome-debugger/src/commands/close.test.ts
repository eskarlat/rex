import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { ExecutionContext } from '../shared/types.js';
import { writeState, readState } from '../shared/state.js';

const mockClose = vi.fn();
const mockDisconnectCached = vi.fn();

vi.mock('puppeteer', () => ({
  default: {
    connect: vi.fn().mockImplementation(() =>
      Promise.resolve({
        close: mockClose,
        connected: true,
        on: vi.fn(),
        disconnect: vi.fn(),
      })
    ),
  },
}));

vi.mock('../shared/connection.js', async () => {
  const actual = await vi.importActual<typeof import('../shared/connection.js')>('../shared/connection.js');
  return {
    ...actual,
    disconnectCachedBrowser: (...args: unknown[]) => mockDisconnectCached(...args),
  };
});

import close from './close.js';

const TEST_DIR = join(tmpdir(), 'chrome-debugger-close-test-' + Date.now().toString());
const STORAGE_DIR = join(TEST_DIR, '.renre-kit', 'storage', 'chrome-debugger');

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
  vi.clearAllMocks();
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('close', () => {
  it('returns error when no browser is running', async () => {
    const result = await close.handler(makeContext());
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('No browser is running');
  });

  it('closes browser and cleans up state', async () => {
    const networkLog = join(STORAGE_DIR, 'network.jsonl');
    const consoleLog = join(STORAGE_DIR, 'console.jsonl');

    writeState(TEST_DIR, {
      wsEndpoint: 'ws://localhost:9222',
      pid: process.pid,
      port: 9222,
      launchedAt: '2024-01-01T00:00:00Z',
      networkLogPath: networkLog,
      consoleLogPath: consoleLog,
    });
    writeFileSync(networkLog, 'log data');
    writeFileSync(consoleLog, 'console data');

    const result = await close.handler(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Browser Closed');
    expect(result.output).toContain(String(process.pid));
    expect(mockClose).toHaveBeenCalled();
    expect(mockDisconnectCached).toHaveBeenCalled();

    // State should be deleted
    expect(readState(TEST_DIR)).toBeNull();

    // Log files should be cleaned up
    expect(existsSync(networkLog)).toBe(false);
    expect(existsSync(consoleLog)).toBe(false);
  });
});
