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

import styles from './styles.js';

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

describe('styles', () => {
  it('returns error when selector is missing', async () => {
    const result = await styles(makeContext());
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('--selector is required');
  });

  it('returns error when selector is empty string', async () => {
    const result = await styles(makeContext({ selector: '' }));
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('--selector is required');
  });

  it('returns error when element not found', async () => {
    mockEvaluate.mockResolvedValue(null);

    const result = await styles(makeContext({ selector: '#missing' }));
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('No element found');
    expect(result.output).toContain('#missing');
  });

  it('returns computed styles for an element', async () => {
    mockEvaluate.mockResolvedValue([
      { property: 'display', value: 'flex' },
      { property: 'color', value: 'rgb(0, 0, 0)' },
      { property: 'font-size', value: '16px' },
    ]);

    const result = await styles(makeContext({ selector: '#main' }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Computed Styles: `#main`');
    expect(result.output).toContain('display');
    expect(result.output).toContain('flex');
    expect(result.output).toContain('color');
    expect(result.output).toContain('font-size');
    expect(result.output).not.toContain('(all)');
  });

  it('shows all styles when --all is set', async () => {
    mockEvaluate.mockResolvedValue([
      { property: 'display', value: 'block' },
      { property: 'some-custom', value: 'test' },
    ]);

    const result = await styles(makeContext({ selector: '#main', all: true }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Computed Styles: `#main` (all)');
    expect(result.output).toContain('display');
    expect(result.output).toContain('some-custom');
  });

  it('passes correct args to page.evaluate', async () => {
    mockEvaluate.mockResolvedValue([]);

    await styles(makeContext({ selector: '.box' }));
    expect(mockEvaluate).toHaveBeenCalledWith(
      expect.any(Function),
      '.box',
      expect.any(Array),
      false
    );
  });

  it('passes all=true to page.evaluate when --all is set', async () => {
    mockEvaluate.mockResolvedValue([]);

    await styles(makeContext({ selector: '.box', all: true }));
    expect(mockEvaluate).toHaveBeenCalledWith(
      expect.any(Function),
      '.box',
      expect.any(Array),
      true
    );
  });

  it('renders styles as markdown table', async () => {
    mockEvaluate.mockResolvedValue([
      { property: 'display', value: 'block' },
    ]);

    const result = await styles(makeContext({ selector: 'div' }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('| Property | Value |');
    expect(result.output).toContain('| --- | --- |');
    expect(result.output).toContain('| display | block |');
  });

  it('handles empty computed styles', async () => {
    mockEvaluate.mockResolvedValue([]);

    const result = await styles(makeContext({ selector: 'div' }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Computed Styles: `div`');
  });
});
