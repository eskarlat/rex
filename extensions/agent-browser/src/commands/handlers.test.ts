import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the command-helper to track what args are passed to browserCommand
const mockBrowserCommand = vi.fn().mockResolvedValue({ output: '{}', exitCode: 0 });
const mockGetBinPath = vi.fn().mockReturnValue('/bin/agent-browser');
const mockGetConfigFlags = vi.fn().mockReturnValue(['--json']);

vi.mock('../shared/command-helper.js', () => ({
  browserCommand: mockBrowserCommand,
  getBinPath: mockGetBinPath,
  getConfigFlags: mockGetConfigFlags,
}));

// Mock child_process for batch command
vi.mock('node:child_process', () => ({
  spawn: vi.fn(() => ({
    stdout: { on: vi.fn() },
    stderr: { on: vi.fn() },
    stdin: { write: vi.fn(), end: vi.fn() },
    on: vi.fn((event: string, cb: (code: number) => void) => {
      if (event === 'close') setTimeout(() => cb(0), 0);
    }),
  })),
}));

import type { CommandContext } from '../shared/types.js';

function makeCtx<T extends Record<string, unknown>>(args: T): CommandContext<T> {
  return {
    projectName: 'test',
    projectPath: '/tmp/test',
    args,
    config: {},
  };
}

beforeEach(() => {
  mockBrowserCommand.mockClear();
});

describe('Core Navigation handlers', () => {
  it('open passes url', async () => {
    const { default: cmd } = await import('./open.js');
    await cmd.handler(makeCtx({ url: 'https://example.com' }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(
      expect.objectContaining({ args: { url: 'https://example.com' } }),
      ['open', 'https://example.com'],
    );
  });

  it('close passes no args', async () => {
    const { default: cmd } = await import('./close.js');
    await cmd.handler(makeCtx({}));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['close']);
  });

  it('status gets cdp-url', async () => {
    const { default: cmd } = await import('./status.js');
    await cmd.handler(makeCtx({}));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['get', 'cdp-url']);
  });

  it('back navigates back', async () => {
    const { default: cmd } = await import('./back.js');
    await cmd.handler(makeCtx({}));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['back']);
  });

  it('forward navigates forward', async () => {
    const { default: cmd } = await import('./forward.js');
    await cmd.handler(makeCtx({}));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['forward']);
  });

  it('reload reloads page', async () => {
    const { default: cmd } = await import('./reload.js');
    await cmd.handler(makeCtx({}));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['reload']);
  });
});

