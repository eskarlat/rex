import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ExecutionContext } from '../shared/types.js';

const mockEvaluate = vi.fn();
const mockDisconnect = vi.fn();

vi.mock('puppeteer', () => ({
  default: {
    connect: vi.fn().mockImplementation(() =>
      Promise.resolve({
        pages: () => Promise.resolve([{ evaluate: mockEvaluate }]),
        disconnect: mockDisconnect,
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

import evalCommand from './eval.js';

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

describe('eval', () => {
  it('returns error when neither code nor file is provided', async () => {
    const result = await evalCommand(makeContext());
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('--code');
  });

  it('evaluates code and returns string result', async () => {
    mockEvaluate.mockResolvedValue('Hello World');
    const result = await evalCommand(makeContext({ code: 'document.title' }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Eval Result');
    expect(result.output).toContain('Hello World');
  });

  it('evaluates code and returns object as JSON', async () => {
    mockEvaluate.mockResolvedValue({ count: 42, items: ['a', 'b'] });
    const result = await evalCommand(makeContext({ code: 'JSON.parse(someData)' }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('"count": 42');
  });

  it('handles undefined result', async () => {
    mockEvaluate.mockResolvedValue(undefined);
    const result = await evalCommand(makeContext({ code: 'void 0' }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('undefined');
  });
});
