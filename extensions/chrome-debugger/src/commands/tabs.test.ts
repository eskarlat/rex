import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ExecutionContext } from '../shared/types.js';

const mockTitle1 = vi.fn().mockResolvedValue('Tab 1');
const mockUrl1 = vi.fn().mockReturnValue('https://tab1.com');
const mockTitle2 = vi.fn().mockResolvedValue('Tab 2');
const mockUrl2 = vi.fn().mockReturnValue('https://tab2.com');
const mockDisconnect = vi.fn();

vi.mock('puppeteer', () => ({
  default: {
    connect: vi.fn().mockImplementation(() =>
      Promise.resolve({
        pages: () =>
          Promise.resolve([
            { title: mockTitle1, url: mockUrl1 },
            { title: mockTitle2, url: mockUrl2 },
          ]),
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

import tabs from './tabs.js';

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

describe('tabs', () => {
  it('lists all open tabs as a markdown table', async () => {
    const result = await tabs.handler(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Open Tabs (2)');
    expect(result.output).toContain('Tab 1');
    expect(result.output).toContain('Tab 2');
    expect(result.output).toContain('tab1.com');
    expect(result.output).toContain('tab2.com');
    expect(result.output).toContain('| 0 |');
    expect(result.output).toContain('| 1 |');
  });

  it('keeps connection cached after listing', async () => {
    await tabs.handler(makeContext());
    expect(mockDisconnect).not.toHaveBeenCalled();
  });
});
