import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TerminalSessionManager } from './terminal-session-manager.js';

const mockOnData = vi.fn();
const mockOnExit = vi.fn();
const mockWrite = vi.fn();
const mockResize = vi.fn();
const mockKill = vi.fn();
const mockSpawn = vi.fn();

vi.mock('node-pty', () => ({
  spawn: (...args: unknown[]) => {
    mockSpawn(...args);
    return {
      onData: (cb: (data: string) => void) => mockOnData(cb),
      onExit: (cb: () => void) => mockOnExit(cb),
      write: (data: string) => mockWrite(data),
      resize: (cols: number, rows: number) => mockResize(cols, rows),
      kill: () => mockKill(),
    };
  },
}));

function makeMockSocket() {
  return {
    send: vi.fn(),
    close: vi.fn(),
  };
}

describe('TerminalSessionManager', () => {
  let manager: TerminalSessionManager;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
    manager = new TerminalSessionManager();
  });

  afterEach(() => {
    manager.destroyAll();
    vi.useRealTimers();
  });

  it('creates a new session and returns isNew=true', () => {
    const { isNew } = manager.getOrCreateSession('proj-a', '/tmp/proj-a', 80, 24);
    expect(isNew).toBe(true);
    expect(mockSpawn).toHaveBeenCalledOnce();
  });

  it('reuses existing session and returns isNew=false', () => {
    manager.getOrCreateSession('proj-a', '/tmp/proj-a', 80, 24);
    const { isNew } = manager.getOrCreateSession('proj-a', '/tmp/proj-a', 80, 24);
    expect(isNew).toBe(false);
    expect(mockSpawn).toHaveBeenCalledOnce();
  });

  it('creates separate sessions for different keys', () => {
    manager.getOrCreateSession('proj-a', '/tmp/proj-a', 80, 24);
    manager.getOrCreateSession('proj-b', '/tmp/proj-b', 80, 24);
    expect(mockSpawn).toHaveBeenCalledTimes(2);
  });

  it('fans out PTY data to all attached sockets', () => {
    manager.getOrCreateSession('proj-a', '/tmp/proj-a', 80, 24);

    const socket1 = makeMockSocket();
    const socket2 = makeMockSocket();
    manager.attachSocket('proj-a', socket1);
    manager.attachSocket('proj-a', socket2);

    // Trigger the onData callback
    const dataCallback = mockOnData.mock.calls[0]![0] as (data: string) => void;
    dataCallback('hello');

    expect(socket1.send).toHaveBeenCalledWith('hello');
    expect(socket2.send).toHaveBeenCalledWith('hello');
  });

  it('buffers PTY output for replay', () => {
    manager.getOrCreateSession('proj-a', '/tmp/proj-a', 80, 24);

    const dataCallback = mockOnData.mock.calls[0]![0] as (data: string) => void;
    dataCallback('line1');
    dataCallback('line2');

    expect(manager.getReplayData('proj-a')).toBe('line1line2');
  });

  it('writes data to the PTY', () => {
    manager.getOrCreateSession('proj-a', '/tmp/proj-a', 80, 24);
    manager.writeToSession('proj-a', 'ls\n');
    expect(mockWrite).toHaveBeenCalledWith('ls\n');
  });

  it('resizes the PTY', () => {
    manager.getOrCreateSession('proj-a', '/tmp/proj-a', 80, 24);
    manager.resizeSession('proj-a', 120, 40);
    expect(mockResize).toHaveBeenCalledWith(120, 40);
  });

  it('starts idle timer when last socket detaches', () => {
    manager.getOrCreateSession('proj-a', '/tmp/proj-a', 80, 24);
    const socket = makeMockSocket();
    manager.attachSocket('proj-a', socket);
    manager.detachSocket('proj-a', socket);

    // Advance past idle timeout (5 min)
    vi.advanceTimersByTime(300_000);

    expect(mockKill).toHaveBeenCalledOnce();
  });

  it('clears idle timer when a socket attaches', () => {
    manager.getOrCreateSession('proj-a', '/tmp/proj-a', 80, 24);

    const socket1 = makeMockSocket();
    manager.attachSocket('proj-a', socket1);
    manager.detachSocket('proj-a', socket1);

    // Attach a new socket before idle expires
    const socket2 = makeMockSocket();
    manager.attachSocket('proj-a', socket2);

    vi.advanceTimersByTime(300_000);

    // Session should still be alive (timer was cleared)
    expect(mockKill).not.toHaveBeenCalled();
  });

  it('destroys session and closes all sockets on PTY exit', () => {
    manager.getOrCreateSession('proj-a', '/tmp/proj-a', 80, 24);
    const socket = makeMockSocket();
    manager.attachSocket('proj-a', socket);

    // Trigger PTY exit
    const exitCallback = mockOnExit.mock.calls[0]![0] as () => void;
    exitCallback();

    expect(socket.close).toHaveBeenCalledOnce();
    // Session should be gone — getReplayData returns empty
    expect(manager.getReplayData('proj-a')).toBe('');
  });

  it('does not store session when PTY spawn fails', () => {
    mockSpawn.mockImplementation(() => {
      throw new Error('spawn failed');
    });

    expect(() => manager.getOrCreateSession('proj-a', '/tmp/proj-a', 80, 24)).toThrow(
      'spawn failed',
    );
    expect(manager.getReplayData('proj-a')).toBe('');
  });

  it('destroyAll kills all sessions', () => {
    manager.getOrCreateSession('proj-a', '/tmp/proj-a', 80, 24);
    manager.getOrCreateSession('proj-b', '/tmp/proj-b', 80, 24);

    const socket = makeMockSocket();
    manager.attachSocket('proj-a', socket);

    manager.destroyAll();

    expect(mockKill).toHaveBeenCalledTimes(2);
    expect(socket.close).toHaveBeenCalledOnce();
  });

  it('silently ignores send errors on closed sockets during fan-out', () => {
    manager.getOrCreateSession('proj-a', '/tmp/proj-a', 80, 24);

    const socket = makeMockSocket();
    socket.send.mockImplementation(() => {
      throw new Error('socket closed');
    });
    manager.attachSocket('proj-a', socket);

    const dataCallback = mockOnData.mock.calls[0]![0] as (data: string) => void;
    // Should not throw
    expect(() => dataCallback('test')).not.toThrow();
  });

  it('ignores operations on non-existent sessions', () => {
    // These should not throw
    manager.writeToSession('nonexistent', 'data');
    manager.resizeSession('nonexistent', 80, 24);
    manager.detachSocket('nonexistent', makeMockSocket());
    manager.destroySession('nonexistent');
    expect(manager.getReplayData('nonexistent')).toBe('');
  });
});
