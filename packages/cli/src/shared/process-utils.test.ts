import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockExistsSync = vi.fn();
const mockReadFileSync = vi.fn();

vi.mock('node:fs', () => ({
  existsSync: (...args: unknown[]) => mockExistsSync(...args),
  readFileSync: (...args: unknown[]) => mockReadFileSync(...args),
}));

vi.mock('../core/logger/index.js', () => ({
  getLogger: () => ({
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  }),
}));

const { isProcessRunning, readPidFile } = await import('./process-utils.js');

describe('isProcessRunning', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true for the current process PID', () => {
    expect(isProcessRunning(process.pid)).toBe(true);
  });

  it('returns false for a non-existent PID', () => {
    // PID 0 is special and will throw EPERM on some systems, use a very high PID
    expect(isProcessRunning(4000000)).toBe(false);
  });

  it('returns true when process.kill throws EPERM (process exists, different user)', () => {
    const killSpy = vi.spyOn(process, 'kill').mockImplementation(() => {
      const err = new Error('EPERM') as NodeJS.ErrnoException;
      err.code = 'EPERM';
      throw err;
    });

    expect(isProcessRunning(99999)).toBe(true);

    killSpy.mockRestore();
  });

  it('returns false when process.kill throws ESRCH (no such process)', () => {
    const killSpy = vi.spyOn(process, 'kill').mockImplementation(() => {
      const err = new Error('ESRCH') as NodeJS.ErrnoException;
      err.code = 'ESRCH';
      throw err;
    });

    expect(isProcessRunning(99999)).toBe(false);

    killSpy.mockRestore();
  });
});

describe('readPidFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when file does not exist', () => {
    mockExistsSync.mockReturnValue(false);
    expect(readPidFile('/fake/path')).toBeNull();
  });

  it('returns null for invalid content', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue('not-a-number');
    expect(readPidFile('/fake/path')).toBeNull();
  });

  it('returns null for negative PID', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue('-5');
    expect(readPidFile('/fake/path')).toBeNull();
  });

  it('returns null for zero PID', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue('0');
    expect(readPidFile('/fake/path')).toBeNull();
  });

  it('returns the PID for valid content', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue('12345\n');
    expect(readPidFile('/fake/path')).toBe(12345);
  });

  it('returns null when file is removed between existsSync and readFileSync', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockImplementation(() => {
      throw new Error('ENOENT: no such file or directory');
    });
    expect(readPidFile('/fake/path')).toBeNull();
  });
});
