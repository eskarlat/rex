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

import select from './select.js';

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

describe('select', () => {
  it('returns error when selector is missing', async () => {
    const result = await select(makeContext());
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('--selector is required');
  });

  it('returns message when no elements found', async () => {
    mockEvaluate.mockResolvedValue([]);
    const result = await select(makeContext({ selector: '.missing' }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('No elements found');
  });

  it('returns a table of matching elements', async () => {
    mockEvaluate.mockResolvedValue([
      { index: 0, tag: 'a', id: 'link1', classes: 'nav-link', text: 'Home', attrs: 'href="/"' },
      {
        index: 1,
        tag: 'a',
        id: '',
        classes: 'nav-link active',
        text: 'About',
        attrs: 'href="/about"',
      },
    ]);

    const result = await select(makeContext({ selector: 'a.nav-link' }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('2 found');
    expect(result.output).toContain('a.nav-link');
    expect(result.output).toContain('Home');
    expect(result.output).toContain('About');
    expect(result.output).toContain('link1');
  });
});
