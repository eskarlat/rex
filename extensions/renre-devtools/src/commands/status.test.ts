import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ExecutionContext } from '../shared/types.js';

const mockConnect = vi.fn();
const mockPages = vi.fn();
const mockDisconnect = vi.fn();

vi.mock('puppeteer', () => ({
  default: {
    connect: (...args: unknown[]) => mockConnect(...args),
  },
}));

const mockReadState = vi.fn();
const mockReadGlobalSession = vi.fn();
const mockDeleteGlobalSession = vi.fn();
const mockIsProcessAlive = vi.fn();

vi.mock('../shared/state.js', () => ({
  readState: (...args: unknown[]) => mockReadState(...args),
  readGlobalSession: (...args: unknown[]) => mockReadGlobalSession(...args),
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

beforeEach(() => {
  vi.clearAllMocks();
});

describe('status', () => {
  it('returns running:false when no session exists', async () => {
    mockReadState.mockReturnValue(null);
    mockReadGlobalSession.mockReturnValue(null);

    const result = await status(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.running).toBe(false);
  });

  it('cleans stale session when PID is dead (local state)', async () => {
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

    const result = await status(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.running).toBe(false);
    expect(output.staleSessionCleaned).toBe(true);
    expect(mockDeleteGlobalSession).toHaveBeenCalled();
  });

  it('cleans stale session when PID is dead (global session)', async () => {
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

    const result = await status(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.running).toBe(false);
    expect(output.staleSessionCleaned).toBe(true);
  });

  it('returns status with tabs on successful connect', async () => {
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

    const mockPage1 = { url: () => 'https://example.com' };
    const mockPage2 = { url: () => 'https://test.com' };
    mockPages.mockResolvedValue([mockPage1, mockPage2]);
    mockConnect.mockResolvedValue({
      pages: mockPages,
      disconnect: mockDisconnect,
    });

    const result = await status(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.running).toBe(true);
    expect(output.pid).toBe(12345);
    expect(output.port).toBe(9222);
    expect(output.tabCount).toBe(2);
    expect(output.tabs).toHaveLength(2);
    expect(output.tabs[0].url).toBe('https://example.com');
    expect(output.tabs[1].url).toBe('https://test.com');
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

    mockPages.mockResolvedValue([]);
    mockConnect.mockResolvedValue({
      pages: mockPages,
      disconnect: mockDisconnect,
    });

    const result = await status(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.running).toBe(true);
    expect(output.projectPath).toBe('/tmp/my-project');
    expect(output.headless).toBe(false);
  });

  it('cleans session when connect throws', async () => {
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
    mockConnect.mockRejectedValue(new Error('Connection refused'));

    const result = await status(makeContext());
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.running).toBe(false);
    expect(output.staleSessionCleaned).toBe(true);
    expect(mockDeleteGlobalSession).toHaveBeenCalled();
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
    mockPages.mockResolvedValue([]);
    mockConnect.mockResolvedValue({
      pages: mockPages,
      disconnect: mockDisconnect,
    });

    const result = await status(makeContext());
    const output = JSON.parse(result.output);
    expect(output.pid).toBe(11111);
  });
});
