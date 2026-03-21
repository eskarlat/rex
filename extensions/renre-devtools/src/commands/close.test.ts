import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { ExecutionContext } from '../shared/types.js';
import { writeState, readState } from '../shared/state.js';

const mockClose = vi.fn();

vi.mock('puppeteer', () => ({
  default: {
    connect: vi.fn().mockImplementation(() =>
      Promise.resolve({
        close: mockClose,
      })
    ),
  },
}));

import close from './close.js';

const TEST_DIR = join(tmpdir(), 'renre-devtools-close-test-' + Date.now().toString());
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
  vi.clearAllMocks();
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('close', () => {
  it('returns error when no browser is running', async () => {
    const result = await close(makeContext());
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('No browser is running');
  });

  it('closes browser and cleans up state', async () => {
    const networkLog = join(STORAGE_DIR, 'network.jsonl');
    const consoleLog = join(STORAGE_DIR, 'console.jsonl');

    writeState(TEST_DIR, {
      wsEndpoint: 'ws://localhost:9222',
      pid: 99999,
      port: 9222,
      launchedAt: '2024-01-01T00:00:00Z',
      networkLogPath: networkLog,
      consoleLogPath: consoleLog,
    });
    writeFileSync(networkLog, 'log data');
    writeFileSync(consoleLog, 'console data');

    const result = await close(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Browser Closed');
    expect(result.output).toContain('99999');
    expect(mockClose).toHaveBeenCalled();

    // State should be deleted
    expect(readState(TEST_DIR)).toBeNull();

    // Log files should be cleaned up
    expect(existsSync(networkLog)).toBe(false);
    expect(existsSync(consoleLog)).toBe(false);
  });
});
