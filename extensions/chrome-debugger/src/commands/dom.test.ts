import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ExecutionContext } from '../shared/types.js';

const mockEvaluate = vi.fn();
const mockDisconnect = vi.fn();

vi.mock('../shared/connection.js', () => ({
  withBrowser: vi.fn().mockImplementation(
    (_projectPath: string, fn: (browser: unknown, page: unknown) => Promise<unknown>) =>
      fn(
        { disconnect: mockDisconnect },
        { evaluate: mockEvaluate }
      )
  ),
}));

import dom from './dom.js';

function makeContext(args: Record<string, unknown> = {}): ExecutionContext {
  return {
    projectName: 'test',
    projectPath: '/tmp/test-project',
    args: { _positional: [], ...args },
    config: {},
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('dom', () => {
  it('returns full page DOM tree when no selector', async () => {
    mockEvaluate.mockResolvedValue('<html>\n<body>\n<h1>Hello</h1>\n</body>\n</html>');

    const result = await dom(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('## DOM Tree');
    expect(result.output).toContain('<html>');
    expect(result.output).toContain('<h1>Hello</h1>');
  });

  it('returns DOM subtree for selector', async () => {
    mockEvaluate.mockResolvedValue('<div id="main"><p>Content</p></div>');

    const result = await dom(makeContext({ selector: '#main' }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('DOM: `#main`');
    expect(result.output).toContain('<div id="main">');
  });

  it('uses default depth of 5', async () => {
    mockEvaluate.mockResolvedValue('<html></html>');

    await dom(makeContext());
    // The second arg to evaluate is the serialization function, third is depth
    expect(mockEvaluate).toHaveBeenCalledWith(expect.any(Function), 5);
  });

  it('uses custom depth', async () => {
    mockEvaluate.mockResolvedValue('<html></html>');

    await dom(makeContext({ depth: 3 }));
    expect(mockEvaluate).toHaveBeenCalledWith(expect.any(Function), 3);
  });

  it('passes selector and depth when selector is provided', async () => {
    mockEvaluate.mockResolvedValue('<div></div>');

    await dom(makeContext({ selector: '.container', depth: 2 }));
    expect(mockEvaluate).toHaveBeenCalledWith(expect.any(Function), '.container', 2);
  });

  it('wraps output in code block', async () => {
    mockEvaluate.mockResolvedValue('<p>test</p>');

    const result = await dom(makeContext());
    expect(result.output).toContain('```html');
    expect(result.output).toContain('```');
  });
});
