import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ExecutionContext } from '../shared/types.js';

const mockCreateCDPSession = vi.fn();
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
        { createCDPSession: mockCreateCDPSession, evaluate: mockEvaluate }
      )
  ),
}));

import performance from './performance.js';

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
  mockCreateCDPSession.mockResolvedValue(mockClient);
});

describe('performance', () => {
  it('returns performance metrics with all data available', async () => {
    mockClient.send.mockResolvedValue({
      metrics: [
        { name: 'JSHeapUsedSize', value: 5242880 },
        { name: 'JSHeapTotalSize', value: 10485760 },
        { name: 'Documents', value: 5 },
        { name: 'Nodes', value: 200 },
        { name: 'LayoutCount', value: 10 },
        { name: 'RecalcStyleCount', value: 15 },
        { name: 'JSEventListeners', value: 42 },
      ],
    });

    // First evaluate call: navigation timing
    mockEvaluate
      .mockResolvedValueOnce({
        dns: 10,
        tcp: 20,
        ttfb: 50,
        download: 30,
        domInteractive: 200,
        domComplete: 500,
        loadEvent: 600,
      })
      // Second evaluate call: vitals (FCP)
      .mockResolvedValueOnce({
        fcp: 150,
      });

    const result = await performance.handler(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('## Performance Metrics');
    expect(result.output).toContain('### Web Vitals');
    expect(result.output).toContain('First Contentful Paint');
    expect(result.output).toContain('Time to First Byte');
    expect(result.output).toContain('DOM Interactive');
    expect(result.output).toContain('DOM Complete');
    expect(result.output).toContain('Load Event');
    expect(result.output).toContain('### Navigation Timing');
    expect(result.output).toContain('DNS Lookup');
    expect(result.output).toContain('TCP Connect');
    expect(result.output).toContain('TTFB');
    expect(result.output).toContain('Download');
    expect(result.output).toContain('### Runtime Metrics');
    expect(result.output).toContain('JSHeapUsedSize');
    expect(result.output).toContain('MB');
  });

  it('handles null navigation timing', async () => {
    mockClient.send.mockResolvedValue({
      metrics: [{ name: 'Documents', value: 3 }],
    });

    mockEvaluate
      .mockResolvedValueOnce(null)  // no nav timing
      .mockResolvedValueOnce({ fcp: 100 });

    const result = await performance.handler(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('### Web Vitals');
    expect(result.output).toContain('First Contentful Paint');
    expect(result.output).not.toContain('### Navigation Timing');
  });

  it('handles null FCP', async () => {
    mockClient.send.mockResolvedValue({
      metrics: [],
    });

    mockEvaluate
      .mockResolvedValueOnce({
        dns: 10,
        tcp: 20,
        ttfb: 50,
        download: 30,
        domInteractive: 200,
        domComplete: 500,
        loadEvent: 600,
      })
      .mockResolvedValueOnce({ fcp: null });

    const result = await performance.handler(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('### Web Vitals');
    expect(result.output).toContain('Time to First Byte');
    expect(result.output).not.toContain('First Contentful Paint');
  });

  it('handles no vitals and no timing', async () => {
    mockClient.send.mockResolvedValue({
      metrics: [],
    });

    mockEvaluate
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ fcp: null });

    const result = await performance.handler(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('## Performance Metrics');
    expect(result.output).not.toContain('### Web Vitals');
    expect(result.output).not.toContain('### Navigation Timing');
    expect(result.output).not.toContain('### Runtime Metrics');
  });

  it('handles empty metrics array', async () => {
    mockClient.send.mockResolvedValue({ metrics: [] });

    mockEvaluate
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ fcp: null });

    const result = await performance.handler(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).not.toContain('### Runtime Metrics');
  });

  it('filters CDP metrics to key metrics only', async () => {
    mockClient.send.mockResolvedValue({
      metrics: [
        { name: 'JSHeapUsedSize', value: 2097152 },
        { name: 'SomeRandomMetric', value: 999 },
        { name: 'Nodes', value: 100 },
      ],
    });

    mockEvaluate
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ fcp: null });

    const result = await performance.handler(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('JSHeapUsedSize');
    expect(result.output).toContain('Nodes');
    expect(result.output).not.toContain('SomeRandomMetric');
  });

  it('formats heap sizes in MB', async () => {
    mockClient.send.mockResolvedValue({
      metrics: [
        { name: 'JSHeapUsedSize', value: 1048576 }, // 1 MB
      ],
    });

    mockEvaluate
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ fcp: null });

    const result = await performance.handler(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('1.0 MB');
  });

  it('formats non-heap metrics as integers', async () => {
    mockClient.send.mockResolvedValue({
      metrics: [
        { name: 'Nodes', value: 150.7 },
      ],
    });

    mockEvaluate
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ fcp: null });

    const result = await performance.handler(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('151');
  });
});
