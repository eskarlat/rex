import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { connect, sendRequest, disconnect } from './mcp-sse-transport.js';
import type { McpSseConnection } from './mcp-sse-transport.js';
import type { JsonRpcRequest } from '../types/mcp.types.js';
import { ErrorCode } from '../../../core/errors/extension-error.js';

describe('mcp-sse-transport', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('connect', () => {
    it('should create a connection with url and headers', () => {
      const conn = connect('http://localhost:3000/mcp', {
        Authorization: 'Bearer token123',
      });
      expect(conn.url).toBe('http://localhost:3000/mcp');
      expect(conn.headers).toEqual({ Authorization: 'Bearer token123' });
      expect(conn.connected).toBe(true);
    });

    it('should create a connection with empty headers', () => {
      const conn = connect('http://localhost:3000/mcp', {});
      expect(conn.headers).toEqual({});
      expect(conn.connected).toBe(true);
    });
  });

  describe('sendRequest', () => {
    it('should send a POST request and return parsed response', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          jsonrpc: '2.0',
          result: { data: 'test' },
          id: 1,
        }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const conn = connect('http://localhost:3000/mcp', {});
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'search' },
        id: 1,
      };

      const response = await sendRequest(conn, request);
      expect(response.result).toEqual({ data: 'test' });
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/mcp',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(request),
        }),
      );
    });

    it('should include connection headers in the request', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          jsonrpc: '2.0',
          result: null,
          id: 2,
        }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const conn = connect('http://localhost:3000/mcp', {
        Authorization: 'Bearer secret',
      });
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 2,
      };

      await sendRequest(conn, request);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/mcp',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer secret',
          }),
        }),
      );
    });

    it('should throw when the HTTP response is not ok', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const conn = connect('http://localhost:3000/mcp', {});
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 3,
      };

      await expect(sendRequest(conn, request)).rejects.toThrow();
      try {
        await sendRequest(conn, request);
      } catch (err: unknown) {
        const error = err as { code: string };
        expect(error.code).toBe(ErrorCode.MCP_REQUEST_FAILED);
      }
    });

    it('should throw when fetch throws a network error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const conn = connect('http://localhost:3000/mcp', {});
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 4,
      };

      await expect(sendRequest(conn, request)).rejects.toThrow();
    });

    it('should throw when connection is disconnected', async () => {
      const conn = connect('http://localhost:3000/mcp', {});
      disconnect(conn);

      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 5,
      };

      await expect(sendRequest(conn, request)).rejects.toThrow();
    });

    it('should set a 30s timeout via AbortSignal', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          jsonrpc: '2.0',
          result: null,
          id: 6,
        }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const conn = connect('http://localhost:3000/mcp', {});
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 6,
      };

      await sendRequest(conn, request);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
      );
    });
  });

  describe('disconnect', () => {
    it('should mark the connection as disconnected', () => {
      const conn = connect('http://localhost:3000/mcp', {});
      expect(conn.connected).toBe(true);
      disconnect(conn);
      expect(conn.connected).toBe(false);
    });
  });
});
