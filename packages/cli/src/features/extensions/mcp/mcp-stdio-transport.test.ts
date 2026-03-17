import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { Readable, Writable } from 'node:stream';
import {
  spawnProcess,
  sendRequest,
  killProcess,
} from './mcp-stdio-transport.js';
import type { McpStdioProcess } from './mcp-stdio-transport.js';
import type { JsonRpcRequest } from '../types/mcp.types.js';

// Mock child_process
vi.mock('node:child_process', () => ({
  spawn: vi.fn(),
}));

import { spawn } from 'node:child_process';

function createMockChildProcess(): ChildProcess & EventEmitter {
  const cp = new EventEmitter() as ChildProcess & EventEmitter;
  cp.stdin = new Writable({
    write(_chunk, _encoding, callback) {
      callback();
    },
  });
  cp.stdout = new Readable({ read() {} });
  cp.stderr = new Readable({ read() {} });
  cp.pid = 12345;
  cp.kill = vi.fn().mockReturnValue(true);
  cp.killed = false;
  return cp;
}

describe('mcp-stdio-transport', () => {
  let mockCp: ChildProcess & EventEmitter;

  beforeEach(() => {
    mockCp = createMockChildProcess();
    vi.mocked(spawn).mockReturnValue(mockCp as ChildProcess);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('spawnProcess', () => {
    it('should spawn a child process with correct arguments', () => {
      const proc = spawnProcess('node', ['server.js'], { NODE_ENV: 'test' }, '/tmp');
      expect(spawn).toHaveBeenCalledWith('node', ['server.js'], {
        cwd: '/tmp',
        env: { NODE_ENV: 'test' },
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      expect(proc.process).toBe(mockCp);
    });

    it('should return an McpStdioProcess with buffer', () => {
      const proc = spawnProcess('python', ['-m', 'server'], {}, '/home');
      expect(proc.buffer).toBe('');
      expect(proc.process.pid).toBe(12345);
    });
  });

  describe('sendRequest', () => {
    it('should write JSON-RPC request to stdin and receive response', async () => {
      const proc = spawnProcess('node', [], {}, '/tmp');
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 1,
      };

      const responsePromise = sendRequest(proc, request);

      // Simulate response from stdout
      const responseData = JSON.stringify({
        jsonrpc: '2.0',
        result: { success: true },
        id: 1,
      });
      proc.process.stdout!.push(responseData + '\n');

      const response = await responsePromise;
      expect(response.id).toBe(1);
      expect(response.result).toEqual({ success: true });
    });

    it('should handle buffered partial responses', async () => {
      const proc = spawnProcess('node', [], {}, '/tmp');
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 2,
      };

      const responsePromise = sendRequest(proc, request);

      // Send response in two chunks
      const responseData = JSON.stringify({
        jsonrpc: '2.0',
        result: 'buffered',
        id: 2,
      });
      const half = Math.floor(responseData.length / 2);
      proc.process.stdout!.push(responseData.slice(0, half));
      proc.process.stdout!.push(responseData.slice(half) + '\n');

      const response = await responsePromise;
      expect(response.result).toBe('buffered');
    });

    it('should reject when process emits error', async () => {
      const proc = spawnProcess('node', [], {}, '/tmp');
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 3,
      };

      const responsePromise = sendRequest(proc, request);
      proc.process.emit('error', new Error('process crashed'));

      await expect(responsePromise).rejects.toThrow('process crashed');
    });

    it('should reject when process exits unexpectedly', async () => {
      const proc = spawnProcess('node', [], {}, '/tmp');
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 4,
      };

      const responsePromise = sendRequest(proc, request);
      proc.process.emit('close', 1);

      await expect(responsePromise).rejects.toThrow();
    });

    it('should skip notification messages (no id match)', async () => {
      const proc = spawnProcess('node', [], {}, '/tmp');
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 5,
      };

      const responsePromise = sendRequest(proc, request);

      // Send a notification (no id), then the actual response
      const notification = JSON.stringify({
        jsonrpc: '2.0',
        method: 'notifications/progress',
      });
      const response = JSON.stringify({
        jsonrpc: '2.0',
        result: 'done',
        id: 5,
      });
      proc.process.stdout!.push(notification + '\n' + response + '\n');

      const result = await responsePromise;
      expect(result.result).toBe('done');
    });
  });

  describe('killProcess', () => {
    it('should send SIGTERM to the process', async () => {
      const proc = spawnProcess('node', [], {}, '/tmp');

      const killPromise = killProcess(proc);
      // Simulate process exit
      proc.process.emit('close', 0);
      await killPromise;

      expect(proc.process.kill).toHaveBeenCalledWith('SIGTERM');
    });

    it('should send SIGKILL if process does not exit within timeout', async () => {
      vi.useFakeTimers();
      const proc = spawnProcess('node', [], {}, '/tmp');

      const killPromise = killProcess(proc);
      // Advance past the 5s timeout
      vi.advanceTimersByTime(5000);
      // Now SIGKILL should have been sent, simulate close
      proc.process.emit('close', 0);

      await killPromise;
      expect(proc.process.kill).toHaveBeenCalledWith('SIGTERM');
      expect(proc.process.kill).toHaveBeenCalledWith('SIGKILL');
      vi.useRealTimers();
    });
  });
});
