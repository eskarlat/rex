import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ExecutionContext } from '../shared/types.js';

const mock$ = vi.fn();
const mockType = vi.fn();
const mockEvaluate = vi.fn();
const mockDisconnect = vi.fn();

vi.mock('puppeteer', () => ({
  default: {
    connect: vi.fn().mockImplementation(() =>
      Promise.resolve({
        pages: () =>
          Promise.resolve([{ $: mock$, type: mockType, evaluate: mockEvaluate }]),
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

import typeCommand from './type.js';

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

describe('type command', () => {
  it('returns error when selector is missing', async () => {
    mock$.mockResolvedValue(null);
    const result = await typeCommand.handler(makeContext({ text: 'hello' }));
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('No element found');
  });

  it('proceeds with undefined text when text is missing (no runtime validation)', async () => {
    mock$.mockResolvedValue({});
    mockType.mockResolvedValue(undefined);
    const result = await typeCommand.handler(makeContext({ selector: '#input' }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Typed into');
  });

  it('returns error when element not found', async () => {
    mock$.mockResolvedValue(null);
    const result = await typeCommand.handler(
      makeContext({ selector: '#input', text: 'hello' })
    );
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('No element found');
  });

  it('types text into element', async () => {
    mock$.mockResolvedValue({});
    mockType.mockResolvedValue(undefined);

    const result = await typeCommand.handler(
      makeContext({ selector: '#search', text: 'hello world' })
    );
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Typed into');
    expect(result.output).toContain('#search');
    expect(result.output).toContain('hello world');
    expect(mockType).toHaveBeenCalledWith('#search', 'hello world');
  });

  it('clears field before typing when --clear is set', async () => {
    mock$.mockResolvedValue({});
    mockType.mockResolvedValue(undefined);
    mockEvaluate.mockResolvedValue(undefined);

    const result = await typeCommand.handler(
      makeContext({ selector: '#search', text: 'new text', clear: true })
    );
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Cleared first**: yes');
    expect(mockEvaluate).toHaveBeenCalled();
  });
});
