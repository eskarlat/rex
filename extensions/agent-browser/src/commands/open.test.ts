import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Commands are thin wrappers around `browserCommand()`.
 * We test the command module shape (exports defineCommand result)
 * and the argument schemas. The actual CLI execution is tested
 * via integration tests against a real agent-browser instance.
 */

// Mock execFile to avoid actually running agent-browser
vi.mock('node:child_process', () => ({
  execFile: vi.fn((_cmd: string, _args: string[], _opts: unknown, cb?: Function) => {
    if (cb) cb(null, { stdout: '{"url":"https://example.com","title":"Example"}', stderr: '' });
    return { on: vi.fn() };
  }),
}));
vi.mock('node:util', () => ({
  promisify: (fn: Function) => (...args: unknown[]) =>
    new Promise((resolve, reject) => {
      fn(...args, (err: unknown, result: unknown) => {
        if (err) reject(err);
        else resolve(result);
      });
    }),
}));

describe('open command', () => {
  it('exports a defineCommand result with handler and argsSchema', async () => {
    const mod = await import('./open.js');
    const command = mod.default;
    expect(command).toBeDefined();
    expect(command).toHaveProperty('handler');
    expect(typeof command.handler).toBe('function');
    expect(command).toHaveProperty('argsSchema');
  });
});
