import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ExecutionContext } from '../shared/types.js';

const mockExecPath = vi.fn();

vi.mock('puppeteer', () => ({
  default: {
    executablePath: (...args: unknown[]) => mockExecPath(...args),
  },
}));

const mockExistsSync = vi.fn();

vi.mock('node:fs', () => ({
  existsSync: (...args: unknown[]) => mockExistsSync(...args),
}));

import chromeCheck from './chrome-check.js';

function makeContext(): ExecutionContext {
  return {
    projectName: 'test',
    projectPath: '/tmp/test-project',
    args: { _positional: [] },
    config: {},
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('chrome-check', () => {
  it('returns bundled chromium when puppeteer path exists', () => {
    mockExecPath.mockReturnValue('/home/user/.cache/puppeteer/chromium/chrome');
    mockExistsSync.mockReturnValue(true);

    const result = chromeCheck(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.found).toBe(true);
    expect(output.source).toBe('puppeteer');
    expect(output.path).toBe('/home/user/.cache/puppeteer/chromium/chrome');
  });

  it('returns system chrome when bundled not found but system exists', () => {
    mockExecPath.mockReturnValue('/home/user/.cache/puppeteer/chromium/chrome');
    // First call: bundled check returns false
    // Subsequent calls: system paths
    mockExistsSync.mockImplementation((path: string) => {
      if (path === '/home/user/.cache/puppeteer/chromium/chrome') return false;
      if (path === '/usr/bin/google-chrome') return true;
      return false;
    });

    const result = chromeCheck(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.found).toBe(true);
    expect(output.source).toBe('system');
  });

  it('returns not found when nothing available', () => {
    mockExecPath.mockReturnValue('/home/user/.cache/puppeteer/chromium/chrome');
    mockExistsSync.mockReturnValue(false);

    const result = chromeCheck(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.found).toBe(false);
    expect(output.canInstall).toBe(true);
  });

  it('falls through when executablePath throws', () => {
    mockExecPath.mockImplementation(() => {
      throw new Error('No browser installed');
    });
    mockExistsSync.mockReturnValue(false);

    const result = chromeCheck(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.found).toBe(false);
    expect(output.canInstall).toBe(true);
  });
});
