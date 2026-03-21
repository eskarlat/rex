import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ExecutionContext } from '../shared/types.js';

const mockEvaluate = vi.fn();
const mockDisconnect = vi.fn();

vi.mock('../shared/connection.js', () => ({
  withBrowser: vi.fn().mockImplementation(
    (_projectPath: string, fn: (browser: unknown, page: unknown) => Promise<unknown>) =>
      fn(
        { disconnect: mockDisconnect },
        { evaluate: mockEvaluate }
      )
  ),
}));

import storage from './storage.js';

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
});

describe('storage', () => {
  it('returns localStorage entries by default', async () => {
    mockEvaluate.mockResolvedValue([
      { key: 'theme', value: 'dark' },
      { key: 'lang', value: 'en' },
    ]);

    const result = await storage(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('localStorage (2 entries)');
    expect(result.output).toContain('theme');
    expect(result.output).toContain('dark');
    expect(result.output).toContain('lang');
    expect(result.output).toContain('en');
  });

  it('returns sessionStorage when type=session', async () => {
    mockEvaluate.mockResolvedValue([
      { key: 'token', value: 'abc123' },
    ]);

    const result = await storage(makeContext({ type: 'session' }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('sessionStorage (1 entries)');
    expect(result.output).toContain('token');
    expect(result.output).toContain('abc123');
  });

  it('returns empty message for localStorage', async () => {
    mockEvaluate.mockResolvedValue([]);

    const result = await storage(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toBe('localStorage is empty.');
  });

  it('returns empty message for sessionStorage', async () => {
    mockEvaluate.mockResolvedValue([]);

    const result = await storage(makeContext({ type: 'session' }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toBe('sessionStorage is empty.');
  });

  it('passes storage type to page.evaluate', async () => {
    mockEvaluate.mockResolvedValue([]);

    await storage(makeContext({ type: 'session' }));
    expect(mockEvaluate).toHaveBeenCalledWith(expect.any(Function), 'session');
  });

  it('defaults to local storage type', async () => {
    mockEvaluate.mockResolvedValue([]);

    await storage(makeContext());
    expect(mockEvaluate).toHaveBeenCalledWith(expect.any(Function), 'local');
  });

  it('renders entries as markdown table', async () => {
    mockEvaluate.mockResolvedValue([
      { key: 'a', value: '1' },
    ]);

    const result = await storage(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('| Key | Value |');
    expect(result.output).toContain('| --- | --- |');
    expect(result.output).toContain('| a | 1 |');
  });
});
