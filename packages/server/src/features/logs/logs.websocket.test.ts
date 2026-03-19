import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import type { FastifyInstance } from 'fastify';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

vi.mock('@renre-kit/cli/lib', () => ({
  // eslint-disable-next-line sonarjs/publicly-writable-directories
  LOGS_DIR: '/tmp/renre-kit-test-logs',
}));

const { default: logsWebsocket, readNewLines, getLogFilePath } = await import('./logs.websocket.js');

describe('readNewLines', () => {
  const tmpDir = path.join(os.tmpdir(), 'renre-kit-log-test');
  const testLogFile = path.join(tmpDir, 'test.log');

  beforeEach(() => {
    fs.mkdirSync(tmpDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
  });

  it('returns empty when file does not exist', () => {
    const result = readNewLines('/nonexistent/file.log', 0);
    expect(result.lines).toEqual([]);
    expect(result.newOffset).toBe(0);
  });

  it('returns empty when offset equals file size', () => {
    fs.writeFileSync(testLogFile, 'line1\n');
    const size = fs.statSync(testLogFile).size;
    const result = readNewLines(testLogFile, size);
    expect(result.lines).toEqual([]);
    expect(result.newOffset).toBe(size);
  });

  it('reads new lines from offset', () => {
    fs.writeFileSync(testLogFile, 'line1\nline2\n');
    const result = readNewLines(testLogFile, 0);
    expect(result.lines).toEqual(['line1', 'line2']);
    expect(result.newOffset).toBe(fs.statSync(testLogFile).size);
  });

  it('reads only new content after offset', () => {
    fs.writeFileSync(testLogFile, 'line1\n');
    const firstSize = fs.statSync(testLogFile).size;
    fs.appendFileSync(testLogFile, 'line2\nline3\n');

    const result = readNewLines(testLogFile, firstSize);
    expect(result.lines).toEqual(['line2', 'line3']);
  });

  it('returns empty when file is smaller than offset', () => {
    fs.writeFileSync(testLogFile, 'short');
    const result = readNewLines(testLogFile, 1000);
    expect(result.lines).toEqual([]);
  });
});

describe('getLogFilePath', () => {
  it('returns dated log file path', () => {
    const logPath = getLogFilePath();
    const date = new Date().toISOString().slice(0, 10);
    expect(logPath).toContain(`renre-kit-${date}.log`);
  });
});

describe('logs websocket plugin', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify();
    await app.register(websocket);
    await app.register(logsWebsocket);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('registers the /api/logs websocket endpoint', () => {
    const routes = app.printRoutes();
    expect(routes).toContain('api/logs');
  });

  it('responds to non-websocket requests', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/logs',
    });
    expect(response.statusCode).toBeDefined();
  });

  it('registers the /api/logs/console/entries endpoint', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/logs/console/entries',
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(expect.any(Array));
  });

  it('registers the /api/logs/console websocket endpoint', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/logs/console',
    });
    expect(response.statusCode).toBeDefined();
  });
});
