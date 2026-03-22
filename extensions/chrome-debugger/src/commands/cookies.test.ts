import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ExecutionContext } from '../shared/types.js';

const mockCreateCDPSession = vi.fn();
const mockDisconnect = vi.fn();

const mockClient = {
  send: vi.fn(),
};

vi.mock('../shared/connection.js', () => ({
  withBrowser: vi.fn().mockImplementation(
    (_projectPath: string, fn: (browser: unknown, page: unknown) => Promise<unknown>) =>
      fn(
        { disconnect: mockDisconnect },
        { createCDPSession: mockCreateCDPSession }
      )
  ),
}));

import cookies from './cookies.js';

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

describe('cookies', () => {
  it('returns message when no cookies found', async () => {
    mockClient.send.mockResolvedValue({ cookies: [] });

    const result = await cookies.handler(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('No cookies found.');
  });

  it('returns domain-specific message when no cookies found for domain', async () => {
    mockClient.send.mockResolvedValue({ cookies: [] });

    const result = await cookies.handler(makeContext({ domain: 'example.com' }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('No cookies found for domain: example.com');
  });

  it('displays all cookies as a table', async () => {
    mockClient.send.mockResolvedValue({
      cookies: [
        {
          name: 'session_id',
          value: 'abc123',
          domain: '.example.com',
          path: '/',
          secure: true,
          httpOnly: true,
          expires: 0,
        },
        {
          name: 'theme',
          value: 'dark',
          domain: '.example.com',
          path: '/',
          secure: false,
          httpOnly: false,
          expires: 0,
        },
      ],
    });

    const result = await cookies.handler(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Cookies (2)');
    expect(result.output).toContain('session_id');
    expect(result.output).toContain('abc123');
    expect(result.output).toContain('theme');
    expect(result.output).toContain('dark');
    expect(result.output).toContain('yes');
    expect(result.output).toContain('no');
  });

  it('filters cookies by domain', async () => {
    mockClient.send.mockResolvedValue({
      cookies: [
        {
          name: 'a',
          value: '1',
          domain: '.example.com',
          path: '/',
          secure: false,
          httpOnly: false,
          expires: 0,
        },
        {
          name: 'b',
          value: '2',
          domain: '.other.com',
          path: '/',
          secure: false,
          httpOnly: false,
          expires: 0,
        },
      ],
    });

    const result = await cookies.handler(makeContext({ domain: 'example' }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Cookies (1)');
    expect(result.output).toContain('.example.com');
    expect(result.output).not.toContain('.other.com');
  });

  it('returns no cookies message when domain filter matches nothing', async () => {
    mockClient.send.mockResolvedValue({
      cookies: [
        {
          name: 'a',
          value: '1',
          domain: '.example.com',
          path: '/',
          secure: false,
          httpOnly: false,
          expires: 0,
        },
      ],
    });

    const result = await cookies.handler(makeContext({ domain: 'nomatch' }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('No cookies found for domain: nomatch');
  });
});
