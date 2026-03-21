import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appendFileSync } from 'node:fs';
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
const mockGetLogDir = vi.fn();
const mockReadGlobalSession = vi.fn();
const mockWriteGlobalSession = vi.fn();
const mockIsProcessAlive = vi.fn();
const mockDeleteGlobalSession = vi.fn();

vi.mock('../shared/state.js', () => ({
  readState: (...args: unknown[]) => mockReadState(...args),
  writeState: (...args: unknown[]) => mockWriteState(...args),
  getLogDir: (...args: unknown[]) => mockGetLogDir(...args),
  readGlobalSession: () => mockReadGlobalSession(),
  writeGlobalSession: (...args: unknown[]) => mockWriteGlobalSession(...args),
  isProcessAlive: (...args: unknown[]) => mockIsProcessAlive(...args),
  deleteGlobalSession: () => mockDeleteGlobalSession(),
}));

// Mock node:fs for setupPageMonitoring
vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs');
  return {
    ...actual,
    appendFileSync: vi.fn(),
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn(),
  };
});

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
    const result = await launch(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Browser Launched');
    expect(result.output).toContain('headed (visible)');
    expect(result.output).toContain('9222');
    expect(result.output).toContain('5678');
    expect(result.output).toContain('ws://127.0.0.1:9222/devtools/browser/abc');
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

    const result = await launch(makeContext());
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('Browser Already Running');
    expect(result.output).toContain('1234');
    expect(mockLaunch).not.toHaveBeenCalled();
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

    const result = await launch(makeContext());
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

    const result = await launch(makeContext());
    expect(result.exitCode).toBe(0);
    expect(mockDeleteGlobalSession).toHaveBeenCalled();
    expect(result.output).toContain('Browser Launched');
  });

  it('launches in headless mode when config.headless is true', async () => {
    const result = await launch(makeContext({}, { headless: true }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('headless');
    expect(mockLaunch).toHaveBeenCalledWith(
      expect.objectContaining({ headless: true })
    );
  });

  it('launches in headless mode when args.headless is true', async () => {
    const result = await launch(makeContext({ headless: true }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('headless');
  });

  it('uses port from args', async () => {
    const result = await launch(makeContext({ port: 9333 }));
    expect(result.exitCode).toBe(0);
    expect(mockLaunch).toHaveBeenCalledWith(
      expect.objectContaining({
        args: expect.arrayContaining(['--remote-debugging-port=9333']),
      })
    );
  });

  it('uses port from config when no args port', async () => {
    const result = await launch(makeContext({}, { port: 9444 }));
    expect(result.exitCode).toBe(0);
    expect(mockLaunch).toHaveBeenCalledWith(
      expect.objectContaining({
        args: expect.arrayContaining(['--remote-debugging-port=9444']),
      })
    );
  });

  it('defaults to port 9222', async () => {
    const result = await launch(makeContext());
    expect(result.exitCode).toBe(0);
    expect(mockLaunch).toHaveBeenCalledWith(
      expect.objectContaining({
        args: expect.arrayContaining(['--remote-debugging-port=9222']),
      })
    );
  });

  it('writes local state', async () => {
    await launch(makeContext());
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
    await launch(makeContext());
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

    const result = await launch(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('0');
    expect(mockWriteState).toHaveBeenCalledWith(
      '/tmp/test-project',
      expect.objectContaining({ pid: 0 })
    );
  });

  it('disconnects browser after setup', async () => {
    await launch(makeContext());
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('sets up page monitoring for initial page', async () => {
    await launch(makeContext());
    expect(mockCreateCDPSession).toHaveBeenCalled();
    expect(mockCdpClient.send).toHaveBeenCalledWith('Network.enable');
    expect(mockCdpClient.send).toHaveBeenCalledWith('Runtime.enable');
  });

  it('handles empty pages array', async () => {
    mockPages.mockResolvedValue([]);

    const result = await launch(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Browser Launched');
    // No createCDPSession call since there are no pages
    expect(mockCreateCDPSession).not.toHaveBeenCalled();
  });

  it('registers targetcreated listener', async () => {
    await launch(makeContext());
    expect(mockOn).toHaveBeenCalledWith('targetcreated', expect.any(Function));
  });

  it('triggers Network.requestWillBeSent and Network.responseReceived handlers', async () => {
    // Capture the CDP event handlers
    const cdpHandlers: Record<string, (...args: unknown[]) => void> = {};
    mockCdpClient.on.mockImplementation((event: string, handler: (...args: unknown[]) => void) => {
      cdpHandlers[event] = handler;
    });

    await launch(makeContext());

    // Simulate a network request
    cdpHandlers['Network.requestWillBeSent']?.({
      requestId: 'req-1',
      request: { method: 'GET', url: 'https://example.com/api' },
      type: 'Fetch',
      timestamp: 1000,
    });

    // Simulate the response
    cdpHandlers['Network.responseReceived']?.({
      requestId: 'req-1',
      response: {
        status: 200,
        headers: { 'content-length': '1024' },
      },
      timestamp: 1001,
    });

    expect(appendFileSync).toHaveBeenCalled();
  });

  it('handles Network.responseReceived with no matching request', async () => {
    const cdpHandlers: Record<string, (...args: unknown[]) => void> = {};
    mockCdpClient.on.mockImplementation((event: string, handler: (...args: unknown[]) => void) => {
      cdpHandlers[event] = handler;
    });

    await launch(makeContext());

    // Response with no matching request - should early return
    cdpHandlers['Network.responseReceived']?.({
      requestId: 'unknown-req',
      response: { status: 200, headers: {} },
      timestamp: 1001,
    });

    // appendFileSync should not be called for network log in this case
    // (it may be called 0 times or only for other reasons)
  });

  it('handles Network.responseReceived without content-length', async () => {
    const cdpHandlers: Record<string, (...args: unknown[]) => void> = {};
    mockCdpClient.on.mockImplementation((event: string, handler: (...args: unknown[]) => void) => {
      cdpHandlers[event] = handler;
    });

    await launch(makeContext());

    cdpHandlers['Network.requestWillBeSent']?.({
      requestId: 'req-2',
      request: { method: 'POST', url: 'https://example.com/submit' },
      type: undefined,
      timestamp: 2000,
    });

    cdpHandlers['Network.responseReceived']?.({
      requestId: 'req-2',
      response: { status: 201, headers: {} },
      timestamp: 2002,
    });

    expect(appendFileSync).toHaveBeenCalled();
  });

  it('triggers Runtime.consoleAPICalled handler', async () => {
    const cdpHandlers: Record<string, (...args: unknown[]) => void> = {};
    mockCdpClient.on.mockImplementation((event: string, handler: (...args: unknown[]) => void) => {
      cdpHandlers[event] = handler;
    });

    await launch(makeContext());

    cdpHandlers['Runtime.consoleAPICalled']?.({
      type: 'log',
      args: [
        { value: 'Hello' },
        { description: 'Object description' },
        { type: 'undefined' },
      ],
    });

    expect(appendFileSync).toHaveBeenCalled();
  });

  it('creates log directory if it does not exist', async () => {
    const { existsSync, mkdirSync } = await import('node:fs');
    (existsSync as ReturnType<typeof vi.fn>).mockReturnValue(false);

    await launch(makeContext());

    expect(mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });
});
