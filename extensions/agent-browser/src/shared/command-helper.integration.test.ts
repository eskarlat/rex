import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node:child_process', () => ({
  execFile: vi.fn(),
}));
vi.mock('node:util', () => ({
  promisify:
    (fn: Function) =>
    (...args: unknown[]) =>
      new Promise((resolve, reject) => {
        fn(...args, (err: unknown, result: unknown) => {
          if (err) reject(err);
          else resolve(result);
        });
      }),
}));

import { execFile } from 'node:child_process';
import { browserCommand } from './command-helper.js';
import type { CommandContext } from './types.js';

const mockExecFile = vi.mocked(execFile);

function makeCtx(args: Record<string, unknown> = {}, config: Record<string, unknown> = {}): CommandContext {
  return {
    projectName: 'test',
    projectPath: '/tmp/test',
    args,
    config,
  };
}

function mockSuccess(stdout: string) {
  mockExecFile.mockImplementation(
    ((_cmd: unknown, _args: unknown, _opts: unknown, cb: (err: null, res: { stdout: string; stderr: string }) => void) => {
      cb(null, { stdout, stderr: '' });
      return { on: vi.fn() };
    }) as unknown as typeof execFile,
  );
}

function mockError(message: string) {
  mockExecFile.mockImplementation(
    ((_cmd: unknown, _args: unknown, _opts: unknown, cb: (err: Error) => void) => {
      cb(new Error(message));
      return { on: vi.fn() };
    }) as unknown as typeof execFile,
  );
}

describe('browserCommand', () => {
  beforeEach(() => {
    mockExecFile.mockReset();
  });

  it('calls execFile with bin path, config flags, and command args', async () => {
    mockSuccess('{"url":"https://example.com"}');

    const result = await browserCommand(makeCtx(), ['open', 'https://example.com']);
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('https://example.com');

    const callArgs = mockExecFile.mock.calls[0]!;
    const cliArgs = callArgs[1] as string[];
    expect(cliArgs).toContain('--json');
    expect(cliArgs).toContain('open');
    expect(cliArgs).toContain('https://example.com');
  });

  it('includes session flag from config', async () => {
    mockSuccess('{}');
    await browserCommand(makeCtx({}, { session: 'my-session' }), ['status']);
    const cliArgs = mockExecFile.mock.calls[0]![1] as string[];
    expect(cliArgs).toContain('--session');
    expect(cliArgs).toContain('my-session');
  });

  it('includes profile flag from config', async () => {
    mockSuccess('{}');
    await browserCommand(makeCtx({}, { profile: '/tmp/profile' }), ['open', 'url']);
    const cliArgs = mockExecFile.mock.calls[0]![1] as string[];
    expect(cliArgs).toContain('--profile');
    expect(cliArgs).toContain('/tmp/profile');
  });

  it('parses JSON stdout', async () => {
    mockSuccess('{"title":"Test Page"}');
    const result = await browserCommand(makeCtx(), ['get', 'url']);
    expect(result.exitCode).toBe(0);
    const parsed = JSON.parse(result.output) as Record<string, unknown>;
    expect(parsed['title']).toBe('Test Page');
  });

  it('returns raw string for non-JSON stdout', async () => {
    mockSuccess('plain text output');
    const result = await browserCommand(makeCtx(), ['snapshot']);
    expect(result.exitCode).toBe(0);
    expect(result.output).toBe('plain text output');
  });

  it('returns success for empty stdout', async () => {
    mockSuccess('');
    const result = await browserCommand(makeCtx(), ['close']);
    expect(result.exitCode).toBe(0);
    const parsed = JSON.parse(result.output) as Record<string, unknown>;
    expect(parsed['success']).toBe(true);
  });

  it('returns error on process failure', async () => {
    mockError('browser not running');
    const result = await browserCommand(makeCtx(), ['click', '@e1']);
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('browser not running');
  });

  it('uses custom timeout from config', async () => {
    mockSuccess('{}');
    await browserCommand(makeCtx({}, { timeout: 50_000 }), ['wait', '#el']);
    const opts = mockExecFile.mock.calls[0]![2] as { timeout: number };
    expect(opts.timeout).toBe(50_000);
  });

  it('uses default timeout when not configured', async () => {
    mockSuccess('{}');
    await browserCommand(makeCtx(), ['status']);
    const opts = mockExecFile.mock.calls[0]![2] as { timeout: number };
    expect(opts.timeout).toBe(25_000);
  });
});
