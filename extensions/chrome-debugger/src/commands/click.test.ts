import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ExecutionContext } from '../shared/types.js';

const mock$ = vi.fn();
const mockClick = vi.fn();
const mockTitle = vi.fn();
const mockUrl = vi.fn();
const mockDisconnect = vi.fn();

vi.mock('puppeteer', () => ({
  default: {
    connect: vi.fn().mockImplementation(() =>
      Promise.resolve({
        pages: () =>
          Promise.resolve([{ $: mock$, click: mockClick, title: mockTitle, url: mockUrl }]),
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

import click from './click.js';

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
  mockTitle.mockResolvedValue('Test Page');
  mockUrl.mockReturnValue('https://example.com');
});

describe('click', () => {
  it('returns error when selector is missing', async () => {
    mock$.mockResolvedValue(null);
    const result = await click.handler(makeContext());
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('No element found for selector: `undefined`');
  });

  it('returns error when element is not found', async () => {
    mock$.mockResolvedValue(null);
    const result = await click.handler(makeContext({ selector: '.nonexistent' }));
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('No element found');
  });

  it('clicks element and returns success', async () => {
    mock$.mockResolvedValue({});
    mockClick.mockResolvedValue(undefined);

    const result = await click.handler(makeContext({ selector: 'button.submit' }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Clicked');
    expect(result.output).toContain('button.submit');
    expect(mockClick).toHaveBeenCalledWith('button.submit');
  });
});
