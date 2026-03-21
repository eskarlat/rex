import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ExecutionContext } from '../shared/types.js';

const mockEvaluate = vi.fn();
const mockDisconnect = vi.fn();
const mockPages = vi.fn();

const mockEnsureBrowserRunning = vi.fn();
const mockReadState = vi.fn();

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
}));

import selected from './selected.js';

function makeContext(): ExecutionContext {
  return {
    projectName: 'test',
    projectPath: '/tmp/test-project',
    args: { _positional: [] },
    config: {},
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockEnsureBrowserRunning.mockReturnValue({
    wsEndpoint: 'ws://localhost:9222',
    pid: 1234,
    port: 9222,
    launchedAt: '2024-01-01T00:00:00Z',
    networkLogPath: '/tmp/network.jsonl',
    consoleLogPath: '/tmp/console.jsonl',
  });
});

describe('selected', () => {
  it('returns error when no element selected (no state)', async () => {
    mockReadState.mockReturnValue(null);

    const result = await selected(makeContext());
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('No Element Selected');
    expect(result.output).toContain('renre-devtools:inspect');
  });

  it('returns error when state has no selectedElement', async () => {
    mockReadState.mockReturnValue({
      wsEndpoint: 'ws://localhost:9222',
      pid: 1234,
      port: 9222,
      launchedAt: '2024-01-01T00:00:00Z',
      networkLogPath: '/tmp/network.jsonl',
      consoleLogPath: '/tmp/console.jsonl',
    });

    const result = await selected(makeContext());
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('No Element Selected');
  });

  it('returns error when element no longer found on page', async () => {
    mockReadState.mockReturnValue({
      wsEndpoint: 'ws://localhost:9222',
      pid: 1234,
      port: 9222,
      launchedAt: '2024-01-01T00:00:00Z',
      networkLogPath: '/tmp/network.jsonl',
      consoleLogPath: '/tmp/console.jsonl',
      selectedElement: {
        backendNodeId: 42,
        selector: '#main',
        tag: 'div',
        timestamp: '2024-01-01T12:00:00Z',
      },
    });

    const mockPage = { evaluate: mockEvaluate };
    mockPages.mockResolvedValue([mockPage]);
    mockEvaluate.mockResolvedValue(null);

    const result = await selected(makeContext());
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('Selected Element No Longer Found');
    expect(result.output).toContain('#main');
    expect(result.output).toContain('2024-01-01T12:00:00Z');
  });

  it('returns full element info when element is found', async () => {
    mockReadState.mockReturnValue({
      wsEndpoint: 'ws://localhost:9222',
      pid: 1234,
      port: 9222,
      launchedAt: '2024-01-01T00:00:00Z',
      networkLogPath: '/tmp/network.jsonl',
      consoleLogPath: '/tmp/console.jsonl',
      selectedElement: {
        backendNodeId: 42,
        selector: 'div#main',
        tag: 'div',
        timestamp: '2024-01-01T12:00:00Z',
      },
    });

    const mockPage = { evaluate: mockEvaluate };
    mockPages.mockResolvedValue([mockPage]);
    mockEvaluate.mockResolvedValue({
      tag: 'div',
      id: 'main',
      classes: 'container primary',
      text: 'Hello World',
      html: '<div id="main" class="container primary">Hello World</div>',
      attrs: [
        { name: 'id', value: 'main' },
        { name: 'class', value: 'container primary' },
      ],
      rect: { x: 10, y: 20, width: 100, height: 50 },
      styles: {
        display: 'block',
        position: 'relative',
        color: 'rgb(0,0,0)',
        backgroundColor: 'rgb(255,255,255)',
        fontSize: '16px',
        fontWeight: '400',
      },
      childCount: 3,
      visible: true,
    });

    const result = await selected(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('## Selected Element');
    expect(result.output).toContain('div#main');
    expect(result.output).toContain('`<div>`');
    expect(result.output).toContain('100 x 50px');
    expect(result.output).toContain('(10, 20)');
    expect(result.output).toContain('**Visible**: yes');
    expect(result.output).toContain('**Children**: 3');
    expect(result.output).toContain('**ID**: main');
    expect(result.output).toContain('**Classes**: container primary');
    expect(result.output).toContain('**Text**: Hello World');
    expect(result.output).toContain('### Attributes');
    expect(result.output).toContain('### Computed Styles');
    expect(result.output).toContain('### HTML');
    expect(result.output).toContain('### Actions');
  });

  it('handles element without id, classes, or text', async () => {
    mockReadState.mockReturnValue({
      wsEndpoint: 'ws://localhost:9222',
      pid: 1234,
      port: 9222,
      launchedAt: '2024-01-01T00:00:00Z',
      networkLogPath: '/tmp/network.jsonl',
      consoleLogPath: '/tmp/console.jsonl',
      selectedElement: {
        backendNodeId: 42,
        selector: 'span',
        tag: 'span',
        timestamp: '2024-01-01T12:00:00Z',
      },
    });

    const mockPage = { evaluate: mockEvaluate };
    mockPages.mockResolvedValue([mockPage]);
    mockEvaluate.mockResolvedValue({
      tag: 'span',
      id: '',
      classes: '',
      text: '',
      html: '<span></span>',
      attrs: [],
      rect: { x: 0, y: 0, width: 0, height: 0 },
      styles: {
        display: 'inline',
        position: '',
        color: 'rgb(0,0,0)',
        backgroundColor: 'none',
        fontSize: '',
        fontWeight: 'normal',
      },
      childCount: 0,
      visible: false,
    });

    const result = await selected(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).not.toContain('**ID**');
    expect(result.output).not.toContain('**Classes**');
    expect(result.output).not.toContain('**Text**');
    expect(result.output).toContain('**Visible**: no');
    expect(result.output).not.toContain('### Attributes');
  });

  it('truncates HTML at 500 characters', async () => {
    mockReadState.mockReturnValue({
      wsEndpoint: 'ws://localhost:9222',
      pid: 1234,
      port: 9222,
      launchedAt: '2024-01-01T00:00:00Z',
      networkLogPath: '/tmp/network.jsonl',
      consoleLogPath: '/tmp/console.jsonl',
      selectedElement: {
        backendNodeId: 42,
        selector: 'div',
        tag: 'div',
        timestamp: '2024-01-01T12:00:00Z',
      },
    });

    const mockPage = { evaluate: mockEvaluate };
    mockPages.mockResolvedValue([mockPage]);
    mockEvaluate.mockResolvedValue({
      tag: 'div',
      id: '',
      classes: '',
      text: '',
      html: 'x'.repeat(600),
      attrs: [],
      rect: { x: 0, y: 0, width: 100, height: 100 },
      styles: {
        display: 'block',
        position: '',
        color: '',
        backgroundColor: '',
        fontSize: '',
        fontWeight: '',
      },
      childCount: 0,
      visible: true,
    });

    const result = await selected(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('<!-- truncated -->');
  });

  it('disconnects browser after execution', async () => {
    mockReadState.mockReturnValue({
      wsEndpoint: 'ws://localhost:9222',
      pid: 1234,
      port: 9222,
      launchedAt: '2024-01-01T00:00:00Z',
      networkLogPath: '/tmp/network.jsonl',
      consoleLogPath: '/tmp/console.jsonl',
      selectedElement: {
        backendNodeId: 42,
        selector: 'div',
        tag: 'div',
        timestamp: '2024-01-01T12:00:00Z',
      },
    });

    const mockPage = { evaluate: mockEvaluate };
    mockPages.mockResolvedValue([mockPage]);
    mockEvaluate.mockResolvedValue({
      tag: 'div',
      id: '',
      classes: '',
      text: '',
      html: '<div></div>',
      attrs: [],
      rect: { x: 0, y: 0, width: 100, height: 100 },
      styles: {
        display: 'block',
        position: '',
        color: '',
        backgroundColor: '',
        fontSize: '',
        fontWeight: '',
      },
      childCount: 0,
      visible: true,
    });

    await selected(makeContext());
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('filters out empty and none style values', async () => {
    mockReadState.mockReturnValue({
      wsEndpoint: 'ws://localhost:9222',
      pid: 1234,
      port: 9222,
      launchedAt: '2024-01-01T00:00:00Z',
      networkLogPath: '/tmp/network.jsonl',
      consoleLogPath: '/tmp/console.jsonl',
      selectedElement: {
        backendNodeId: 42,
        selector: 'div',
        tag: 'div',
        timestamp: '2024-01-01T12:00:00Z',
      },
    });

    const mockPage = { evaluate: mockEvaluate };
    mockPages.mockResolvedValue([mockPage]);
    mockEvaluate.mockResolvedValue({
      tag: 'div',
      id: '',
      classes: '',
      text: '',
      html: '<div></div>',
      attrs: [],
      rect: { x: 0, y: 0, width: 100, height: 100 },
      styles: {
        display: 'flex',
        position: 'none',
        color: '',
        backgroundColor: 'rgb(255,0,0)',
        fontSize: '',
        fontWeight: '',
      },
      childCount: 0,
      visible: true,
    });

    const result = await selected(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('display');
    expect(result.output).toContain('flex');
    expect(result.output).toContain('backgroundColor');
  });
});
