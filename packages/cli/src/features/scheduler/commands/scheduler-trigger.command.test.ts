import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('node:child_process', () => ({
  execFileSync: vi.fn().mockReturnValue('task output'),
}));

import * as clack from '@clack/prompts';
import { execFileSync } from 'node:child_process';
import { handleSchedulerTrigger, parseCommandString } from './scheduler-trigger.command.js';

describe('parseCommandString', () => {
  it('splits simple command on whitespace', () => {
    expect(parseCommandString('echo hello')).toEqual(['echo', 'hello']);
  });

  it('handles double-quoted arguments', () => {
    expect(parseCommandString('echo "hello world"')).toEqual(['echo', 'hello world']);
  });

  it('handles single-quoted arguments', () => {
    expect(parseCommandString("echo 'hello world'")).toEqual(['echo', 'hello world']);
  });

  it('handles escaped spaces', () => {
    expect(parseCommandString('echo hello\\ world')).toEqual(['echo', 'hello world']);
  });

  it('handles mixed quotes and args', () => {
    expect(parseCommandString('cmd --msg "hello world" --flag')).toEqual([
      'cmd',
      '--msg',
      'hello world',
      '--flag',
    ]);
  });

  it('returns empty array for empty string', () => {
    expect(parseCommandString('')).toEqual([]);
  });
});

describe('scheduler-trigger command', () => {
  let mockDb: {
    prepare: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const mockRun = vi.fn();
    const mockGet = vi.fn();
    mockDb = {
      prepare: vi.fn().mockReturnValue({ get: mockGet, run: mockRun }),
    };
  });

  it('reports error when task not found', () => {
    mockDb.prepare.mockReturnValue({
      get: vi.fn().mockReturnValue(undefined),
      run: vi.fn(),
    });

    handleSchedulerTrigger({ taskId: 'nonexistent', db: mockDb as never });

    expect(clack.log.error).toHaveBeenCalledWith(expect.stringContaining('not found'));
  });

  it('executes task command and records success', () => {
    const mockGet = vi.fn().mockReturnValue({
      id: 'figma:sync',
      command: 'echo hello',
      enabled: 1,
    });
    const mockRun = vi.fn();
    mockDb.prepare.mockReturnValue({ get: mockGet, run: mockRun });

    handleSchedulerTrigger({ taskId: 'figma:sync', db: mockDb as never });

    expect(execFileSync).toHaveBeenCalledWith('echo', ['hello'], expect.any(Object));
    expect(clack.log.success).toHaveBeenCalled();
    expect(mockRun).toHaveBeenCalled();
  });

  it('records error on task failure', () => {
    const mockGet = vi.fn().mockReturnValue({
      id: 'bad-task',
      command: 'false',
      enabled: 1,
    });
    const mockRun = vi.fn();
    mockDb.prepare.mockReturnValue({ get: mockGet, run: mockRun });
    vi.mocked(execFileSync).mockImplementation(() => {
      throw new Error('command failed');
    });

    handleSchedulerTrigger({ taskId: 'bad-task', db: mockDb as never });

    expect(clack.log.error).toHaveBeenCalledWith(expect.stringContaining('failed'));
    expect(mockRun).toHaveBeenCalled();
  });
});
