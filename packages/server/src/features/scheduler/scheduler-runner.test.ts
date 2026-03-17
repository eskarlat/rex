import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { execFileSync } from 'node:child_process';

vi.mock('node:child_process', () => ({
  execFileSync: vi.fn(() => 'command output'),
}));

const mockPrepare = vi.fn();
const mockDb = {
  prepare: mockPrepare,
};

vi.mock('@renre-kit/cli/lib', () => ({
  getDb: () => mockDb,
}));

vi.mock('cron-parser', () => ({
  parseExpression: vi.fn(() => ({
    next: () => ({ toISOString: () => '2025-01-01T01:00:00.000Z' }),
  })),
}));

const { SchedulerRunner, parseCommandString } = await import('./scheduler-runner.js');

describe('SchedulerRunner', () => {
  let runner: InstanceType<typeof SchedulerRunner>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    runner = new SchedulerRunner();
  });

  afterEach(() => {
    runner.stop();
    vi.useRealTimers();
  });

  it('starts and stops the timer', () => {
    runner.start();
    // Start again should be idempotent
    runner.start();
    runner.stop();
    // Stop again should be idempotent
    runner.stop();
    expect(runner).toBeDefined();
  });

  it('executes due task commands', () => {
    const dueTasks = [
      { id: 1, name: 'task1', command: 'echo hello', cron: '0 * * * *', enabled: 1, next_run_at: '2024-01-01T00:00:00Z' },
    ];

    // For tick: SELECT due tasks
    mockPrepare.mockReturnValueOnce({ all: () => dueTasks });
    // For executeDueTask: UPDATE task
    mockPrepare.mockReturnValueOnce({ run: vi.fn() });
    // For executeDueTask: INSERT history
    mockPrepare.mockReturnValueOnce({ run: vi.fn() });

    runner.tick();

    expect(execFileSync).toHaveBeenCalledWith('echo', ['hello'], {
      encoding: 'utf-8',
      timeout: 60_000,
    });
    expect(mockPrepare).toHaveBeenCalled();
  });

  it('handles command execution failure', () => {
    const dueTasks = [
      { id: 1, name: 'task1', command: 'badcmd', cron: '0 * * * *', enabled: 1, next_run_at: '2024-01-01T00:00:00Z' },
    ];

    vi.mocked(execFileSync).mockImplementationOnce(() => { throw new Error('command not found'); });
    mockPrepare.mockReturnValueOnce({ all: () => dueTasks });
    mockPrepare.mockReturnValueOnce({ run: vi.fn() });
    mockPrepare.mockReturnValueOnce({ run: vi.fn() });

    runner.tick();

    expect(mockPrepare).toHaveBeenCalled();
  });

  it('initializes next runs for tasks without next_run_at', () => {
    const tasks = [
      { id: 1, name: 'task1', command: 'cmd', cron: '0 * * * *', enabled: 1, next_run_at: null },
    ];

    mockPrepare.mockReturnValueOnce({ all: () => tasks });
    mockPrepare.mockReturnValueOnce({ run: vi.fn() });

    runner.initializeNextRuns();
    expect(mockPrepare).toHaveBeenCalled();
  });

  it('handles empty due tasks', () => {
    mockPrepare.mockReturnValue({ all: () => [] });

    runner.tick();
    expect(mockPrepare).toHaveBeenCalled();
  });

  it('ticks every 60 seconds via interval', () => {
    mockPrepare.mockReturnValue({ all: () => [] });

    runner.start();
    vi.advanceTimersByTime(60_000);

    expect(mockPrepare).toHaveBeenCalled();
  });
});

describe('parseCommandString', () => {
  it('parses simple commands', () => {
    expect(parseCommandString('echo hello')).toEqual(['echo', 'hello']);
  });

  it('handles quoted strings', () => {
    expect(parseCommandString('echo "hello world"')).toEqual(['echo', 'hello world']);
  });

  it('handles single quotes', () => {
    expect(parseCommandString("echo 'hello world'")).toEqual(['echo', 'hello world']);
  });
});
