import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ExecutionContext, GlobalBrowserSession } from '../shared/types.js';

const mockReadGlobalSession = vi.fn();
const mockWriteGlobalSession = vi.fn();

vi.mock('../shared/state.js', () => ({
  readGlobalSession: (...args: unknown[]) => mockReadGlobalSession(...args),
  writeGlobalSession: (...args: unknown[]) => mockWriteGlobalSession(...args),
}));

import heartbeat from './heartbeat.js';

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

describe('heartbeat', () => {
  it('returns updated:false when no session exists', () => {
    mockReadGlobalSession.mockReturnValue(null);

    const result = heartbeat.handler(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.updated).toBe(false);
    expect(output.reason).toBe('no-session');
    expect(mockWriteGlobalSession).not.toHaveBeenCalled();
  });

  it('updates lastSeenAt when session exists', () => {
    const session: GlobalBrowserSession = {
      wsEndpoint: 'ws://localhost:9222',
      pid: 12345,
      port: 9222,
      projectPath: '/tmp/test',
      launchedAt: '2024-01-01T00:00:00Z',
      lastSeenAt: '2024-01-01T00:00:00Z',
      headless: true,
      networkLogPath: '/tmp/network.jsonl',
      consoleLogPath: '/tmp/console.jsonl',
    };
    mockReadGlobalSession.mockReturnValue(session);

    const result = heartbeat.handler(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.updated).toBe(true);
    expect(output.lastSeenAt).toBeDefined();

    expect(mockWriteGlobalSession).toHaveBeenCalledTimes(1);
    const writtenSession = mockWriteGlobalSession.mock.calls[0][0] as GlobalBrowserSession;
    expect(writtenSession.lastSeenAt).not.toBe('2024-01-01T00:00:00Z');
  });
});
