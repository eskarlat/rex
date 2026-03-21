import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ExecutionContext } from '../shared/types.js';

const mockCreateCDPSession = vi.fn();
const mock$ = vi.fn();
const mockEvaluate = vi.fn();
const mockDisconnect = vi.fn();

const mockClient = {
  send: vi.fn(),
};

vi.mock('../shared/connection.js', () => ({
  withBrowser: vi.fn().mockImplementation(
    (_projectPath: string, fn: (browser: unknown, page: unknown) => Promise<unknown>) =>
      fn(
        { disconnect: mockDisconnect },
        { createCDPSession: mockCreateCDPSession, $: mock$, evaluate: mockEvaluate }
      )
  ),
}));

import a11y from './a11y.js';

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
  mockCreateCDPSession.mockResolvedValue(mockClient);
});

describe('a11y', () => {
  it('returns full accessibility tree when no selector given', async () => {
    mockClient.send.mockResolvedValue({
      nodes: [
        {
          role: { value: 'document' },
          name: { value: 'Page' },
          children: [
            {
              role: { value: 'heading' },
              name: { value: 'Title' },
            },
          ],
        },
      ],
    });

    const result = await a11y(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Accessibility Tree');
    expect(result.output).toContain('document "Page"');
    expect(result.output).toContain('heading "Title"');
  });

  it('uses default depth of 5', async () => {
    mockClient.send.mockResolvedValue({ nodes: [{ role: { value: 'document' } }] });

    await a11y(makeContext());
    expect(mockClient.send).toHaveBeenCalledWith('Accessibility.getFullAXTree', { depth: 5 });
  });

  it('uses custom depth', async () => {
    mockClient.send.mockResolvedValue({ nodes: [{ role: { value: 'document' } }] });

    await a11y(makeContext({ depth: 10 }));
    expect(mockClient.send).toHaveBeenCalledWith('Accessibility.getFullAXTree', { depth: 10 });
  });

  it('returns error when selector element not found', async () => {
    mock$.mockResolvedValue(null);

    const result = await a11y(makeContext({ selector: '#missing' }));
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('No element found');
    expect(result.output).toContain('#missing');
  });

  it('scopes accessibility tree to selector', async () => {
    const mockElement = {
      remoteObject: () => ({ objectId: 'obj-123' }),
    };
    mock$.mockResolvedValue(mockElement);

    mockClient.send.mockImplementation((method: string) => {
      if (method === 'DOM.describeNode') {
        return Promise.resolve({ node: { backendNodeId: 42 } });
      }
      if (method === 'Accessibility.getFullAXTree') {
        return Promise.resolve({
          nodes: [{ role: { value: 'button' }, name: { value: 'Click me' } }],
        });
      }
      return Promise.resolve({});
    });

    const result = await a11y(makeContext({ selector: '#btn', depth: 3 }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Accessibility Tree: `#btn`');
    expect(result.output).toContain('button "Click me"');
    expect(mockClient.send).toHaveBeenCalledWith('Accessibility.getFullAXTree', {
      backendNodeId: 42,
      depth: 3,
    });
  });

  it('skips ignored nodes', async () => {
    mockClient.send.mockResolvedValue({
      nodes: [
        {
          role: { value: 'document' },
          children: [
            { ignored: true, role: { value: 'generic' } },
            { role: { value: 'heading' }, name: { value: 'Visible' } },
          ],
        },
      ],
    });

    const result = await a11y(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).not.toContain('generic');
    expect(result.output).toContain('heading "Visible"');
  });

  it('handles nodes without name', async () => {
    mockClient.send.mockResolvedValue({
      nodes: [{ role: { value: 'generic' } }],
    });

    const result = await a11y(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('generic');
  });

  it('handles nodes without role', async () => {
    mockClient.send.mockResolvedValue({
      nodes: [{ name: { value: 'test' } }],
    });

    const result = await a11y(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('unknown');
  });

  it('returns empty tree message when no nodes', async () => {
    mockClient.send.mockResolvedValue({ nodes: [] });

    const result = await a11y(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Empty accessibility tree');
  });
});