describe('Interaction handlers', () => {
  it('click passes ref', async () => {
    const { default: cmd } = await import('./click.js');
    await cmd.handler(makeCtx({ ref: '@e1' }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['click', '@e1']);
  });

  it('type passes ref and text', async () => {
    const { default: cmd } = await import('./type.js');
    await cmd.handler(makeCtx({ ref: '@e2', text: 'hello' }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['type', '@e2', 'hello']);
  });

  it('fill passes ref and text', async () => {
    const { default: cmd } = await import('./fill.js');
    await cmd.handler(makeCtx({ ref: '@e3', text: 'world' }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['fill', '@e3', 'world']);
  });

  it('select passes ref and value', async () => {
    const { default: cmd } = await import('./select.js');
    await cmd.handler(makeCtx({ ref: '@e4', value: 'option1' }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['select', '@e4', 'option1']);
  });

  it('hover passes ref', async () => {
    const { default: cmd } = await import('./hover.js');
    await cmd.handler(makeCtx({ ref: '@e5' }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['hover', '@e5']);
  });

  it('scroll passes direction only', async () => {
    const { default: cmd } = await import('./scroll.js');
    await cmd.handler(makeCtx({ direction: 'down' as const }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['scroll', 'down']);
  });

  it('scroll passes direction and pixels', async () => {
    const { default: cmd } = await import('./scroll.js');
    await cmd.handler(makeCtx({ direction: 'up' as const, pixels: 500 }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['scroll', 'up', '500']);
  });

  it('wait passes target', async () => {
    const { default: cmd } = await import('./wait.js');
    await cmd.handler(makeCtx({ target: '#my-element' }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['wait', '#my-element']);
  });
});

describe('Capture & Extraction handlers', () => {
  it('screenshot with no path', async () => {
    const { default: cmd } = await import('./screenshot.js');
    await cmd.handler(makeCtx({}));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['screenshot']);
  });

  it('screenshot with path', async () => {
    const { default: cmd } = await import('./screenshot.js');
    await cmd.handler(makeCtx({ path: '/tmp/shot.png' }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['screenshot', '/tmp/shot.png']);
  });

  it('snapshot default flags', async () => {
    const { default: cmd } = await import('./snapshot.js');
    await cmd.handler(makeCtx({ interactive: false, compact: false }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['snapshot']);
  });

  it('snapshot with interactive and compact', async () => {
    const { default: cmd } = await import('./snapshot.js');
    await cmd.handler(makeCtx({ interactive: true, compact: true }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['snapshot', '-i', '-c']);
  });

  it('eval passes code', async () => {
    const { default: cmd } = await import('./eval.js');
    await cmd.handler(makeCtx({ code: 'document.title' }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['eval', 'document.title']);
  });

  it('get-text with no ref', async () => {
    const { default: cmd } = await import('./get-text.js');
    await cmd.handler(makeCtx({}));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['get', 'text']);
  });

  it('get-text with ref', async () => {
    const { default: cmd } = await import('./get-text.js');
    await cmd.handler(makeCtx({ ref: '@e1' }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['get', 'text', '@e1']);
  });

  it('get-html with ref', async () => {
    const { default: cmd } = await import('./get-html.js');
    await cmd.handler(makeCtx({ ref: '#main' }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['get', 'html', '#main']);
  });

  it('get-url', async () => {
    const { default: cmd } = await import('./get-url.js');
    await cmd.handler(makeCtx({}));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['get', 'url']);
  });

  it('pdf passes path', async () => {
    const { default: cmd } = await import('./pdf.js');
    await cmd.handler(makeCtx({ path: '/tmp/report.pdf' }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['pdf', '/tmp/report.pdf']);
  });
});

describe('Find Elements handlers', () => {
  it('find-role with role and action', async () => {
    const { default: cmd } = await import('./find-role.js');
    await cmd.handler(makeCtx({ role: 'button', action: 'click' as const }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['find', 'role', 'button', 'click']);
  });

  it('find-role with name', async () => {
    const { default: cmd } = await import('./find-role.js');
    await cmd.handler(makeCtx({ role: 'button', action: 'click' as const, name: 'Submit' }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['find', 'role', 'button', 'click', '--name', 'Submit']);
  });

  it('find-role with text', async () => {
    const { default: cmd } = await import('./find-role.js');
    await cmd.handler(makeCtx({ role: 'textbox', action: 'fill' as const, text: 'hello' }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['find', 'role', 'textbox', 'fill', 'hello']);
  });

  it('find-text with text and action', async () => {
    const { default: cmd } = await import('./find-text.js');
    await cmd.handler(makeCtx({ text: 'Sign In', action: 'click' as const }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['find', 'text', 'Sign In', 'click']);
  });

  it('find-label with label, action, and text', async () => {
    const { default: cmd } = await import('./find-label.js');
    await cmd.handler(makeCtx({ label: 'Email', action: 'fill' as const, text: 'user@test.com' }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['find', 'label', 'Email', 'fill', 'user@test.com']);
  });
});

describe('Tabs, Cookies & Storage handlers', () => {
  it('tabs lists tabs', async () => {
    const { default: cmd } = await import('./tabs.js');
    await cmd.handler(makeCtx({}));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['tab', 'list']);
  });

  it('cookies-get with no url', async () => {
    const { default: cmd } = await import('./cookies-get.js');
    await cmd.handler(makeCtx({}));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['cookies', 'get']);
  });

  it('cookies-get with url', async () => {
    const { default: cmd } = await import('./cookies-get.js');
    await cmd.handler(makeCtx({ url: 'https://example.com' }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['cookies', 'get', '--url', 'https://example.com']);
  });

  it('cookies-set with all options', async () => {
    const { default: cmd } = await import('./cookies-set.js');
    await cmd.handler(
      makeCtx({
        name: 'token',
        value: 'abc',
        domain: '.example.com',
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'Strict' as const,
        expires: 1700000000,
      }),
    );
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), [
      'cookies', 'set', 'token=abc',
      '--domain', '.example.com',
      '--path', '/',
      '--httpOnly',
      '--secure',
      '--sameSite', 'Strict',
      '--expires', '1700000000',
    ]);
  });

  it('cookies-set with minimal args', async () => {
    const { default: cmd } = await import('./cookies-set.js');
    await cmd.handler(makeCtx({ name: 'k', value: 'v' }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['cookies', 'set', 'k=v']);
  });

  it('cookies-clear', async () => {
    const { default: cmd } = await import('./cookies-clear.js');
    await cmd.handler(makeCtx({}));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['cookies', 'clear']);
  });

  it('cookies-clear with url', async () => {
    const { default: cmd } = await import('./cookies-clear.js');
    await cmd.handler(makeCtx({ url: 'https://example.com' }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['cookies', 'clear', '--url', 'https://example.com']);
  });

  it('storage get with key', async () => {
    const { default: cmd } = await import('./storage.js');
    await cmd.handler(makeCtx({ type: 'local' as const, action: 'get' as const, key: 'theme' }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['storage', 'local', 'get', 'theme']);
  });

  it('storage set with key and value', async () => {
    const { default: cmd } = await import('./storage.js');
    await cmd.handler(makeCtx({ type: 'session' as const, action: 'set' as const, key: 'token', value: 'abc' }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['storage', 'session', 'set', 'token', 'abc']);
  });

  it('storage clear', async () => {
    const { default: cmd } = await import('./storage.js');
    await cmd.handler(makeCtx({ type: 'local' as const, action: 'clear' as const }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['storage', 'local', 'clear']);
  });
});

describe('Debug & Inspect handlers', () => {
  it('console with no flags', async () => {
    const { default: cmd } = await import('./console.js');
    await cmd.handler(makeCtx({ clear: false }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['console']);
  });

  it('console with clear', async () => {
    const { default: cmd } = await import('./console.js');
    await cmd.handler(makeCtx({ clear: true }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['console', '--clear']);
  });

  it('errors with clear', async () => {
    const { default: cmd } = await import('./errors.js');
    await cmd.handler(makeCtx({ clear: true }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['errors', '--clear']);
  });

  it('network with filter', async () => {
    const { default: cmd } = await import('./network.js');
    await cmd.handler(makeCtx({ filter: 'api', clear: false }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['network', 'requests', '--filter', 'api']);
  });

  it('network with clear', async () => {
    const { default: cmd } = await import('./network.js');
    await cmd.handler(makeCtx({ clear: true }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['network', 'requests', '--clear']);
  });

  it('highlight passes ref', async () => {
    const { default: cmd } = await import('./highlight.js');
    await cmd.handler(makeCtx({ ref: '@e1' }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['highlight', '@e1']);
  });

  it('trace-start with no path', async () => {
    const { default: cmd } = await import('./trace-start.js');
    await cmd.handler(makeCtx({}));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['trace', 'start']);
  });

  it('trace-start with path', async () => {
    const { default: cmd } = await import('./trace-start.js');
    await cmd.handler(makeCtx({ path: '/tmp/trace.json' }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['trace', 'start', '/tmp/trace.json']);
  });

  it('trace-stop', async () => {
    const { default: cmd } = await import('./trace-stop.js');
    await cmd.handler(makeCtx({}));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['trace', 'stop']);
  });

  it('diff-snapshot', async () => {
    const { default: cmd } = await import('./diff-snapshot.js');
    await cmd.handler(makeCtx({}));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['diff', 'snapshot']);
  });

  it('diff-screenshot passes baseline', async () => {
    const { default: cmd } = await import('./diff-screenshot.js');
    await cmd.handler(makeCtx({ baseline: '/tmp/base.png' }));
    expect(mockBrowserCommand).toHaveBeenCalledWith(expect.anything(), ['diff', 'screenshot', '--baseline', '/tmp/base.png']);
  });
});

describe('Batch handler', () => {
  it('batch command exists and has handler', async () => {
    const { default: cmd } = await import('./batch.js');
    expect(cmd.handler).toBeDefined();
    // batch uses spawn internally, not browserCommand
    // handler execution is tested via the spawn mock
    const result = await cmd.handler(makeCtx({ commands: [['open', 'https://example.com']], bail: false }));
    expect(result).toBeDefined();
  });
});
