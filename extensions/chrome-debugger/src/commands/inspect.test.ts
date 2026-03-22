import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ExecutionContext } from '../shared/types.js';

const mockCreateCDPSession = vi.fn();
const mockDisconnect = vi.fn();
const mockPages = vi.fn();

const mockClient = {
  send: vi.fn(),
  on: vi.fn(),
};

const mockReadState = vi.fn();
const mockWriteState = vi.fn();
const mockEnsureBrowserRunning = vi.fn();

vi.mock('../shared/connection.js', () => ({
  connectBrowser: vi.fn().mockImplementation(() =>
    Promise.resolve({
      pages: mockPages,
      disconnect: mockDisconnect,
    })
  ),
  getActivePage: vi.fn().mockImplementation((browser: { pages: () => Promise<unknown[]> }) =>
    browser.pages().then((p: unknown[]) => p[p.length - 1])
  ),
}));

vi.mock('../shared/state.js', () => ({
  ensureBrowserRunning: (...args: unknown[]) => mockEnsureBrowserRunning(...args),
  readState: (...args: unknown[]) => mockReadState(...args),
  writeState: (...args: unknown[]) => mockWriteState(...args),
}));

import inspect from './inspect.js';

function makeContext(args: Record<string, unknown> = {}): ExecutionContext {
  return {
    projectName: 'test',
    projectPath: '/tmp/test-project',
    args: { _positional: [], ...args },
    config: {},
  };
}

