import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConnectionManager } from './connection-manager.js';
import type { McpConfig } from '../types/extension.types.js';

vi.mock('./mcp-stdio-transport.js');
vi.mock('./mcp-sse-transport.js');

import { spawnProcess, sendRequest as stdioSendRequest, killProcess } from './mcp-stdio-transport.js';
import { connect, sendRequest as sseSendRequest, disconnect } from './mcp-sse-transport.js';

describe('connection-manager', () => {
  let manager: ConnectionManager;

  const stdioConfig: McpConfig = {
    transport: 'stdio',
    command: 'node',
    args: ['server.js'],
    env: {},
  };

  const sseConfig: McpConfig = {
    transport: 'sse',
    url: 'http://localhost:3000/mcp',
    headers: { Authorization: 'Bearer test' },
  };

  beforeEach(() => {
    vi.mocked(spawnProcess).mockReturnValue({
      process: {
        pid: 1234,
        on: vi.fn(),
        kill: vi.fn().mockReturnValue(true),
        emit: vi.fn(),
        stdout: { on: vi.fn(), off: vi.fn() },
        stdin: { write: vi.fn() },
      } as never,
      buffer: '',
    });
    vi.mocked(stdioSendRequest).mockResolvedValue({
      jsonrpc: '2.0',
      result: { content: [{ text: 'ok' }] },
      id: 1,
    });
    vi.mocked(killProcess).mockResolvedValue(undefined);

    vi.mocked(connect).mockReturnValue({
      url: 'http://localhost:3000',
      headers: {},
      connected: true,
    });
    vi.mocked(sseSendRequest).mockResolvedValue({
      jsonrpc: '2.0',
      result: { content: [{ text: 'sse-ok' }] },
      id: 1,
    });
    vi.mocked(disconnect).mockReturnValue(undefined);

    manager = new ConnectionManager();
  });

  afterEach(async () => {
    await manager.stopAll();
    vi.restoreAllMocks();
  });

  describe('getConnection', () => {
    it('should create a stdio connection on first call', () => {
      const conn = manager.getConnection('ext-a', stdioConfig);
      expect(conn.extensionName).toBe('ext-a');
      expect(conn.transport).toBe('stdio');
      expect(conn.state).toBe('running');
      expect(spawnProcess).toHaveBeenCalled();
    });

    it('should return existing connection on subsequent calls', () => {
      const conn1 = manager.getConnection('ext-a', stdioConfig);
      const conn2 = manager.getConnection('ext-a', stdioConfig);
      expect(conn1).toBe(conn2);
      expect(spawnProcess).toHaveBeenCalledTimes(1);
    });

    it('should create an SSE connection', () => {
      const conn = manager.getConnection('ext-b', sseConfig);
      expect(conn.extensionName).toBe('ext-b');
      expect(conn.transport).toBe('sse');
      expect(conn.state).toBe('running');
      expect(connect).toHaveBeenCalledWith('http://localhost:3000/mcp', {
        Authorization: 'Bearer test',
      });
    });
  });

  describe('executeToolCall', () => {
    it('should execute a tool call over stdio', async () => {
      manager.getConnection('ext-a', stdioConfig);
      const result = await manager.executeToolCall('ext-a', 'search', {
        query: 'test',
      });
      expect(stdioSendRequest).toHaveBeenCalled();
      expect(result).toEqual({ content: [{ text: 'ok' }] });
    });

    it('should execute a tool call over SSE', async () => {
      manager.getConnection('ext-b', sseConfig);
      const result = await manager.executeToolCall('ext-b', 'query', {
        q: 'hello',
      });
      expect(sseSendRequest).toHaveBeenCalled();
      expect(result).toEqual({ content: [{ text: 'sse-ok' }] });
    });

    it('should throw when extension has no connection', async () => {
      await expect(
        manager.executeToolCall('nonexistent', 'tool', {}),
      ).rejects.toThrow();
    });
  });

  describe('stopAll', () => {
    it('should stop all active connections', async () => {
      manager.getConnection('ext-a', stdioConfig);
      manager.getConnection('ext-b', sseConfig);
      await manager.stopAll();
      expect(killProcess).toHaveBeenCalled();
      expect(disconnect).toHaveBeenCalled();
    });

    it('should be safe to call when no connections exist', async () => {
      await expect(manager.stopAll()).resolves.toBeUndefined();
    });
  });

  describe('restart', () => {
    it('should restart a stdio connection', async () => {
      manager.getConnection('ext-a', stdioConfig);
      await manager.restart('ext-a', stdioConfig);
      expect(killProcess).toHaveBeenCalled();
      expect(spawnProcess).toHaveBeenCalledTimes(2);
    });

    it('should restart an SSE connection', async () => {
      manager.getConnection('ext-b', sseConfig);
      await manager.restart('ext-b', sseConfig);
      expect(disconnect).toHaveBeenCalled();
      expect(connect).toHaveBeenCalledTimes(2);
    });
  });

  describe('status', () => {
    it('should return empty map when no connections', () => {
      const status = manager.status();
      expect(status.size).toBe(0);
    });

    it('should return state for each connection', () => {
      manager.getConnection('ext-a', stdioConfig);
      manager.getConnection('ext-b', sseConfig);
      const status = manager.status();
      expect(status.get('ext-a')).toBe('running');
      expect(status.get('ext-b')).toBe('running');
    });
  });

  describe('setMode', () => {
    it('should accept cli mode', () => {
      expect(() => manager.setMode('cli')).not.toThrow();
    });

    it('should accept dashboard mode', () => {
      expect(() => manager.setMode('dashboard')).not.toThrow();
    });
  });
});
