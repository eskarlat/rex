import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ChildProcess } from 'node:child_process';

const mockSpawn = vi.fn();
const mockCreateConnection = vi.fn();

vi.mock('node:child_process', () => ({
  spawn: (...args: unknown[]) => mockSpawn(...args),
}));

vi.mock('node:net', () => ({
  createConnection: (...args: unknown[]) => mockCreateConnection(...args),
}));

vi.mock('node:os', () => ({
  default: { platform: () => 'linux' },
}));

const mockIntro = vi.fn();
const mockOutro = vi.fn();
const mockLogWarn = vi.fn();
const mockLogInfo = vi.fn();
const mockLogError = vi.fn();
const mockSpinnerStart = vi.fn();
const mockSpinnerStop = vi.fn();

vi.mock('@clack/prompts', () => ({
  intro: (...args: unknown[]) => mockIntro(...args),
  outro: (...args: unknown[]) => mockOutro(...args),
  log: {
    warn: (...args: unknown[]) => mockLogWarn(...args),
    info: (...args: unknown[]) => mockLogInfo(...args),
    error: (...args: unknown[]) => mockLogError(...args),
  },
  spinner: () => ({
    start: (...args: unknown[]) => mockSpinnerStart(...args),
    stop: (...args: unknown[]) => mockSpinnerStop(...args),
  }),
}));

const mockWriteFileSync = vi.fn();
const mockUnlinkSync = vi.fn();
const mockMkdirSync = vi.fn();

const mockReadFileSync = vi.fn();

vi.mock('node:fs', () => ({
  existsSync: () => true,
  mkdirSync: (...args: unknown[]) => mockMkdirSync(...args),
  writeFileSync: (...args: unknown[]) => mockWriteFileSync(...args),
  readFileSync: (...args: unknown[]) => mockReadFileSync(...args),
  unlinkSync: (...args: unknown[]) => mockUnlinkSync(...args),
}));

vi.mock('../../../core/paths/paths.js', () => ({
  // eslint-disable-next-line sonarjs/publicly-writable-directories
  SERVER_PID_PATH: '/tmp/test-server.pid',
  // eslint-disable-next-line sonarjs/publicly-writable-directories
  LAN_PIN_PATH: '/tmp/test-renre-kit/lan-pin',
  // eslint-disable-next-line sonarjs/publicly-writable-directories
  GLOBAL_DIR: '/tmp/test-renre-kit',
}));

const mockIsProcessRunning = vi.fn();
const mockReadPidFile = vi.fn();

vi.mock('../../../shared/process-utils.js', () => ({
  isProcessRunning: (...args: unknown[]) => mockIsProcessRunning(...args),
  readPidFile: (...args: unknown[]) => mockReadPidFile(...args),
}));

const { handleUi } = await import('./ui.command.js');

function createMockChild(pid = 42): ChildProcess {
  const handlers: Record<string, (...args: unknown[]) => void> = {};
  return {
    pid,
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      handlers[event] = handler;
    }),
    kill: vi.fn(),
    unref: vi.fn(),
    _handlers: handlers,
  } as unknown as ChildProcess;
}

