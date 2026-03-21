import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { ExecutionContext } from '../shared/types.js';

const TEST_DIR = join(tmpdir(), 'chrome-debugger-network-test-' + Date.now().toString());
const STORAGE_DIR = join(TEST_DIR, '.renre-kit', 'storage', 'chrome-debugger');
const NETWORK_LOG = join(STORAGE_DIR, 'network.jsonl');

vi.mock('../shared/state.js', () => ({
  ensureBrowserRunning: vi.fn().mockImplementation(() => ({
    wsEndpoint: 'ws://localhost:9222',
    pid: 1234,
    port: 9222,
    launchedAt: '2024-01-01T00:00:00Z',
    networkLogPath: NETWORK_LOG,
    consoleLogPath: join(STORAGE_DIR, 'console.jsonl'),
  })),
}));

import network from './network.js';

function makeContext(args: Record<string, unknown> = {}): ExecutionContext {
  return {
    projectName: 'test',
    projectPath: TEST_DIR,
    args: { _positional: [], ...args },
    config: {},
  };
}

beforeEach(() => {
  mkdirSync(STORAGE_DIR, { recursive: true });
  vi.clearAllMocks();
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('network', () => {
  it('returns message when no log file exists', () => {
    rmSync(NETWORK_LOG, { force: true });
    const result = network(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('No network requests');
  });

  it('returns message when log file is empty', () => {
    writeFileSync(NETWORK_LOG, '');
    const result = network(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('No network requests');
  });

  it('parses and displays network entries', () => {
    const entries = [
      JSON.stringify({
        timestamp: '2024-01-15T10:00:00.000Z',
        method: 'GET',
        url: 'https://api.example.com/data',
        status: 200,
        type: 'XHR',
        size: 1024,
        duration: 150,
      }),
      JSON.stringify({
        timestamp: '2024-01-15T10:00:01.000Z',
        method: 'POST',
        url: 'https://api.example.com/submit',
        status: 201,
        type: 'XHR',
        size: 256,
        duration: 300,
      }),
    ];
    writeFileSync(NETWORK_LOG, entries.join('\n'));

    const result = network(makeContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Network Requests (2)');
    expect(result.output).toContain('GET');
    expect(result.output).toContain('POST');
    expect(result.output).toContain('200');
    expect(result.output).toContain('201');
  });

  it('filters by URL pattern', () => {
    const entries = [
      JSON.stringify({
        timestamp: '2024-01-15T10:00:00.000Z',
        method: 'GET',
        url: 'https://api.example.com/users',
        status: 200,
        type: 'XHR',
        size: 512,
        duration: 100,
      }),
      JSON.stringify({
        timestamp: '2024-01-15T10:00:01.000Z',
        method: 'GET',
        url: 'https://cdn.example.com/image.png',
        status: 200,
        type: 'Image',
        size: 20480,
        duration: 50,
      }),
    ];
    writeFileSync(NETWORK_LOG, entries.join('\n'));

    const result = network(makeContext({ filter: 'api' }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('1)');
    expect(result.output).toContain('users');
    expect(result.output).not.toContain('image.png');
  });

  it('filters by HTTP method', () => {
    const entries = [
      JSON.stringify({
        timestamp: '2024-01-15T10:00:00.000Z',
        method: 'GET',
        url: 'https://api.example.com/data',
        status: 200,
        type: 'XHR',
        size: 512,
        duration: 100,
      }),
      JSON.stringify({
        timestamp: '2024-01-15T10:00:01.000Z',
        method: 'POST',
        url: 'https://api.example.com/submit',
        status: 201,
        type: 'XHR',
        size: 256,
        duration: 300,
      }),
    ];
    writeFileSync(NETWORK_LOG, entries.join('\n'));

    const result = network(makeContext({ method: 'post' }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('1)');
    expect(result.output).toContain('POST');
    expect(result.output).not.toContain('GET');
  });

  it('respects limit parameter', () => {
    const entries = Array.from({ length: 10 }, (_, i) =>
      JSON.stringify({
        timestamp: `2024-01-15T10:00:0${String(i)}.000Z`,
        method: 'GET',
        url: `https://api.example.com/item${String(i)}`,
        status: 200,
        type: 'XHR',
        size: 100,
        duration: 50,
      })
    );
    writeFileSync(NETWORK_LOG, entries.join('\n'));

    const result = network(makeContext({ limit: 3 }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('3)');
  });

  it('respects offset parameter', () => {
    const entries = Array.from({ length: 5 }, (_, i) =>
      JSON.stringify({
        timestamp: `2024-01-15T10:00:0${String(i)}.000Z`,
        method: 'GET',
        url: `https://api.example.com/item${String(i)}`,
        status: 200,
        type: 'XHR',
        size: 100,
        duration: 50,
      })
    );
    writeFileSync(NETWORK_LOG, entries.join('\n'));

    // Offset 3 means skip first 3 lines, leaving 2 entries
    const result = network(makeContext({ offset: 3 }));
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Network Requests (2)');
    expect(result.output).toContain('item3');
    expect(result.output).toContain('item4');
    expect(result.output).not.toContain('item0');
  });

  it('returns json format when format=json', () => {
    const entries = [
      JSON.stringify({
        timestamp: '2024-01-15T10:00:00.000Z',
        method: 'GET',
        url: 'https://api.example.com/data',
        status: 200,
        type: 'XHR',
        size: 1024,
        duration: 150,
      }),
      JSON.stringify({
        timestamp: '2024-01-15T10:00:01.000Z',
        method: 'POST',
        url: 'https://api.example.com/submit',
        status: 201,
        type: 'XHR',
        size: 256,
        duration: 300,
      }),
    ];
    writeFileSync(NETWORK_LOG, entries.join('\n'));

    const result = network(makeContext({ format: 'json' }));
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.entries).toHaveLength(2);
    expect(output.total).toBe(2);
    expect(output.entries[0].method).toBe('GET');
    expect(output.entries[1].method).toBe('POST');
  });

  it('returns empty json when no log file and format=json', () => {
    rmSync(NETWORK_LOG, { force: true });
    const result = network(makeContext({ format: 'json' }));
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.entries).toEqual([]);
    expect(output.total).toBe(0);
  });

  it('returns empty json when log file is empty and format=json', () => {
    writeFileSync(NETWORK_LOG, '');
    const result = network(makeContext({ format: 'json' }));
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.entries).toEqual([]);
    expect(output.total).toBe(0);
  });

  it('combines offset, limit, and format=json', () => {
    const entries = Array.from({ length: 10 }, (_, i) =>
      JSON.stringify({
        timestamp: `2024-01-15T10:00:0${String(i)}.000Z`,
        method: 'GET',
        url: `https://api.example.com/item${String(i)}`,
        status: 200,
        type: 'XHR',
        size: 100,
        duration: 50,
      })
    );
    writeFileSync(NETWORK_LOG, entries.join('\n'));

    const result = network(makeContext({ offset: 2, limit: 3, format: 'json' }));
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.output);
    expect(output.entries).toHaveLength(3);
    expect(output.total).toBe(10);
    // offset=2 skips first 2, then limit=3 takes last 3 of remaining 8 (indices 7,8,9)
    expect(output.entries[0].url).toContain('item7');
  });
});
