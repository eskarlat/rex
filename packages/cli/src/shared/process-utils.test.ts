import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockExistsSync = vi.fn();
const mockReadFileSync = vi.fn();

vi.mock('node:fs', () => ({
  existsSync: (...args: unknown[]) => mockExistsSync(...args),
  readFileSync: (...args: unknown[]) => mockReadFileSync(...args),
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
});
