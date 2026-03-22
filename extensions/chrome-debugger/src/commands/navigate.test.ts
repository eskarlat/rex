import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ExecutionContext } from '../shared/types.js';

const mockGoto = vi.fn();
const mockTitle = vi.fn();
const mockUrl = vi.fn();
const mockDisconnect = vi.fn();

vi.mock('puppeteer', () => ({
  default: {
    connect: vi.fn().mockImplementation(() =>
      Promise.resolve({
        pages: () => Promise.resolve([{ goto: mockGoto, title: mockTitle, url: mockUrl }]),
        disconnect: mockDisconnect,
        connected: true,
        on: vi.fn(),
      })
    ),
  },
}));

vi.mock('../shared/state.js', () => ({
  ensureBrowserRunning: vi.fn().mockReturnValue({
    wsEndpoint: 'ws://localhost:9222',
    pid: 1234,
    port: 9222,
    launchedAt: '2024-01-01T00:00:00Z',
    networkLogPath: '/tmp/network.jsonl',
    consoleLogPath: '/tmp/console.jsonl',
  }),
}));

import navigate from './navigate.js';

function makeContext(args: Record<string, unknown> = {}): ExecutionContext {
  return {
    projectName: 'test',
    projectPath: '/tmp/test-project',
    args: { _positional: [], ...args },
    config: {},
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGoto.mockResolvedValue({ status: () => 200 });
  mockTitle.mockResolvedValue('Example Page');
  mockUrl.mockReturnValue('https://example.com');
});

describe('navigate', () => {
  it('returns error when url is missing', async () => {
    const result = await navigate(makeContext());
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('--url is required');
  });

  it('navigates to the given URL and returns page info', async () => {
    const result = await navigate(makeContext({ url: 'https://example.com' }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Navigated');
    expect(result.output).toContain('https://example.com');
    expect(result.output).toContain('Example Page');
    expect(result.output).toContain('200');
    expect(mockGoto).toHaveBeenCalledWith('https://example.com', {
      waitUntil: 'domcontentloaded',
    });
  });

  it('respects wait=load option', async () => {
    await navigate(makeContext({ url: 'https://example.com', wait: 'load' }));
    expect(mockGoto).toHaveBeenCalledWith('https://example.com', {
      waitUntil: 'load',
    });
  });

  it('keeps connection cached after execution', async () => {
    await navigate(makeContext({ url: 'https://example.com' }));
    expect(mockDisconnect).not.toHaveBeenCalled();
  });
});
