import { describe, it, expect, vi } from 'vitest';

// Mock child_process to avoid running agent-browser
vi.mock('node:child_process', () => ({
  execFile: vi.fn(
    (_cmd: string, _args: unknown[], _opts: unknown, cb?: (err: null, result: { stdout: string; stderr: string }) => void) => {
      if (cb) cb(null, { stdout: '{}', stderr: '' });
      return { on: vi.fn() };
    },
  ),
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

/**
 * All commands export a defineCommand result.
 * We test:
 * 1. Module exports a default with `handler` and optionally `argsSchema`
 * 2. Commands with args have a Zod schema that validates correctly
 */

const commandModules = [
  // Core Navigation
  'open',
  'close',
  'status',
  'back',
  'forward',
  'reload',
  // Interaction
  'click',
  'type',
  'fill',
  'select',
  'hover',
  'scroll',
  'wait',
  // Capture & Extraction
  'screenshot',
  'snapshot',
  'eval',
  'get-text',
  'get-html',
  'get-url',
  'pdf',
  // Find Elements
  'find-role',
  'find-text',
  'find-label',
  // Tabs, Cookies & Storage
  'tabs',
  'cookies-get',
  'cookies-set',
  'cookies-clear',
  'storage',
  // Debug & Inspect
  'console',
  'errors',
  'network',
  'highlight',
  'trace-start',
  'trace-stop',
  'diff-snapshot',
  'diff-screenshot',
  // Batch
  'batch',
] as const;

describe('command modules', () => {
  for (const name of commandModules) {
    it(`${name} exports handler`, async () => {
      const mod = await import(`./${name}.js`);
      expect(mod.default).toBeDefined();
      expect(mod.default).toHaveProperty('handler');
      expect(typeof mod.default.handler).toBe('function');
    });
  }
});

describe('command arg validation', () => {
  it('open requires url', async () => {
    const { default: cmd } = await import('./open.js');
    expect(cmd.argsSchema).toBeDefined();
    const schema = cmd.argsSchema!;
    const result = schema.safeParse({});
    expect(result.success).toBe(false);
    expect(schema.safeParse({ url: 'https://example.com' }).success).toBe(true);
  });

  it('click requires ref', async () => {
    const { default: cmd } = await import('./click.js');
    const schema = cmd.argsSchema!;
    expect(schema.safeParse({}).success).toBe(false);
    expect(schema.safeParse({ ref: '@e1' }).success).toBe(true);
  });

  it('type requires ref and text', async () => {
    const { default: cmd } = await import('./type.js');
    const schema = cmd.argsSchema!;
    expect(schema.safeParse({ ref: '@e1' }).success).toBe(false);
    expect(schema.safeParse({ ref: '@e1', text: 'hello' }).success).toBe(true);
  });

  it('scroll requires valid direction', async () => {
    const { default: cmd } = await import('./scroll.js');
    const schema = cmd.argsSchema!;
    expect(schema.safeParse({ direction: 'invalid' }).success).toBe(false);
    expect(schema.safeParse({ direction: 'down' }).success).toBe(true);
    expect(schema.safeParse({ direction: 'up', pixels: 500 }).success).toBe(true);
  });

  it('snapshot accepts boolean flags with defaults', async () => {
    const { default: cmd } = await import('./snapshot.js');
    const schema = cmd.argsSchema!;
    const result = schema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.interactive).toBe(false);
      expect(result.data.compact).toBe(false);
    }
  });

  it('find-role requires role and action', async () => {
    const { default: cmd } = await import('./find-role.js');
    const schema = cmd.argsSchema!;
    expect(schema.safeParse({}).success).toBe(false);
    expect(schema.safeParse({ role: 'button', action: 'click' }).success).toBe(true);
    expect(schema.safeParse({ role: 'button', action: 'invalid' }).success).toBe(false);
  });

  it('cookies-set requires name and value', async () => {
    const { default: cmd } = await import('./cookies-set.js');
    const schema = cmd.argsSchema!;
    expect(schema.safeParse({}).success).toBe(false);
    expect(schema.safeParse({ name: 'token', value: 'abc123' }).success).toBe(true);
    expect(
      schema.safeParse({
        name: 'token',
        value: 'abc',
        domain: '.example.com',
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
      }).success,
    ).toBe(true);
  });

  it('storage requires type', async () => {
    const { default: cmd } = await import('./storage.js');
    const schema = cmd.argsSchema!;
    expect(schema.safeParse({}).success).toBe(false);
    expect(schema.safeParse({ type: 'local' }).success).toBe(true);
    expect(schema.safeParse({ type: 'session', action: 'set', key: 'k', value: 'v' }).success).toBe(true);
  });

  it('batch requires commands array', async () => {
    const { default: cmd } = await import('./batch.js');
    const schema = cmd.argsSchema!;
    expect(schema.safeParse({}).success).toBe(false);
    expect(
      schema.safeParse({
        commands: [
          ['open', 'https://example.com'],
          ['screenshot'],
        ],
      }).success,
    ).toBe(true);
  });

  it('diff-screenshot requires baseline', async () => {
    const { default: cmd } = await import('./diff-screenshot.js');
    const schema = cmd.argsSchema!;
    expect(schema.safeParse({}).success).toBe(false);
    expect(schema.safeParse({ baseline: '/path/to/baseline.png' }).success).toBe(true);
  });

  it('eval requires code', async () => {
    const { default: cmd } = await import('./eval.js');
    const schema = cmd.argsSchema!;
    expect(schema.safeParse({}).success).toBe(false);
    expect(schema.safeParse({ code: 'document.title' }).success).toBe(true);
  });

  it('pdf requires path', async () => {
    const { default: cmd } = await import('./pdf.js');
    const schema = cmd.argsSchema!;
    expect(schema.safeParse({}).success).toBe(false);
    expect(schema.safeParse({ path: '/tmp/report.pdf' }).success).toBe(true);
  });

  it('no-arg commands have no argsSchema', async () => {
    const noArgCommands = [
      'close', 'status', 'back', 'forward', 'reload',
      'get-url', 'tabs', 'trace-stop', 'diff-snapshot',
    ];
    for (const name of noArgCommands) {
      const { default: cmd } = await import(`./${name}.js`);
      expect(cmd.argsSchema).toBeUndefined();
    }
  });
});
