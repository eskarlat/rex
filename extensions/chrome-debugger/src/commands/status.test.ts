import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ExecutionContext } from '../shared/types.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const mockReadState = vi.fn();
const mockReadGlobalSession = vi.fn();
const mockDeleteState = vi.fn();
const mockDeleteGlobalSession = vi.fn();
const mockIsProcessAlive = vi.fn();

vi.mock('../shared/state.js', () => ({
  readState: (...args: unknown[]) => mockReadState(...args),
  readGlobalSession: (...args: unknown[]) => mockReadGlobalSession(...args),
  deleteState: (...args: unknown[]) => mockDeleteState(...args),
  deleteGlobalSession: (...args: unknown[]) => mockDeleteGlobalSession(...args),
  isProcessAlive: (...args: unknown[]) => mockIsProcessAlive(...args),
}));

import status from './status.js';

function makeContext(): ExecutionContext {
  return {
    projectName: 'test',
    projectPath: '/tmp/test-project',
    args: { _positional: [] },
    config: {},
  };
}

function mockFetchResponse(tabs: Array<{ title: string; url: string; type: string }>): void {
  mockFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(tabs),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('status', () => {
  it('returns running:false when no session exists', async () => {
    mockReadState.mockReturnValue(null);
    mockReadGlobalSession.mockReturnValue(null);

    const result = await status.handler(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.running).toBe(false);
  });

  it('cleans stale session when PID is dead (local state only)', async () => {
    mockReadState.mockReturnValue({
      wsEndpoint: 'ws://localhost:9222',
      pid: 99999,
      port: 9222,
      launchedAt: '2024-01-01T00:00:00Z',
      networkLogPath: '/tmp/network.jsonl',
      consoleLogPath: '/tmp/console.jsonl',
    });
    mockReadGlobalSession.mockReturnValue(null);
    mockIsProcessAlive.mockReturnValue(false);

    const result = await status.handler(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.running).toBe(false);
    expect(output.staleSessionCleaned).toBe(true);
    expect(mockDeleteState).toHaveBeenCalledWith('/tmp/test-project');
    expect(mockDeleteGlobalSession).not.toHaveBeenCalled();
  });

  it('cleans stale session when PID is dead (global session only)', async () => {
    mockReadState.mockReturnValue(null);
    mockReadGlobalSession.mockReturnValue({
      wsEndpoint: 'ws://localhost:9222',
      pid: 88888,
      port: 9222,
      projectPath: '/tmp/other',
      launchedAt: '2024-01-01T00:00:00Z',
      lastSeenAt: '2024-01-01T00:00:00Z',
      headless: true,
      networkLogPath: '/tmp/network.jsonl',
      consoleLogPath: '/tmp/console.jsonl',
    });
    mockIsProcessAlive.mockReturnValue(false);

    const result = await status.handler(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.running).toBe(false);
    expect(output.staleSessionCleaned).toBe(true);
    expect(mockDeleteState).not.toHaveBeenCalled();
    expect(mockDeleteGlobalSession).toHaveBeenCalled();
  });

  it('returns status with tabs on successful HTTP fetch', async () => {
    mockReadState.mockReturnValue({
      wsEndpoint: 'ws://localhost:9222',
      pid: 12345,
      port: 9222,
      launchedAt: '2024-01-01T00:00:00Z',
      networkLogPath: '/tmp/network.jsonl',
      consoleLogPath: '/tmp/console.jsonl',
    });
    mockReadGlobalSession.mockReturnValue(null);
    mockIsProcessAlive.mockReturnValue(true);

    mockFetchResponse([
      { title: 'Example', url: 'https://example.com', type: 'page' },
      { title: 'Test Page', url: 'https://test.com', type: 'page' },
    ]);

    const result = await status.handler(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.running).toBe(true);
    expect(output.pid).toBe(12345);
    expect(output.port).toBe(9222);
    expect(output.tabCount).toBe(2);
    expect(output.tabs).toHaveLength(2);
    expect(output.tabs[0].title).toBe('Example');
    expect(output.tabs[0].url).toBe('https://example.com');
    expect(output.tabs[1].title).toBe('Test Page');
    expect(output.tabs[1].url).toBe('https://test.com');
    expect(mockFetch).toHaveBeenCalledWith('http://127.0.0.1:9222/json');
  });

  it('filters out non-page targets from HTTP response', async () => {
    mockReadState.mockReturnValue({
      wsEndpoint: 'ws://localhost:9222',
      pid: 12345,
      port: 9222,
      launchedAt: '2024-01-01T00:00:00Z',
      networkLogPath: '/tmp/network.jsonl',
      consoleLogPath: '/tmp/console.jsonl',
    });
    mockReadGlobalSession.mockReturnValue(null);
    mockIsProcessAlive.mockReturnValue(true);

    mockFetchResponse([
      { title: 'Example', url: 'https://example.com', type: 'page' },
      { title: 'Service Worker', url: 'sw.js', type: 'service_worker' },
      { title: 'Background', url: 'about:blank', type: 'background_page' },
    ]);

    const result = await status.handler(makeContext());
    const output = JSON.parse(result.output);
    expect(output.tabCount).toBe(1);
    expect(output.tabs).toHaveLength(1);
    expect(output.tabs[0].title).toBe('Example');
  });

  it('includes projectPath and headless when using global session', async () => {
    mockReadState.mockReturnValue(null);
    mockReadGlobalSession.mockReturnValue({
      wsEndpoint: 'ws://localhost:9222',
      pid: 12345,
      port: 9222,
      projectPath: '/tmp/my-project',
      launchedAt: '2024-01-01T00:00:00Z',
      lastSeenAt: '2024-01-01T00:00:00Z',
      headless: false,
      networkLogPath: '/tmp/network.jsonl',
      consoleLogPath: '/tmp/console.jsonl',
    });
    mockIsProcessAlive.mockReturnValue(true);

    mockFetchResponse([]);

    const result = await status.handler(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.running).toBe(true);
    expect(output.projectPath).toBe('/tmp/my-project');
    expect(output.headless).toBe(false);
  });

  it('cleans local state when HTTP fetch fails for local session', async () => {
    mockReadState.mockReturnValue({
      wsEndpoint: 'ws://localhost:9222',
      pid: 12345,
      port: 9222,
      launchedAt: '2024-01-01T00:00:00Z',
      networkLogPath: '/tmp/network.jsonl',
      consoleLogPath: '/tmp/console.jsonl',
    });
    mockReadGlobalSession.mockReturnValue(null);
    mockIsProcessAlive.mockReturnValue(true);
    mockFetch.mockRejectedValue(new Error('Connection refused'));

    const result = await status.handler(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.running).toBe(false);
    expect(output.staleSessionCleaned).toBe(true);
    expect(mockDeleteState).toHaveBeenCalledWith('/tmp/test-project');
    expect(mockDeleteGlobalSession).not.toHaveBeenCalled();
  });

  it('prefers local state over global session', async () => {
    const localState = {
      wsEndpoint: 'ws://localhost:9222',
      pid: 11111,
      port: 9222,
      launchedAt: '2024-01-01T00:00:00Z',
      networkLogPath: '/tmp/network.jsonl',
      consoleLogPath: '/tmp/console.jsonl',
    };
    mockReadState.mockReturnValue(localState);
    mockReadGlobalSession.mockReturnValue({
      wsEndpoint: 'ws://localhost:9222',
      pid: 22222,
      port: 9222,
      projectPath: '/tmp/other',
      launchedAt: '2024-01-01T00:00:00Z',
      lastSeenAt: '2024-01-01T00:00:00Z',
      headless: true,
      networkLogPath: '/tmp/network.jsonl',
      consoleLogPath: '/tmp/console.jsonl',
    });
    mockIsProcessAlive.mockReturnValue(true);

    mockFetchResponse([]);

    const result = await status.handler(makeContext());
    const output = JSON.parse(result.output);
    expect(output.pid).toBe(11111);
  });

  it('cleans stale session when HTTP response is not ok', async () => {
    mockReadState.mockReturnValue({
      wsEndpoint: 'ws://localhost:9222',
      pid: 12345,
      port: 9222,
      launchedAt: '2024-01-01T00:00:00Z',
      networkLogPath: '/tmp/network.jsonl',
      consoleLogPath: '/tmp/console.jsonl',
    });
    mockReadGlobalSession.mockReturnValue(null);
    mockIsProcessAlive.mockReturnValue(true);
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    const result = await status.handler(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.running).toBe(false);
    expect(output.staleSessionCleaned).toBe(true);
  });
});
