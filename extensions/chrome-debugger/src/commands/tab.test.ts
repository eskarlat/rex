import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ExecutionContext } from '../shared/types.js';

const mockBringToFront = vi.fn();
const mockTitle = vi.fn();
const mockUrl = vi.fn();
const mockDisconnect = vi.fn();

const mockEnsureBrowserRunning = vi.fn();

vi.mock('../shared/connection.js', () => ({
  connectBrowser: vi.fn().mockImplementation(() =>
    Promise.resolve({
      disconnect: mockDisconnect,
    })
  ),
  getPageByIndex: vi.fn().mockImplementation((_browser: unknown, index: number) => {
    if (index === 99) {
      return Promise.reject(new Error('Tab index 99 out of range (2 tabs open)'));
    }
    return Promise.resolve({
      bringToFront: mockBringToFront,
      title: mockTitle,
      url: mockUrl,
    });
  }),
}));

vi.mock('../shared/state.js', () => ({
  ensureBrowserRunning: (...args: unknown[]) => mockEnsureBrowserRunning(...args),
}));

import tab from './tab.js';

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
  mockEnsureBrowserRunning.mockReturnValue({
    wsEndpoint: 'ws://localhost:9222',
    pid: 1234,
    port: 9222,
    launchedAt: '2024-01-01T00:00:00Z',
    networkLogPath: '/tmp/network.jsonl',
    consoleLogPath: '/tmp/console.jsonl',
  });
  mockBringToFront.mockResolvedValue(undefined);
  mockTitle.mockResolvedValue('Tab Title');
  mockUrl.mockReturnValue('https://example.com/page');
});

describe('tab', () => {
  it('returns error when index is not provided', async () => {
    const result = await tab.handler(makeContext());
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('--index <number> is required');
  });

  it('returns error when index is NaN', async () => {
    const result = await tab.handler(makeContext({ index: 'abc' }));
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('--index <number> is required');
  });

  it('switches to tab by --index arg', async () => {
    const result = await tab.handler(makeContext({ index: 1 }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Switched Tab');
    expect(result.output).toContain('**Index**: 1');
    expect(result.output).toContain('**Title**: Tab Title');
    expect(result.output).toContain('**URL**: https://example.com/page');
    expect(mockBringToFront).toHaveBeenCalled();
  });

  it('switches to tab using positional arg', async () => {
    const result = await tab.handler({
      projectName: 'test',
      projectPath: '/tmp/test-project',
      args: { _positional: [0] },
      config: {},
    });
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('**Index**: 0');
  });

  it('prefers --index over positional arg', async () => {
    const result = await tab.handler({
      projectName: 'test',
      projectPath: '/tmp/test-project',
      args: { _positional: [5], index: 1 },
      config: {},
    });
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('**Index**: 1');
  });

  it('keeps connection cached after execution', async () => {
    await tab.handler(makeContext({ index: 0 }));
    expect(mockDisconnect).not.toHaveBeenCalled();
  });

  it('keeps connection cached even on error', async () => {
    await expect(tab.handler(makeContext({ index: 99 }))).rejects.toThrow('out of range');
    expect(mockDisconnect).not.toHaveBeenCalled();
  });

  it('calls ensureBrowserRunning', async () => {
    await tab.handler(makeContext({ index: 0 }));
    expect(mockEnsureBrowserRunning).toHaveBeenCalledWith('/tmp/test-project');
  });
});
