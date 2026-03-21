import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ChildProcess } from 'node:child_process';

vi.mock('node:child_process', () => ({
  spawn: vi.fn(() => ({
    kill: vi.fn(),
    unref: vi.fn(),
  })),
}));

describe('preventSleep', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('spawns caffeinate on macOS', async () => {
    vi.doMock('node:os', () => ({
      default: { platform: () => 'darwin' },
    }));
    const { spawn } = await import('node:child_process');
    const { preventSleep } = await import('./sleep-prevention.js');

    const lock = preventSleep();
    expect(spawn).toHaveBeenCalledWith(
      'caffeinate',
      ['-d'],
      expect.objectContaining({ stdio: 'ignore' }),
    );
    lock.release();
  });

  it('spawns systemd-inhibit on linux', async () => {
    vi.doMock('node:os', () => ({
      default: { platform: () => 'linux' },
    }));
    const { spawn } = await import('node:child_process');
    const { preventSleep } = await import('./sleep-prevention.js');

    const lock = preventSleep();
    expect(spawn).toHaveBeenCalledWith(
      'systemd-inhibit',
      expect.arrayContaining(['--what=idle']),
      expect.objectContaining({ stdio: 'ignore' }),
    );
    lock.release();
  });

  it('returns noop lock on unsupported platforms', async () => {
    vi.doMock('node:os', () => ({
      default: { platform: () => 'win32' },
    }));
    const { preventSleep } = await import('./sleep-prevention.js');

    const lock = preventSleep();
    // Should not throw
    lock.release();
    expect(lock).toBeDefined();
  });

  it('kills the process on release for macOS', async () => {
    vi.doMock('node:os', () => ({
      default: { platform: () => 'darwin' },
    }));
    const { spawn } = await import('node:child_process');
    const mockKill = vi.fn();
    (spawn as ReturnType<typeof vi.fn>).mockReturnValue({
      kill: mockKill,
      unref: vi.fn(),
    } as unknown as ChildProcess);

    const { preventSleep } = await import('./sleep-prevention.js');
    const lock = preventSleep();
    lock.release();
    expect(mockKill).toHaveBeenCalled();
  });
});
