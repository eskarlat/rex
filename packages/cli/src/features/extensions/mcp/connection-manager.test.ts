import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConnectionManager } from './connection-manager.js';
import type { McpConfig } from '../types/extension.types.js';
import { ExtensionError, ErrorCode } from '../../../core/errors/extension-error.js';

vi.mock('./mcp-stdio-transport.js');
vi.mock('./mcp-sse-transport.js');
vi.mock('../../../shared/interpolation.js', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return { ...actual };
});

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

  describe('env resolution', () => {
    it('should interpolate config values into MCP env vars', () => {
      const configWithEnv: McpConfig = {
        transport: 'stdio',
        command: 'node',
        args: ['server.js'],
        env: {
          API_TOKEN: '${config.apiToken}',
          BASE_URL: '${config.baseUrl}',
          STATIC: 'no-change',
        },
      };

      const resolvedConfig = {
        apiToken: 'my-secret-token',
        baseUrl: 'https://api.example.com',
      };

      manager.getConnection('ext-env', configWithEnv, resolvedConfig);

      expect(spawnProcess).toHaveBeenCalledWith(
        'node',
        ['server.js'],
        expect.objectContaining({
          API_TOKEN: 'my-secret-token',
          BASE_URL: 'https://api.example.com',
          STATIC: 'no-change',
        }),
        expect.any(String),
      );
    });

    it('should pass raw env when no resolvedConfig provided', () => {
      const configWithEnv: McpConfig = {
        transport: 'stdio',
        command: 'node',
        args: [],
        env: { KEY: 'value' },
      };

      manager.getConnection('ext-raw', configWithEnv);

      expect(spawnProcess).toHaveBeenCalledWith(
        'node',
        [],
        expect.objectContaining({ KEY: 'value' }),
        expect.any(String),
      );
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

  describe('crash recovery', () => {
    beforeEach(() => {
      // Zero-out backoff delay for fast tests
      (manager as unknown as { backoffBaseMs: number }).backoffBaseMs = 0;
    });

    it('should retry on process crash and succeed', async () => {
      manager.getConnection('ext-a', stdioConfig);
      const crashError = new ExtensionError('ext-a', ErrorCode.MCP_PROCESS_CRASHED, 'crashed');
      vi.mocked(stdioSendRequest)
        .mockRejectedValueOnce(crashError)
        .mockResolvedValueOnce({ jsonrpc: '2.0', result: 'recovered', id: 2 });

      const result = await manager.executeToolCall('ext-a', 'tool', {});
      expect(result).toBe('recovered');
      expect(spawnProcess).toHaveBeenCalledTimes(2);
    });

    it('should mark errored after max retries', async () => {
      manager.getConnection('ext-a', stdioConfig);
      const crashError = new ExtensionError('ext-a', ErrorCode.MCP_PROCESS_CRASHED, 'crashed');
      vi.mocked(stdioSendRequest).mockRejectedValue(crashError);

      await expect(
        manager.executeToolCall('ext-a', 'tool', {}),
      ).rejects.toThrow('failed to restart after 3 attempts');

      const status = manager.status();
      expect(status.get('ext-a')).toBe('errored');
    });

    it('should not retry on non-crash errors', async () => {
      manager.getConnection('ext-a', stdioConfig);
      vi.mocked(stdioSendRequest).mockRejectedValueOnce(new Error('timeout'));

      await expect(
        manager.executeToolCall('ext-a', 'tool', {}),
      ).rejects.toThrow('timeout');
      expect(spawnProcess).toHaveBeenCalledTimes(1);
    });

    it('should reset retry count on successful recovery', async () => {
      manager.getConnection('ext-a', stdioConfig);
      const crashError = new ExtensionError('ext-a', ErrorCode.MCP_PROCESS_CRASHED, 'crashed');

      // First crash + recovery
      vi.mocked(stdioSendRequest)
        .mockRejectedValueOnce(crashError)
        .mockResolvedValueOnce({ jsonrpc: '2.0', result: 'ok', id: 2 });
      await manager.executeToolCall('ext-a', 'tool', {});

      // Second crash + recovery (should have fresh retry count)
      vi.mocked(stdioSendRequest)
        .mockRejectedValueOnce(crashError)
        .mockResolvedValueOnce({ jsonrpc: '2.0', result: 'ok2', id: 4 });
      const result = await manager.executeToolCall('ext-a', 'tool', {});
      expect(result).toBe('ok2');
    });
  });
});
