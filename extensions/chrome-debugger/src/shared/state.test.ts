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
  getScreenshotDir,
  readGlobalSession,
  writeGlobalSession,
  deleteGlobalSession,
  isProcessAlive,
  killProcessTree,
} from './state.js';
import type { BrowserState, GlobalBrowserSession } from './types.js';

const TEST_DIR = join(tmpdir(), 'chrome-debugger-test-' + Date.now().toString());

const mockState: BrowserState = {
  wsEndpoint: 'ws://127.0.0.1:9222/devtools/browser/abc123',
  pid: 12345,
  port: 9222,
  launchedAt: '2024-01-15T10:00:00.000Z',
  networkLogPath: join(TEST_DIR, '.renre-kit', 'storage', 'chrome-debugger', 'network.jsonl'),
  consoleLogPath: join(TEST_DIR, '.renre-kit', 'storage', 'chrome-debugger', 'console.jsonl'),
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
      'chrome-debugger',
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
      join(TEST_DIR, '.renre-kit', 'storage', 'chrome-debugger')
    );
  });
});

describe('getScreenshotDir', () => {
  it('returns the screenshots subdirectory path', () => {
    const ssDir = getScreenshotDir(TEST_DIR);
    expect(ssDir).toBe(
      join(TEST_DIR, '.renre-kit', 'storage', 'chrome-debugger', 'screenshots')
    );
  });
});

describe('readGlobalSession', () => {
  const GLOBAL_DIR = join(tmpdir(), 'chrome-debugger-global-test-' + Date.now().toString());
  const originalEnv = process.env.RENRE_KIT_HOME;

  beforeEach(() => {
    process.env.RENRE_KIT_HOME = GLOBAL_DIR;
    mkdirSync(GLOBAL_DIR, { recursive: true });
  });

  afterEach(() => {
    process.env.RENRE_KIT_HOME = originalEnv;
    rmSync(GLOBAL_DIR, { recursive: true, force: true });
  });

  it('returns null when no session file exists', () => {
    expect(readGlobalSession()).toBeNull();
  });

  it('reads and parses existing global session', () => {
    const session: GlobalBrowserSession = {
      wsEndpoint: 'ws://127.0.0.1:9222/devtools/browser/abc',
      pid: 42,
      port: 9222,
      projectPath: '/tmp/proj',
      launchedAt: '2024-01-01T00:00:00Z',
      lastSeenAt: '2024-01-01T00:01:00Z',
      headless: true,
      networkLogPath: '/tmp/net.jsonl',
      consoleLogPath: '/tmp/con.jsonl',
    };
    writeGlobalSession(session);
    expect(readGlobalSession()).toEqual(session);
  });
});

describe('writeGlobalSession', () => {
  const GLOBAL_DIR = join(tmpdir(), 'chrome-debugger-global-write-test-' + Date.now().toString());
  const originalEnv = process.env.RENRE_KIT_HOME;

  beforeEach(() => {
    process.env.RENRE_KIT_HOME = GLOBAL_DIR;
  });

  afterEach(() => {
    process.env.RENRE_KIT_HOME = originalEnv;
    rmSync(GLOBAL_DIR, { recursive: true, force: true });
  });

  it('creates directory and writes session file', () => {
    const session: GlobalBrowserSession = {
      wsEndpoint: 'ws://127.0.0.1:9222',
      pid: 100,
      port: 9222,
      projectPath: '/tmp/proj',
      launchedAt: '2024-01-01T00:00:00Z',
      lastSeenAt: '2024-01-01T00:00:00Z',
      headless: false,
      networkLogPath: '/tmp/net.jsonl',
      consoleLogPath: '/tmp/con.jsonl',
    };
    writeGlobalSession(session);

    const sessionPath = join(GLOBAL_DIR, 'browser-session.json');
    expect(existsSync(sessionPath)).toBe(true);
    const raw = readFileSync(sessionPath, 'utf-8');
    expect(JSON.parse(raw)).toEqual(session);
  });

  it('overwrites existing session', () => {
    const session1: GlobalBrowserSession = {
      wsEndpoint: 'ws://127.0.0.1:9222',
      pid: 100,
      port: 9222,
      projectPath: '/tmp/proj',
      launchedAt: '2024-01-01T00:00:00Z',
      lastSeenAt: '2024-01-01T00:00:00Z',
      headless: false,
      networkLogPath: '/tmp/net.jsonl',
      consoleLogPath: '/tmp/con.jsonl',
    };
    writeGlobalSession(session1);

    const session2 = { ...session1, pid: 200 };
    writeGlobalSession(session2);

    const result = readGlobalSession();
    expect(result?.pid).toBe(200);
  });
});

describe('deleteGlobalSession', () => {
  const GLOBAL_DIR = join(tmpdir(), 'chrome-debugger-global-del-test-' + Date.now().toString());
  const originalEnv = process.env.RENRE_KIT_HOME;

  beforeEach(() => {
    process.env.RENRE_KIT_HOME = GLOBAL_DIR;
    mkdirSync(GLOBAL_DIR, { recursive: true });
  });

  afterEach(() => {
    process.env.RENRE_KIT_HOME = originalEnv;
    rmSync(GLOBAL_DIR, { recursive: true, force: true });
  });

  it('deletes existing session file', () => {
    const session: GlobalBrowserSession = {
      wsEndpoint: 'ws://127.0.0.1:9222',
      pid: 100,
      port: 9222,
      projectPath: '/tmp/proj',
      launchedAt: '2024-01-01T00:00:00Z',
      lastSeenAt: '2024-01-01T00:00:00Z',
      headless: false,
      networkLogPath: '/tmp/net.jsonl',
      consoleLogPath: '/tmp/con.jsonl',
    };
    writeGlobalSession(session);
    expect(readGlobalSession()).not.toBeNull();

    deleteGlobalSession();
    expect(readGlobalSession()).toBeNull();
  });

  it('does not throw when session file does not exist', () => {
    expect(() => deleteGlobalSession()).not.toThrow();
  });
});

describe('isProcessAlive', () => {
  it('returns true for current process PID', () => {
    expect(isProcessAlive(process.pid)).toBe(true);
  });

  it('returns false for a non-existent PID', () => {
    // Use a very high PID that is extremely unlikely to exist
    expect(isProcessAlive(4294967)).toBe(false);
  });
});

describe('killProcessTree', () => {
  it('does not throw for a non-existent PID', () => {
    expect(() => killProcessTree(4294967)).not.toThrow();
  });
});
