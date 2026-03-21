import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockIntro = vi.fn();
const mockOutro = vi.fn();
const mockLogWarn = vi.fn();
const mockLogSuccess = vi.fn();
const mockLogError = vi.fn();

vi.mock('@clack/prompts', () => ({
  intro: (...args: unknown[]) => mockIntro(...args),
  outro: (...args: unknown[]) => mockOutro(...args),
  log: {
    warn: (...args: unknown[]) => mockLogWarn(...args),
    success: (...args: unknown[]) => mockLogSuccess(...args),
    error: (...args: unknown[]) => mockLogError(...args),
  },
}));

const mockExistsSync = vi.fn();
const mockUnlinkSync = vi.fn();

vi.mock('node:fs', () => ({
  existsSync: (...args: unknown[]) => mockExistsSync(...args),
  unlinkSync: (...args: unknown[]) => mockUnlinkSync(...args),
}));

vi.mock('../../../core/paths/paths.js', () => ({
  // eslint-disable-next-line sonarjs/publicly-writable-directories
  SERVER_PID_PATH: '/tmp/test-server.pid',
  // eslint-disable-next-line sonarjs/publicly-writable-directories
  LOGS_DIR: '/tmp/test-logs',
}));

vi.mock('../../../core/logger/index.js', () => ({
  getLogger: () => ({ warn: vi.fn() }),
}));

const mockIsProcessRunning = vi.fn();
const mockReadPidFile = vi.fn();

vi.mock('../../../shared/process-utils.js', () => ({
  isProcessRunning: (...args: unknown[]) => mockIsProcessRunning(...args),
  readPidFile: (...args: unknown[]) => mockReadPidFile(...args),
}));

const { handleStop } = await import('./stop.command.js');

describe('stop command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('warns when no PID file exists', () => {
    mockReadPidFile.mockReturnValue(null);

    handleStop();

    expect(mockIntro).toHaveBeenCalledWith('Stop RenreKit Dashboard');
    expect(mockLogWarn).toHaveBeenCalledWith('No running dashboard server found.');
    expect(mockOutro).toHaveBeenCalledWith('Nothing to stop.');
  });

  it('cleans up stale PID when process is not running', () => {
    mockReadPidFile.mockReturnValue(99999);
    mockIsProcessRunning.mockReturnValue(false);

    handleStop();

    expect(mockLogWarn).toHaveBeenCalledWith(expect.stringContaining('99999'));
    expect(mockUnlinkSync).toHaveBeenCalled();
    expect(mockOutro).toHaveBeenCalledWith('Nothing to stop.');
  });

  it('sends SIGTERM and removes PID file when server is running', () => {
    mockReadPidFile.mockReturnValue(12345);
    mockIsProcessRunning.mockReturnValue(true);
    mockExistsSync.mockReturnValue(true);

    const killSpy = vi.spyOn(process, 'kill').mockImplementation(() => true);

    handleStop();

    expect(killSpy).toHaveBeenCalledWith(12345);
    expect(mockLogSuccess).toHaveBeenCalledWith(expect.stringContaining('12345'));
    expect(mockUnlinkSync).toHaveBeenCalled();
    expect(mockOutro).toHaveBeenCalledWith('Done.');

    killSpy.mockRestore();
  });

  it('handles error when kill fails', () => {
    mockReadPidFile.mockReturnValue(12345);
    mockIsProcessRunning.mockReturnValue(true);
    mockExistsSync.mockReturnValue(true);

    const killSpy = vi.spyOn(process, 'kill').mockImplementation(() => {
      throw new Error('Operation not permitted');
    });

    handleStop();

    expect(mockLogError).toHaveBeenCalledWith(expect.stringContaining('Operation not permitted'));
    expect(mockUnlinkSync).toHaveBeenCalled();

    killSpy.mockRestore();
  });

  it('handles error when unlinkSync fails for stale PID cleanup', () => {
    mockReadPidFile.mockReturnValue(99999);
    mockIsProcessRunning.mockReturnValue(false);
    mockUnlinkSync.mockImplementation(() => {
      throw new Error('Permission denied');
    });

    handleStop();

    expect(mockLogWarn).toHaveBeenCalledWith(expect.stringContaining('99999'));
    expect(mockOutro).toHaveBeenCalledWith('Nothing to stop.');
  });

  it('handles error when PID file cleanup fails after stop', () => {
    mockReadPidFile.mockReturnValue(12345);
    mockIsProcessRunning.mockReturnValue(true);
    mockExistsSync.mockReturnValue(true);

    const killSpy = vi.spyOn(process, 'kill').mockImplementation(() => true);
    mockUnlinkSync.mockImplementation(() => {
      throw new Error('Busy');
    });

    handleStop();

    expect(killSpy).toHaveBeenCalledWith(12345);
    expect(mockLogSuccess).toHaveBeenCalledWith(expect.stringContaining('12345'));
    expect(mockOutro).toHaveBeenCalledWith('Done.');

    killSpy.mockRestore();
  });

  it('skips PID file removal when already cleaned up', () => {
    mockReadPidFile.mockReturnValue(12345);
    mockIsProcessRunning.mockReturnValue(true);
    mockExistsSync.mockReturnValue(false);

    vi.spyOn(process, 'kill').mockImplementation(() => true);

    handleStop();

    // unlinkSync not called because existsSync returns false after kill
    expect(mockUnlinkSync).not.toHaveBeenCalled();

    vi.restoreAllMocks();
  });
});