describe('ui command', () => {
  let mockChild: ChildProcess;
  const originalExit = process.exit;

  function createMockSocket(portFree: boolean) {
    const handlers: Record<string, (...args: unknown[]) => void> = {};
    const socket = {
      once: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
        handlers[event] = handler;
        // Simulate async: port free triggers 'error', port busy triggers 'connect'
        if (event === (portFree ? 'error' : 'connect')) {
          queueMicrotask(() => handler());
        }
      }),
      destroy: vi.fn(),
    };
    return socket;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockChild = createMockChild();
    mockSpawn.mockReturnValue(mockChild);
    mockReadPidFile.mockReturnValue(null);
    mockIsProcessRunning.mockReturnValue(true);
    process.exit = vi.fn() as never;
    // Mock fetch to resolve immediately (server ready)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 200 }));
    // Default: port is free
    mockCreateConnection.mockReturnValue(createMockSocket(true));
  });

  afterEach(() => {
    process.exit = originalExit;
    vi.unstubAllGlobals();
  });

  it('spawns server in detached mode with default options', async () => {
    await handleUi({ noBrowser: true });

    expect(mockSpawn).toHaveBeenCalledWith(
      process.execPath,
      [expect.any(String)],
      expect.objectContaining({
        env: expect.objectContaining({ PORT: '4200' }),
        detached: true,
        stdio: 'ignore',
      }),
    );
  });

  it('shows clack intro and outro', async () => {
    await handleUi({ noBrowser: true });

    expect(mockIntro).toHaveBeenCalledWith('RenreKit Dashboard');
    expect(mockOutro).toHaveBeenCalledWith(expect.stringContaining('127.0.0.1:4200'));
  });

  it('writes PID file after spawn', async () => {
    await handleUi({ noBrowser: true });

    expect(mockWriteFileSync).toHaveBeenCalledWith('/tmp/test-server.pid', '42', 'utf-8');
  });

  it('unrefs the child process', async () => {
    await handleUi({ noBrowser: true });

    expect(mockChild.unref).toHaveBeenCalled();
  });

  it('uses custom port', async () => {
    await handleUi({ port: 8080, noBrowser: true });

    expect(mockSpawn).toHaveBeenCalledWith(
      process.execPath,
      [expect.any(String)],
      expect.objectContaining({
        env: expect.objectContaining({ PORT: '8080' }),
      }),
    );
    expect(mockOutro).toHaveBeenCalledWith(expect.stringContaining('8080'));
  });

  it('sets LAN_MODE env when lan flag is true', async () => {
    await handleUi({ lan: true, noBrowser: true });

    expect(mockSpawn).toHaveBeenCalledWith(
      process.execPath,
      [expect.any(String)],
      expect.objectContaining({
        env: expect.objectContaining({ LAN_MODE: 'true' }),
      }),
    );
    expect(mockOutro).toHaveBeenCalledWith(expect.stringContaining('localhost'));
  });

  it('displays LAN PIN when lan mode is active', async () => {
    mockReadFileSync.mockReturnValue('7392');

    await handleUi({ lan: true, noBrowser: true });

    expect(mockLogInfo).toHaveBeenCalledWith('LAN PIN: 7392');
  });

  it('does not display LAN PIN when lan mode is off', async () => {
    await handleUi({ noBrowser: true });

    expect(mockReadFileSync).not.toHaveBeenCalled();
  });

  it('sets NO_SLEEP env when noSleep is true', async () => {
    await handleUi({ noSleep: true, noBrowser: true });

    expect(mockSpawn).toHaveBeenCalledWith(
      process.execPath,
      [expect.any(String)],
      expect.objectContaining({
        env: expect.objectContaining({ NO_SLEEP: 'true' }),
      }),
    );
  });

  it('does not open browser when noBrowser is true', async () => {
    await handleUi({ noBrowser: true });

    // Only one spawn call (the server), no browser spawn
    expect(mockSpawn).toHaveBeenCalledTimes(1);
  });

  it('opens browser when noBrowser is false', async () => {
    await handleUi({ noBrowser: false });

    // Server spawn + browser spawn
    expect(mockSpawn).toHaveBeenCalledTimes(2);
    expect(mockSpawn).toHaveBeenLastCalledWith(
      'xdg-open',
      ['http://127.0.0.1:4200'],
      expect.objectContaining({ stdio: 'ignore', detached: true }),
    );
  });

  it('reports already running when PID exists and process is alive', async () => {
    mockReadPidFile.mockReturnValue(999);
    mockIsProcessRunning.mockReturnValue(true);

    await handleUi({ noBrowser: true });

    expect(mockLogWarn).toHaveBeenCalledWith(expect.stringContaining('already running'));
    // Server should not be spawned
    expect(mockSpawn).not.toHaveBeenCalled();
  });

  it('cleans up stale PID and continues when process is dead', async () => {
    mockReadPidFile.mockReturnValue(999);
    // First call (PID 999): stale process is dead. Second call (PID 42): new child is alive.
    mockIsProcessRunning.mockReturnValueOnce(false).mockReturnValue(true);

    await handleUi({ noBrowser: true });

    expect(mockUnlinkSync).toHaveBeenCalled();
    // Server should still be spawned
    expect(mockSpawn).toHaveBeenCalledTimes(1);
  });

  it('shows spinner while waiting for server', async () => {
    await handleUi({ noBrowser: true });

    expect(mockSpinnerStart).toHaveBeenCalledWith('Starting dashboard server...');
    expect(mockSpinnerStop).toHaveBeenCalledWith('Dashboard server is running.');
  });

  it('shows initializing message when server is slow', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));

    // Temporarily override waitForServer timeout by mocking Date.now
    let callCount = 0;
    const realNow = Date.now;
    vi.spyOn(Date, 'now').mockImplementation(() => {
      callCount++;
      // After first call, simulate timeout exceeded
      return callCount <= 1 ? realNow() : realNow() + 6000;
    });

    await handleUi({ noBrowser: true });

    expect(mockSpinnerStop).toHaveBeenCalledWith('Server started (still initializing).');

    vi.restoreAllMocks();
  });

  it('logs PID info', async () => {
    await handleUi({ noBrowser: true });

    expect(mockLogInfo).toHaveBeenCalledWith('PID: 42');
  });

  it('exits when child emits error', async () => {
    const handlers: Record<string, (...args: unknown[]) => void> = {};
    const child = {
      pid: 42,
      on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
        handlers[event] = handler;
      }),
      unref: vi.fn(),
    } as unknown as ChildProcess;
    mockSpawn.mockReturnValue(child);

    await handleUi({ noBrowser: true });

    // Trigger the error handler (fires asynchronously after spawn)
    handlers['error']?.(new Error('spawn failed'));

    expect(mockLogError).toHaveBeenCalledWith('spawn failed');
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('exits when child.pid is undefined', async () => {
    const child = {
      pid: undefined,
      on: vi.fn(),
      unref: vi.fn(),
    } as unknown as ChildProcess;
    mockSpawn.mockReturnValue(child);

    await handleUi({ noBrowser: true });

    expect(mockSpinnerStop).toHaveBeenCalledWith('Failed to start server.');
    expect(mockLogError).toHaveBeenCalledWith('Could not obtain server process ID.');
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('reports error when port is already in use', async () => {
    mockCreateConnection.mockReturnValue(createMockSocket(false));

    await handleUi({ noBrowser: true });

    expect(mockLogError).toHaveBeenCalledWith(
      expect.stringContaining('Port 4200 is already in use'),
    );
    expect(mockSpawn).not.toHaveBeenCalled();
  });

  it('reports error when spawned process exits unexpectedly', async () => {
    // Port is free, but child process dies after spawn (e.g. EADDRINUSE race)
    mockIsProcessRunning.mockReturnValue(false);

    await handleUi({ noBrowser: true });

    expect(mockSpinnerStop).toHaveBeenCalledWith('Failed to start server.');
    expect(mockLogError).toHaveBeenCalledWith(expect.stringContaining('exited unexpectedly'));
  });
});
