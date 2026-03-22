import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ExecutionContext } from '../shared/types.js';

const mockLaunch = vi.fn();
const mockWsEndpoint = vi.fn();
const mockProcess = vi.fn();
const mockPages = vi.fn();
const mockDisconnect = vi.fn();
const mockOn = vi.fn();
const mockCreateCDPSession = vi.fn();

vi.mock('puppeteer', () => ({
  default: {
    launch: (...args: unknown[]) => mockLaunch(...args),
  },
}));

const mockReadState = vi.fn();
const mockWriteState = vi.fn();
const mockDeleteState = vi.fn();
const mockGetLogDir = vi.fn();
const mockReadGlobalSession = vi.fn();
const mockWriteGlobalSession = vi.fn();
const mockIsProcessAlive = vi.fn();
const mockDeleteGlobalSession = vi.fn();

vi.mock('../shared/state.js', () => ({
  readState: (...args: unknown[]) => mockReadState(...args),
  writeState: (...args: unknown[]) => mockWriteState(...args),
  deleteState: (...args: unknown[]) => mockDeleteState(...args),
  getLogDir: (...args: unknown[]) => mockGetLogDir(...args),
  readGlobalSession: () => mockReadGlobalSession(),
  writeGlobalSession: (...args: unknown[]) => mockWriteGlobalSession(...args),
  isProcessAlive: (...args: unknown[]) => mockIsProcessAlive(...args),
  deleteGlobalSession: () => mockDeleteGlobalSession(),
}));

import launch from './launch.js';

function makeContext(args: Record<string, unknown> = {}, config: Record<string, unknown> = {}): ExecutionContext {
  return {
    projectName: 'test',
    projectPath: '/tmp/test-project',
    args: { _positional: [], ...args },
    config,
  };
}

const mockCdpClient = {
  send: vi.fn().mockResolvedValue({}),
  on: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockReadState.mockReturnValue(null);
  mockReadGlobalSession.mockReturnValue(null);
  mockGetLogDir.mockReturnValue('/tmp/test-project/.renre-kit/storage/chrome-debugger');

  const mockPage = {
    createCDPSession: mockCreateCDPSession,
    on: vi.fn(),
  };
  mockCreateCDPSession.mockResolvedValue(mockCdpClient);
  mockPages.mockResolvedValue([mockPage]);
  mockWsEndpoint.mockReturnValue('ws://127.0.0.1:9222/devtools/browser/abc');
  mockProcess.mockReturnValue({ pid: 5678 });
  mockDisconnect.mockReturnValue(undefined);
  mockOn.mockReturnValue(undefined);

  mockLaunch.mockResolvedValue({
    wsEndpoint: mockWsEndpoint,
    process: mockProcess,
    pages: mockPages,
    disconnect: mockDisconnect,
    on: mockOn,
  });
});

