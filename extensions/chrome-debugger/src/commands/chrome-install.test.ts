import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ExecutionContext } from '../shared/types.js';

const mockLaunch = vi.fn();

vi.mock('puppeteer', () => ({
  default: {
    launch: (...args: unknown[]) => mockLaunch(...args),
  },
}));

import chromeInstall from './chrome-install.js';

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

describe('chrome-install', () => {
  it('returns installed:true with path on success', async () => {
    const mockClose = vi.fn().mockResolvedValue(undefined);
    mockLaunch.mockResolvedValue({
      process: () => ({ spawnfile: '/path/to/chromium' }),
      close: mockClose,
    });

    const result = await chromeInstall(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.installed).toBe(true);
    expect(output.path).toBe('/path/to/chromium');
    expect(mockClose).toHaveBeenCalled();
    expect(mockLaunch).toHaveBeenCalledWith({ headless: true });
  });

  it('returns "unknown" when process() returns null', async () => {
    const mockClose = vi.fn().mockResolvedValue(undefined);
    mockLaunch.mockResolvedValue({
      process: () => null,
      close: mockClose,
    });

    const result = await chromeInstall(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.installed).toBe(true);
    expect(output.path).toBe('unknown');
  });

  it('returns installed:false with error on failure', async () => {
    mockLaunch.mockRejectedValue(new Error('Download failed'));

    const result = await chromeInstall(makeContext());
    expect(result.exitCode).toBe(1);
    const output = JSON.parse(result.output);
    expect(output.installed).toBe(false);
    expect(output.error).toBe('Download failed');
  });

  it('handles non-Error thrown values', async () => {
    mockLaunch.mockRejectedValue('string error');

    const result = await chromeInstall(makeContext());
    expect(result.exitCode).toBe(1);
    const output = JSON.parse(result.output);
    expect(output.installed).toBe(false);
    expect(output.error).toBe('string error');
  });
});
