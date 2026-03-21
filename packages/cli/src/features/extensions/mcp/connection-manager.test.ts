import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConnectionManager } from './connection-manager.js';
import type { McpConfig } from '../types/extension.types.js';
import { ExtensionError, ErrorCode } from '../../../core/errors/extension-error.js';

vi.mock('./mcp-stdio-transport.js');
vi.mock('./mcp-sse-transport.js');
vi.mock('../../../shared/interpolation.js', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return { ...actual };
});
const mockLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
vi.mock('../../../core/logger/index.js', () => ({
  getLogger: () => mockLogger,
}));

import {
  spawnProcess,
  sendRequest as stdioSendRequest,
  sendNotification,
  killProcess,
} from './mcp-stdio-transport.js';
import { connect, sendRequest as sseSendRequest, disconnect } from './mcp-sse-transport.js';
import { getLogger } from '../../../core/logger/index.js';

const INIT_RESULT = {
  protocolVersion: '2024-11-05',
  capabilities: {},
  serverInfo: { name: 'test-server', version: '1.0.0' },
};

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
      stderrBuffer: '',
    });
    vi.mocked(stdioSendRequest).mockImplementation(async (_proc, request) => ({
      jsonrpc: '2.0' as const,
      result:
        request.method === 'initialize'
          ? INIT_RESULT
          : { content: [{ text: 'ok' }] },
      id: request.id,
    }));
    vi.mocked(sendNotification).mockReturnValue(undefined);
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
      await expect(manager.executeToolCall('nonexistent', 'tool', {})).rejects.toThrow();
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

  describe('SSE config resolution', () => {
    it('should interpolate config values into SSE url and headers', () => {
      const sseWithConfig: McpConfig = {
        transport: 'sse',
        url: '${config.serverUrl}',
        headers: {
          Authorization: 'Bearer ${config.apiToken}',
          'X-Custom': 'static-value',
        },
      };

      const resolvedConfig = {
        serverUrl: 'http://figma.local:3845/sse',
        apiToken: 'my-secret-token',
      };

      manager.getConnection('ext-sse-cfg', sseWithConfig, resolvedConfig);

      expect(connect).toHaveBeenCalledWith('http://figma.local:3845/sse', {
        Authorization: 'Bearer my-secret-token',
        'X-Custom': 'static-value',
      });
    });

    it('should pass raw url when no resolvedConfig provided', () => {
      const sseRaw: McpConfig = {
        transport: 'sse',
        url: 'http://localhost:3000/mcp',
        headers: {},
      };

      manager.getConnection('ext-sse-raw', sseRaw);

      expect(connect).toHaveBeenCalledWith('http://localhost:3000/mcp', {});
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
      let toolCallCount = 0;
      const crashError = new ExtensionError('ext-a', ErrorCode.MCP_PROCESS_CRASHED, 'crashed');
      vi.mocked(stdioSendRequest).mockImplementation(async (_proc, request) => {
        if (request.method === 'initialize') {
          return { jsonrpc: '2.0' as const, result: INIT_RESULT, id: request.id };
        }
        toolCallCount++;
        if (toolCallCount === 1) throw crashError;
        return { jsonrpc: '2.0' as const, result: 'recovered', id: request.id };
      });

      manager.getConnection('ext-a', stdioConfig);
      const result = await manager.executeToolCall('ext-a', 'tool', {});
      expect(result).toBe('recovered');
      expect(spawnProcess).toHaveBeenCalledTimes(2);
    });

    it('should mark errored after max retries', async () => {
      const crashError = new ExtensionError('ext-a', ErrorCode.MCP_PROCESS_CRASHED, 'crashed');
      vi.mocked(stdioSendRequest).mockImplementation(async (_proc, request) => {
        if (request.method === 'initialize') {
          return { jsonrpc: '2.0' as const, result: INIT_RESULT, id: request.id };
        }
        throw crashError;
      });

      manager.getConnection('ext-a', stdioConfig);
      await expect(manager.executeToolCall('ext-a', 'tool', {})).rejects.toThrow(
        'failed to restart after 3 attempts',
      );

      const status = manager.status();
      expect(status.get('ext-a')).toBe('errored');
    });

    it('should not retry on non-crash errors', async () => {
      vi.mocked(stdioSendRequest).mockImplementation(async (_proc, request) => {
        if (request.method === 'initialize') {
          return { jsonrpc: '2.0' as const, result: INIT_RESULT, id: request.id };
        }
        throw new Error('timeout');
      });

      manager.getConnection('ext-a', stdioConfig);
      await expect(manager.executeToolCall('ext-a', 'tool', {})).rejects.toThrow('timeout');
      expect(spawnProcess).toHaveBeenCalledTimes(1);
    });

    it('should reset retry count on successful recovery', async () => {
      let toolCallCount = 0;
      const crashError = new ExtensionError('ext-a', ErrorCode.MCP_PROCESS_CRASHED, 'crashed');
      vi.mocked(stdioSendRequest).mockImplementation(async (_proc, request) => {
        if (request.method === 'initialize') {
          return { jsonrpc: '2.0' as const, result: INIT_RESULT, id: request.id };
        }
        toolCallCount++;
        // Calls 1, 3 crash; calls 2, 4 succeed
        if (toolCallCount === 1 || toolCallCount === 3) throw crashError;
        return { jsonrpc: '2.0' as const, result: `ok${toolCallCount}`, id: request.id };
      });

      manager.getConnection('ext-a', stdioConfig);

      // First crash + recovery
      await manager.executeToolCall('ext-a', 'tool', {});

      // Second crash + recovery (should have fresh retry count)
      const result = await manager.executeToolCall('ext-a', 'tool', {});
      expect(result).toBe('ok4');
    });

    it('should log crash details when retries exhausted', async () => {
      const crashError = new ExtensionError(
        'ext-a',
        ErrorCode.MCP_PROCESS_CRASHED,
        'crashed\nfatal: segfault',
      );
      vi.mocked(stdioSendRequest).mockImplementation(async (_proc, request) => {
        if (request.method === 'initialize') {
          return { jsonrpc: '2.0' as const, result: INIT_RESULT, id: request.id };
        }
        throw crashError;
      });

      manager.getConnection('ext-a', stdioConfig);
      await expect(manager.executeToolCall('ext-a', 'tool', {})).rejects.toThrow();

      const logger = getLogger();
      expect(logger.error).toHaveBeenCalledWith(
        'extensions',
        'MCP process for ext-a crashed',
        expect.objectContaining({
          retries: 3,
          lastError: expect.stringContaining('segfault'),
        }),
      );
    });

    it('should log warn on each retry attempt', async () => {
      let toolCallCount = 0;
      const crashError = new ExtensionError('ext-a', ErrorCode.MCP_PROCESS_CRASHED, 'crashed');
      vi.mocked(stdioSendRequest).mockImplementation(async (_proc, request) => {
        if (request.method === 'initialize') {
          return { jsonrpc: '2.0' as const, result: INIT_RESULT, id: request.id };
        }
        toolCallCount++;
        if (toolCallCount <= 2) throw crashError;
        return { jsonrpc: '2.0' as const, result: 'ok', id: request.id };
      });

      manager.getConnection('ext-a', stdioConfig);
      await manager.executeToolCall('ext-a', 'tool', {});

      const logger = getLogger();
      expect(logger.warn).toHaveBeenCalledWith(
        'extensions',
        'Retrying MCP connection for ext-a',
        { attempt: 1 },
      );
      expect(logger.warn).toHaveBeenCalledWith(
        'extensions',
        'Retrying MCP connection for ext-a',
        { attempt: 2 },
      );
    });
  });

  describe('MCP initialization handshake', () => {
    it('should send initialize request before first tool call', async () => {
      manager.getConnection('ext-a', stdioConfig);
      await manager.executeToolCall('ext-a', 'search', { query: 'test' });

      const calls = vi.mocked(stdioSendRequest).mock.calls;
      const initCall = calls.find(
        (c) => (c[1] as { method: string }).method === 'initialize',
      );
      expect(initCall).toBeDefined();
      const initRequest = initCall![1] as { params: Record<string, unknown> };
      expect(initRequest.params.protocolVersion).toBe('2024-11-05');
    });

    it('should send initialized notification after successful handshake', async () => {
      manager.getConnection('ext-a', stdioConfig);
      await manager.executeToolCall('ext-a', 'search', { query: 'test' });

      expect(sendNotification).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ method: 'notifications/initialized' }),
      );
    });

    it('should only perform handshake once for multiple tool calls', async () => {
      manager.getConnection('ext-a', stdioConfig);
      await manager.executeToolCall('ext-a', 'tool1', {});
      await manager.executeToolCall('ext-a', 'tool2', {});

      const initCalls = vi.mocked(stdioSendRequest).mock.calls.filter(
        (c) => (c[1] as { method: string }).method === 'initialize',
      );
      expect(initCalls).toHaveLength(1);
    });

    it('should throw when initialization returns an error response', async () => {
      vi.mocked(stdioSendRequest).mockImplementation(async (_proc, request) => {
        if (request.method === 'initialize') {
          return {
            jsonrpc: '2.0' as const,
            error: { code: -32600, message: 'Unsupported protocol' },
            id: request.id,
          };
        }
        return { jsonrpc: '2.0' as const, result: 'ok', id: request.id };
      });

      manager.getConnection('ext-a', stdioConfig);
      await expect(manager.executeToolCall('ext-a', 'tool', {})).rejects.toThrow(
        'MCP initialization failed',
      );
    });
  });

  describe('JSON-RPC error handling', () => {
    it('should throw on error response from tool call', async () => {
      vi.mocked(stdioSendRequest).mockImplementation(async (_proc, request) => {
        if (request.method === 'initialize') {
          return { jsonrpc: '2.0' as const, result: INIT_RESULT, id: request.id };
        }
        return {
          jsonrpc: '2.0' as const,
          error: { code: -32603, message: 'Internal error: tool failed' },
          id: request.id,
        };
      });

      manager.getConnection('ext-a', stdioConfig);
      await expect(manager.executeToolCall('ext-a', 'tool', {})).rejects.toThrow(
        'Internal error: tool failed',
      );
    });

    it('should throw on SSE error response', async () => {
      vi.mocked(sseSendRequest).mockResolvedValue({
        jsonrpc: '2.0',
        error: { code: -32601, message: 'Method not found' },
        id: 1,
      });

      manager.getConnection('ext-b', sseConfig);
      await expect(manager.executeToolCall('ext-b', 'tool', {})).rejects.toThrow(
        'Method not found',
      );
    });

    it('should include error code in the thrown error message', async () => {
      vi.mocked(stdioSendRequest).mockImplementation(async (_proc, request) => {
        if (request.method === 'initialize') {
          return { jsonrpc: '2.0' as const, result: INIT_RESULT, id: request.id };
        }
        return {
          jsonrpc: '2.0' as const,
          error: { code: -32000, message: 'Custom server error' },
          id: request.id,
        };
      });

      manager.getConnection('ext-a', stdioConfig);
      await expect(manager.executeToolCall('ext-a', 'tool', {})).rejects.toThrow(
        'MCP error -32000: Custom server error',
      );
    });
  });

  describe('forwardEvent', () => {
    it('sends notification to all running stdio connections', () => {
      manager.getConnection('ext-a', stdioConfig);
      manager.forwardEvent({ type: 'ext:test:done', source: 'ext:test', data: { id: 1 } });

      expect(sendNotification).toHaveBeenCalled();
    });

    it('does not send to non-stdio connections', () => {
      manager.getConnection('ext-sse', sseConfig);
      manager.forwardEvent({ type: 'ext:test:done', source: 'ext:test', data: {} });

      // sendNotification is called during getConnection for initialize,
      // but forwardEvent should not call it for SSE connections
      const callsBeforeForward = vi.mocked(sendNotification).mock.calls.length;
      manager.forwardEvent({ type: 'another', source: 'test', data: {} });
      expect(vi.mocked(sendNotification).mock.calls.length).toBe(callsBeforeForward);
    });

    it('handles errors gracefully without throwing', () => {
      manager.getConnection('ext-a', stdioConfig);
      vi.mocked(sendNotification).mockImplementation(() => {
        throw new Error('write failed');
      });

      expect(() =>
        manager.forwardEvent({ type: 'ext:test:fail', source: 'ext:test', data: {} }),
      ).not.toThrow();
    });
  });
});