describe('launch', () => {
  it('launches browser and returns success', async () => {
    const result = await launch.handler(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Browser Launched');
    expect(result.output).toContain('headed (visible)');
    expect(result.output).toContain('9222');
    expect(result.output).toContain('5678');
    expect(result.output).toContain('ws://127.0.0.1:9222/devtools/browser/abc');
  });

  it('suppresses automation badge via ignoreDefaultArgs and --disable-infobars', async () => {
    await launch.handler(makeContext());
    expect(mockLaunch).toHaveBeenCalledWith(
      expect.objectContaining({
        ignoreDefaultArgs: ['--enable-automation'],
        args: expect.arrayContaining(['--disable-infobars']),
      })
    );
  });

  it('returns error when local browser already running', async () => {
    mockReadState.mockReturnValue({
      wsEndpoint: 'ws://localhost:9222',
      pid: 1234,
      port: 9222,
      launchedAt: '2024-01-01T00:00:00Z',
      networkLogPath: '/tmp/network.jsonl',
      consoleLogPath: '/tmp/console.jsonl',
    });
    mockIsProcessAlive.mockReturnValue(true);

    const result = await launch.handler(makeContext());
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('Browser Already Running');
    expect(result.output).toContain('1234');
    expect(mockLaunch).not.toHaveBeenCalled();
  });

  it('cleans up stale local state and proceeds with launch', async () => {
    mockReadState.mockReturnValueOnce({
      wsEndpoint: 'ws://localhost:9222',
      pid: 1234,
      port: 9222,
      launchedAt: '2024-01-01T00:00:00Z',
      networkLogPath: '/tmp/network.jsonl',
      consoleLogPath: '/tmp/console.jsonl',
    }).mockReturnValue(null);
    mockIsProcessAlive.mockReturnValue(false);

    const result = await launch.handler(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Browser Launched');
  });

  it('returns error when global browser running and alive', async () => {
    mockReadGlobalSession.mockReturnValue({
      wsEndpoint: 'ws://localhost:9222',
      pid: 9999,
      port: 9222,
      projectPath: '/other/project',
      launchedAt: '2024-01-01T00:00:00Z',
      lastSeenAt: '2024-01-01T00:00:00Z',
      headless: false,
      networkLogPath: '/tmp/network.jsonl',
      consoleLogPath: '/tmp/console.jsonl',
    });
    mockIsProcessAlive.mockReturnValue(true);

    const result = await launch.handler(makeContext());
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('Browser Already Running (another project)');
    expect(result.output).toContain('/other/project');
    expect(mockLaunch).not.toHaveBeenCalled();
  });

  it('cleans up stale global session and proceeds', async () => {
    mockReadGlobalSession.mockReturnValue({
      wsEndpoint: 'ws://localhost:9222',
      pid: 9999,
      port: 9222,
      projectPath: '/other/project',
      launchedAt: '2024-01-01T00:00:00Z',
      lastSeenAt: '2024-01-01T00:00:00Z',
      headless: false,
      networkLogPath: '/tmp/network.jsonl',
      consoleLogPath: '/tmp/console.jsonl',
    });
    mockIsProcessAlive.mockReturnValue(false);

    const result = await launch.handler(makeContext());
    expect(result.exitCode).toBe(0);
    expect(mockDeleteGlobalSession).toHaveBeenCalled();
    expect(result.output).toContain('Browser Launched');
  });

  it('launches in headless mode when config.headless is true', async () => {
    const result = await launch.handler(makeContext({}, { headless: true }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('headless');
    expect(mockLaunch).toHaveBeenCalledWith(
      expect.objectContaining({ headless: true })
    );
  });

  it('launches in headless mode when args.headless is true', async () => {
    const result = await launch.handler(makeContext({ headless: true }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('headless');
  });

  it('uses port from args', async () => {
    const result = await launch.handler(makeContext({ port: 9333 }));
    expect(result.exitCode).toBe(0);
    expect(mockLaunch).toHaveBeenCalledWith(
      expect.objectContaining({
        args: expect.arrayContaining(['--remote-debugging-port=9333']),
      })
    );
  });

  it('uses port from config when no args port', async () => {
    const result = await launch.handler(makeContext({}, { port: 9444 }));
    expect(result.exitCode).toBe(0);
    expect(mockLaunch).toHaveBeenCalledWith(
      expect.objectContaining({
        args: expect.arrayContaining(['--remote-debugging-port=9444']),
      })
    );
  });

  it('defaults to port 9222', async () => {
    const result = await launch.handler(makeContext());
    expect(result.exitCode).toBe(0);
    expect(mockLaunch).toHaveBeenCalledWith(
      expect.objectContaining({
        args: expect.arrayContaining(['--remote-debugging-port=9222']),
      })
    );
  });

  it('writes local state', async () => {
    await launch.handler(makeContext());
    expect(mockWriteState).toHaveBeenCalledWith(
      '/tmp/test-project',
      expect.objectContaining({
        wsEndpoint: 'ws://127.0.0.1:9222/devtools/browser/abc',
        pid: 5678,
        port: 9222,
      })
    );
  });

  it('writes global session', async () => {
    await launch.handler(makeContext());
    expect(mockWriteGlobalSession).toHaveBeenCalledWith(
      expect.objectContaining({
        wsEndpoint: 'ws://127.0.0.1:9222/devtools/browser/abc',
        pid: 5678,
        port: 9222,
        projectPath: '/tmp/test-project',
        headless: false,
      })
    );
  });

  it('handles browser process with no pid', async () => {
    mockProcess.mockReturnValue(null);

    const result = await launch.handler(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('0');
    expect(mockWriteState).toHaveBeenCalledWith(
      '/tmp/test-project',
      expect.objectContaining({ pid: 0 })
    );
  });

  it('disconnects browser after setup', async () => {
    await launch.handler(makeContext());
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('handles empty pages array', async () => {
    mockPages.mockResolvedValue([]);

    const result = await launch.handler(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Browser Launched');
  });
});
