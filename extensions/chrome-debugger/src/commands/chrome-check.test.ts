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

const mockPlatform = vi.fn();

vi.mock('node:os', () => ({
  platform: () => mockPlatform(),
  homedir: () => '/home/user',
}));

vi.mock('../shared/cdp-probe.js', () => ({
  probeCdpVersion: () => Promise.resolve(null),
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
  mockPlatform.mockReturnValue('linux');
});

describe('chrome-check', () => {
  it('returns bundled chromium when puppeteer path exists', async () => {
    mockExecPath.mockReturnValue('/home/user/.cache/puppeteer/chromium/chrome');
    mockExistsSync.mockReturnValue(true);

    const result = await chromeCheck.handler(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.found).toBe(true);
    expect(output.source).toBe('puppeteer');
    expect(output.path).toBe('/home/user/.cache/puppeteer/chromium/chrome');
  });

  it('returns system chrome when bundled not found but system exists', async () => {
    mockExecPath.mockReturnValue('/home/user/.cache/puppeteer/chromium/chrome');
    mockExistsSync.mockImplementation((path: string) => {
      if (path === '/home/user/.cache/puppeteer/chromium/chrome') return false;
      if (path === '/usr/bin/google-chrome') return true;
      return false;
    });

    const result = await chromeCheck.handler(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.found).toBe(true);
    expect(output.source).toBe('system');
  });

  it('returns not found when nothing available', async () => {
    mockExecPath.mockReturnValue('/home/user/.cache/puppeteer/chromium/chrome');
    mockExistsSync.mockReturnValue(false);

    const result = await chromeCheck.handler(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.found).toBe(false);
    expect(output.canInstall).toBe(true);
  });

  it('falls through when executablePath throws', async () => {
    mockExecPath.mockImplementation(() => {
      throw new Error('No browser installed');
    });
    mockExistsSync.mockReturnValue(false);

    const result = await chromeCheck.handler(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.found).toBe(false);
    expect(output.canInstall).toBe(true);
  });

  it('detects macOS Chrome at standard path', async () => {
    mockPlatform.mockReturnValue('darwin');
    mockExecPath.mockImplementation(() => {
      throw new Error('No browser');
    });
    mockExistsSync.mockImplementation((path: string) => {
      return path === '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    });

    const result = await chromeCheck.handler(makeContext());
    const output = JSON.parse(result.output);
    expect(output.found).toBe(true);
    expect(output.source).toBe('system');
    expect(output.path).toBe('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
  });

  it('detects macOS Chromium', async () => {
    mockPlatform.mockReturnValue('darwin');
    mockExecPath.mockImplementation(() => {
      throw new Error('No browser');
    });
    mockExistsSync.mockImplementation((path: string) => {
      return path === '/Applications/Chromium.app/Contents/MacOS/Chromium';
    });

    const result = await chromeCheck.handler(makeContext());
    const output = JSON.parse(result.output);
    expect(output.found).toBe(true);
    expect(output.source).toBe('system');
  });

  it('detects macOS Edge', async () => {
    mockPlatform.mockReturnValue('darwin');
    mockExecPath.mockImplementation(() => {
      throw new Error('No browser');
    });
    mockExistsSync.mockImplementation((path: string) => {
      return path === '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge';
    });

    const result = await chromeCheck.handler(makeContext());
    const output = JSON.parse(result.output);
    expect(output.found).toBe(true);
    expect(output.source).toBe('system');
  });

  it('detects Windows Chrome in Program Files', async () => {
    mockPlatform.mockReturnValue('win32');
    mockExecPath.mockImplementation(() => {
      throw new Error('No browser');
    });
    mockExistsSync.mockImplementation((path: string) => {
      return path === 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    });

    const result = await chromeCheck.handler(makeContext());
    const output = JSON.parse(result.output);
    expect(output.found).toBe(true);
    expect(output.source).toBe('system');
    expect(output.path).toBe('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe');
  });

  it('detects Windows Edge', async () => {
    mockPlatform.mockReturnValue('win32');
    mockExecPath.mockImplementation(() => {
      throw new Error('No browser');
    });
    mockExistsSync.mockImplementation((path: string) => {
      return path === 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe';
    });

    const result = await chromeCheck.handler(makeContext());
    const output = JSON.parse(result.output);
    expect(output.found).toBe(true);
    expect(output.source).toBe('system');
  });

  it('detects Linux snap chromium', async () => {
    mockPlatform.mockReturnValue('linux');
    mockExecPath.mockImplementation(() => {
      throw new Error('No browser');
    });
    mockExistsSync.mockImplementation((path: string) => {
      return path === '/snap/bin/chromium';
    });

    const result = await chromeCheck.handler(makeContext());
    const output = JSON.parse(result.output);
    expect(output.found).toBe(true);
    expect(output.source).toBe('system');
    expect(output.path).toBe('/snap/bin/chromium');
  });

  it('detects Linux google-chrome-stable', async () => {
    mockPlatform.mockReturnValue('linux');
    mockExecPath.mockImplementation(() => {
      throw new Error('No browser');
    });
    mockExistsSync.mockImplementation((path: string) => {
      return path === '/usr/bin/google-chrome-stable';
    });

    const result = await chromeCheck.handler(makeContext());
    const output = JSON.parse(result.output);
    expect(output.found).toBe(true);
    expect(output.source).toBe('system');
  });
});
