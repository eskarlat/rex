import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ExecutionContext } from '../shared/types.js';

const mockCreateCDPSession = vi.fn();
const mockDisconnect = vi.fn();

const mockClient = {
  send: vi.fn(),
};

vi.mock('../shared/connection.js', () => ({
  withBrowser: vi.fn().mockImplementation(
    (_projectPath: string, fn: (browser: unknown, page: unknown) => Promise<unknown>) =>
      fn(
        { disconnect: mockDisconnect },
        { createCDPSession: mockCreateCDPSession }
      )
  ),
}));

import highlight from './highlight.js';

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
  vi.useFakeTimers();
  mockCreateCDPSession.mockResolvedValue(mockClient);
  mockClient.send.mockResolvedValue({});
});

describe('highlight', () => {
  it('returns error when selector is missing', async () => {
    const result = await highlight(makeContext());
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('--selector is required');
  });

  it('returns error when selector is empty string', async () => {
    const result = await highlight(makeContext({ selector: '' }));
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('--selector is required');
  });

  it('returns error when element not found (nodeId === 0)', async () => {
    mockClient.send.mockImplementation((method: string) => {
      if (method === 'DOM.getDocument') {
        return Promise.resolve({ root: { nodeId: 1 } });
      }
      if (method === 'DOM.querySelector') {
        return Promise.resolve({ nodeId: 0 });
      }
      return Promise.resolve({});
    });

    const resultPromise = highlight(makeContext({ selector: '#missing' }));
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('No element found');
    expect(result.output).toContain('#missing');
  });

  it('highlights element for default duration (3s)', async () => {
    mockClient.send.mockImplementation((method: string) => {
      if (method === 'DOM.getDocument') {
        return Promise.resolve({ root: { nodeId: 1 } });
      }
      if (method === 'DOM.querySelector') {
        return Promise.resolve({ nodeId: 5 });
      }
      return Promise.resolve({});
    });

    const resultPromise = highlight(makeContext({ selector: '#btn' }));
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Highlighted: `#btn`');
    expect(result.output).toContain('3s');
    expect(mockClient.send).toHaveBeenCalledWith('DOM.enable');
    expect(mockClient.send).toHaveBeenCalledWith('Overlay.enable');
    expect(mockClient.send).toHaveBeenCalledWith(
      'Overlay.highlightNode',
      expect.objectContaining({ nodeId: 5 })
    );
    expect(mockClient.send).toHaveBeenCalledWith('Overlay.hideHighlight');
  });

  it('uses custom duration', async () => {
    mockClient.send.mockImplementation((method: string) => {
      if (method === 'DOM.getDocument') {
        return Promise.resolve({ root: { nodeId: 1 } });
      }
      if (method === 'DOM.querySelector') {
        return Promise.resolve({ nodeId: 5 });
      }
      return Promise.resolve({});
    });

    const resultPromise = highlight(makeContext({ selector: 'div', duration: 5000 }));
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('5s');
  });
});