function setupDefaultMocks(): void {
  mockEnsureBrowserRunning.mockReturnValue({
    wsEndpoint: 'ws://localhost:9222',
    pid: 1234,
    port: 9222,
    launchedAt: '2024-01-01T00:00:00Z',
    networkLogPath: '/tmp/network.jsonl',
    consoleLogPath: '/tmp/console.jsonl',
  });

  const mockPage = {
    createCDPSession: mockCreateCDPSession,
  };
  mockPages.mockResolvedValue([mockPage]);
  mockCreateCDPSession.mockResolvedValue(mockClient);

  // Default CDP responses
  mockClient.send.mockImplementation((method: string) => {
    if (method === 'DOM.enable' || method === 'Overlay.enable' || method === 'CSS.enable') {
      return Promise.resolve({});
    }
    if (method === 'Overlay.setInspectMode') {
      return Promise.resolve({});
    }
    if (method === 'DOM.describeNode') {
      return Promise.resolve({
        node: {
          nodeId: 10,
          backendNodeId: 42,
          nodeName: 'DIV',
          localName: 'div',
          nodeValue: '',
          attributes: ['id', 'main', 'class', 'container'],
          childNodeCount: 3,
        },
      });
    }
    if (method === 'DOM.resolveNode') {
      return Promise.resolve({ object: { objectId: 'obj-123' } });
    }
    if (method === 'Runtime.callFunctionOn') {
      return Promise.resolve({ result: { value: 'div.container' } });
    }
    if (method === 'DOM.getOuterHTML') {
      return Promise.resolve({ outerHTML: '<div id="main" class="container">Hello</div>' });
    }
    if (method === 'DOM.pushNodesByBackendIdsToFrontend') {
      return Promise.resolve({ nodeIds: [10], nodeId: 10 });
    }
    if (method === 'CSS.getComputedStyleForNode') {
      return Promise.resolve({
        computedStyle: [
          { name: 'display', value: 'block' },
          { name: 'position', value: 'relative' },
          { name: 'width', value: '100px' },
          { name: 'height', value: '50px' },
        ],
      });
    }
    if (method === 'DOM.getBoxModel') {
      return Promise.resolve({ model: { width: 100, height: 50 } });
    }
    if (method === 'Accessibility.getPartialAXTree') {
      return Promise.resolve({
        nodes: [{ role: { value: 'generic' }, name: { value: 'Main Content' } }],
      });
    }
    return Promise.resolve({});
  });

  // Mock the Overlay.inspectNodeRequested event to fire immediately
  mockClient.on.mockImplementation((event: string, callback: (params: { backendNodeId: number }) => void) => {
    if (event === 'Overlay.inspectNodeRequested') {
      setTimeout(() => callback({ backendNodeId: 42 }), 0);
    }
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
  setupDefaultMocks();
});

describe('inspect', () => {
  it('picks element and returns full inspection output', async () => {
    mockReadState.mockReturnValue({
      wsEndpoint: 'ws://localhost:9222',
      pid: 1234,
      port: 9222,
      launchedAt: '2024-01-01T00:00:00Z',
      networkLogPath: '/tmp/network.jsonl',
      consoleLogPath: '/tmp/console.jsonl',
    });

    const result = await inspect(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('## Inspected Element');
    expect(result.output).toContain('**Tag**: `<div>`');
    expect(result.output).toContain('**Selector**');
    expect(result.output).toContain('**Size**: 100 x 50px');
    expect(result.output).toContain('**Accessibility**: generic "Main Content"');
    expect(result.output).toContain('### Attributes');
    expect(result.output).toContain('### Key Styles');
    expect(result.output).toContain('### HTML');
    expect(result.output).toContain('### Next Steps');
  });

  it('saves selected element to state', async () => {
    mockReadState.mockReturnValue({
      wsEndpoint: 'ws://localhost:9222',
      pid: 1234,
      port: 9222,
      launchedAt: '2024-01-01T00:00:00Z',
      networkLogPath: '/tmp/network.jsonl',
      consoleLogPath: '/tmp/console.jsonl',
    });

    await inspect(makeContext());
    expect(mockWriteState).toHaveBeenCalledWith(
      '/tmp/test-project',
      expect.objectContaining({
        selectedElement: expect.objectContaining({
          backendNodeId: 42,
          tag: 'div',
        }),
      })
    );
  });

  it('does not write state when readState returns null', async () => {
    mockReadState.mockReturnValue(null);

    const result = await inspect(makeContext());
    expect(result.exitCode).toBe(0);
    expect(mockWriteState).not.toHaveBeenCalled();
  });

  it('uses custom timeout from args', async () => {
    mockReadState.mockReturnValue(null);

    const result = await inspect(makeContext({ timeout: 5000 }));
    expect(result.exitCode).toBe(0);
    // Verify it still works with custom timeout
    expect(result.output).toContain('Inspected Element');
  });

  it('keeps connection cached after execution', async () => {
    mockReadState.mockReturnValue(null);

    await inspect(makeContext());
    expect(mockDisconnect).not.toHaveBeenCalled();
  });

  it('keeps connection cached even on error', async () => {
    mockReadState.mockReturnValue(null);

    // Make createCDPSession fail
    mockCreateCDPSession.mockRejectedValue(new Error('CDP error'));

    await expect(inspect(makeContext())).rejects.toThrow('CDP error');
    expect(mockDisconnect).not.toHaveBeenCalled();
  });

  it('handles missing nodeId from pushNodesByBackendIdsToFrontend', async () => {
    mockReadState.mockReturnValue(null);

    // Override to return no nodeId
    const originalImpl = mockClient.send.getMockImplementation();
    mockClient.send.mockImplementation((method: string, ...args: unknown[]) => {
      if (method === 'DOM.pushNodesByBackendIdsToFrontend') {
        return Promise.resolve({ nodeIds: [10] });
      }
      return originalImpl?.(method, ...args);
    });

    const result = await inspect(makeContext());
    expect(result.exitCode).toBe(0);
    // Should fall back to node.nodeId
    expect(result.output).toContain('Inspected Element');
  });

  it('handles getComputedStyles failure gracefully', async () => {
    mockReadState.mockReturnValue(null);

    const originalImpl = mockClient.send.getMockImplementation();
    mockClient.send.mockImplementation((method: string, ...args: unknown[]) => {
      if (method === 'CSS.getComputedStyleForNode') {
        return Promise.reject(new Error('CSS not available'));
      }
      return originalImpl?.(method, ...args);
    });

    const result = await inspect(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Inspected Element');
    // No Key Styles section since it failed
    expect(result.output).not.toContain('### Key Styles');
  });

  it('handles getBoxModel failure gracefully', async () => {
    mockReadState.mockReturnValue(null);

    const originalImpl = mockClient.send.getMockImplementation();
    mockClient.send.mockImplementation((method: string, ...args: unknown[]) => {
      if (method === 'DOM.getBoxModel') {
        return Promise.reject(new Error('Box model not available'));
      }
      return originalImpl?.(method, ...args);
    });

    const result = await inspect(makeContext());
    expect(result.exitCode).toBe(0);
    // Size line should not appear when box model fails
    expect(result.output).not.toContain('**Size**');
  });

  it('handles getA11yInfo failure gracefully', async () => {
    mockReadState.mockReturnValue(null);

    const originalImpl = mockClient.send.getMockImplementation();
    mockClient.send.mockImplementation((method: string, ...args: unknown[]) => {
      if (method === 'Accessibility.getPartialAXTree') {
        return Promise.reject(new Error('Accessibility not available'));
      }
      return originalImpl?.(method, ...args);
    });

    const result = await inspect(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).not.toContain('**Accessibility**');
  });

  it('handles node without attributes', async () => {
    mockReadState.mockReturnValue(null);

    const originalImpl = mockClient.send.getMockImplementation();
    mockClient.send.mockImplementation((method: string, ...args: unknown[]) => {
      if (method === 'DOM.describeNode') {
        return Promise.resolve({
          node: {
            nodeId: 10,
            backendNodeId: 42,
            nodeName: 'SPAN',
            localName: 'span',
            nodeValue: '',
            childNodeCount: 0,
          },
        });
      }
      return originalImpl?.(method, ...args);
    });

    const result = await inspect(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('`<span>`');
    expect(result.output).not.toContain('### Attributes');
  });

  it('truncates long outerHTML', async () => {
    mockReadState.mockReturnValue(null);

    const longHTML = '<div>' + 'x'.repeat(600) + '</div>';
    const originalImpl = mockClient.send.getMockImplementation();
    mockClient.send.mockImplementation((method: string, ...args: unknown[]) => {
      if (method === 'DOM.getOuterHTML') {
        return Promise.resolve({ outerHTML: longHTML });
      }
      return originalImpl?.(method, ...args);
    });

    const result = await inspect(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('<!-- truncated -->');
  });

  it('handles a11y node without name', async () => {
    mockReadState.mockReturnValue(null);

    const originalImpl = mockClient.send.getMockImplementation();
    mockClient.send.mockImplementation((method: string, ...args: unknown[]) => {
      if (method === 'Accessibility.getPartialAXTree') {
        return Promise.resolve({
          nodes: [{ role: { value: 'generic' } }],
        });
      }
      return originalImpl?.(method, ...args);
    });

    const result = await inspect(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('generic');
  });

  it('handles empty a11y nodes', async () => {
    mockReadState.mockReturnValue(null);

    const originalImpl = mockClient.send.getMockImplementation();
    mockClient.send.mockImplementation((method: string, ...args: unknown[]) => {
      if (method === 'Accessibility.getPartialAXTree') {
        return Promise.resolve({ nodes: [] });
      }
      return originalImpl?.(method, ...args);
    });

    const result = await inspect(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).not.toContain('**Accessibility**');
  });

  it('handles text content in output', async () => {
    mockReadState.mockReturnValue(null);

    // The text content comes from Runtime.callFunctionOn second call
    // First call is generateSelector, second is text content
    let callCount = 0;
    const originalImpl = mockClient.send.getMockImplementation();
    mockClient.send.mockImplementation((method: string, ...args: unknown[]) => {
      if (method === 'Runtime.callFunctionOn') {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ result: { value: 'div#main' } });
        }
        return Promise.resolve({ result: { value: 'Hello World' } });
      }
      return originalImpl?.(method, ...args);
    });

    const result = await inspect(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('**Text**: Hello World');
  });

  it('filters computed styles to only key properties with values', async () => {
    mockReadState.mockReturnValue(null);

    const originalImpl = mockClient.send.getMockImplementation();
    mockClient.send.mockImplementation((method: string, ...args: unknown[]) => {
      if (method === 'CSS.getComputedStyleForNode') {
        return Promise.resolve({
          computedStyle: [
            { name: 'display', value: 'flex' },
            { name: 'position', value: 'none' },
            { name: 'width', value: '' },
            { name: 'unknown-prop', value: 'something' },
            { name: 'color', value: 'red' },
          ],
        });
      }
      return originalImpl?.(method, ...args);
    });

    const result = await inspect(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('display');
    expect(result.output).toContain('color');
  });
});
