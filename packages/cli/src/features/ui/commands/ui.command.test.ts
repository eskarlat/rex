import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ChildProcess } from 'node:child_process';
import type { EventEmitter } from 'node:events';

const mockSpawn = vi.fn();

vi.mock('node:child_process', () => ({
  spawn: (...args: unknown[]) => mockSpawn(...args),
}));

vi.mock('node:os', () => ({
  default: { platform: () => 'linux' },
}));

import { handleUi } from './ui.command.js';

function createMockChild(): ChildProcess {
  const handlers: Record<string, (...args: unknown[]) => void> = {};
  return {
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
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    mockChild = createMockChild();
    mockSpawn.mockReturnValue(mockChild);
    process.exit = vi.fn() as never;
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.exit = originalExit;
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it('spawns server with default options', () => {
    handleUi();

    expect(mockSpawn).toHaveBeenCalledWith(
      process.execPath,
      [expect.any(String)],
      expect.objectContaining({
        env: expect.objectContaining({ PORT: '4200' }),
        stdio: 'inherit',
      }),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('127.0.0.1:4200'),
    );
  });

  it('uses custom port', () => {
    handleUi({ port: 8080 });

    expect(mockSpawn).toHaveBeenCalledWith(
      process.execPath,
      [expect.any(String)],
      expect.objectContaining({
        env: expect.objectContaining({ PORT: '8080' }),
      }),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('8080'),
    );
  });

  it('sets LAN_MODE env when lan flag is true', () => {
    handleUi({ lan: true });

    expect(mockSpawn).toHaveBeenCalledWith(
      process.execPath,
      [expect.any(String)],
      expect.objectContaining({
        env: expect.objectContaining({ LAN_MODE: 'true' }),
      }),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('localhost:4200'),
    );
  });

  it('sets NO_SLEEP env when noSleep is true', () => {
    handleUi({ noSleep: true });

    expect(mockSpawn).toHaveBeenCalledWith(
      process.execPath,
      [expect.any(String)],
      expect.objectContaining({
        env: expect.objectContaining({ NO_SLEEP: 'true' }),
      }),
    );
  });

  it('does not open browser when noBrowser is true', () => {
    vi.useFakeTimers();
    handleUi({ noBrowser: true });

    // Only one spawn call (the server), no browser spawn
    expect(mockSpawn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(2000);
    // Still only the server spawn
    expect(mockSpawn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('opens browser after delay when noBrowser is false', () => {
    vi.useFakeTimers();
    handleUi({ noBrowser: false });

    // Server spawn
    expect(mockSpawn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1500);
    // Browser spawn (xdg-open on linux)
    expect(mockSpawn).toHaveBeenCalledTimes(2);
    expect(mockSpawn).toHaveBeenLastCalledWith(
      'xdg-open',
      ['http://127.0.0.1:4200'],
      expect.objectContaining({ stdio: 'ignore', detached: true }),
    );
    vi.useRealTimers();
  });

  it('exits with child process exit code', () => {
    handleUi({ noBrowser: true });

    const exitHandler = (mockChild.on as ReturnType<typeof vi.fn>).mock.calls.find(
      (call: unknown[]) => call[0] === 'exit',
    );
    expect(exitHandler).toBeDefined();

    // Simulate child exit
    exitHandler![1](1);
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('exits with code 0 when child exits with null', () => {
    handleUi({ noBrowser: true });

    const exitHandler = (mockChild.on as ReturnType<typeof vi.fn>).mock.calls.find(
      (call: unknown[]) => call[0] === 'exit',
    );
    exitHandler![1](null);
    expect(process.exit).toHaveBeenCalledWith(0);
  });
});
