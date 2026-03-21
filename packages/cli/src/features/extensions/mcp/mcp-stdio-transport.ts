import { spawn, type ChildProcess } from 'node:child_process';
import type { JsonRpcRequest, JsonRpcResponse, JsonRpcNotification } from '../types/mcp.types.js';
import { parseResponse } from './json-rpc.js';
import { ExtensionError, ErrorCode } from '../../../core/errors/extension-error.js';

export interface McpStdioProcess {
  process: ChildProcess;
  buffer: string;
  stderrBuffer: string;
}

export function spawnProcess(
  command: string,
  args: string[],
  env: Record<string, string>,
  cwd: string,
): McpStdioProcess {
  const child = spawn(command, args, {
    cwd,
    env,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  const proc: McpStdioProcess = {
    process: child,
    buffer: '',
    stderrBuffer: '',
  };
  child.stderr?.on('data', (chunk: Buffer) => {
    proc.stderrBuffer += chunk.toString();
  });
  return proc;
}

export function sendRequest(
  proc: McpStdioProcess,
  request: JsonRpcRequest,
): Promise<JsonRpcResponse> {
  return new Promise((resolve, reject) => {
    let settled = false;

    const tryParseLine = (line: string): JsonRpcResponse | null => {
      const trimmed = line.trim();
      if (!trimmed) return null;

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(trimmed) as Record<string, unknown>;
      } catch {
        return null;
      }

      if (!('id' in parsed) || parsed.id !== request.id) return null;

      return parseResponse(trimmed);
    };

    const onData = (chunk: Buffer): void => {
      proc.buffer += chunk.toString();
      const lines = proc.buffer.split(/\r?\n/);
      proc.buffer = lines.pop() ?? '';

      for (const line of lines) {
        try {
          const response = tryParseLine(line);
          if (response) {
            cleanup();
            resolve(response);
            return;
          }
        } catch (err) {
          cleanup();
          reject(err instanceof Error ? err : new Error(String(err)));
          return;
        }
      }
    };

    const onError = (err: Error): void => {
      if (!settled) {
        cleanup();
        const stderr = proc.stderrBuffer.trim();
        const detail = stderr ? `\n${stderr}` : '';
        reject(
          new ExtensionError(
            '',
            ErrorCode.MCP_PROCESS_CRASHED,
            `MCP process error: ${err.message}${detail}`,
            err,
          ),
        );
      }
    };

    const onClose = (code: number | null): void => {
      if (!settled) {
        cleanup();
        const stderr = proc.stderrBuffer.trim();
        const detail = stderr ? `\n${stderr}` : '';
        reject(
          new ExtensionError(
            '',
            ErrorCode.MCP_PROCESS_CRASHED,
            `MCP process exited unexpectedly with code ${code}${detail}`,
          ),
        );
      }
    };

    function cleanup(): void {
      settled = true;
      proc.process.stdout?.off('data', onData);
      proc.process.off('error', onError);
      proc.process.off('close', onClose);
    }

    proc.process.stdout?.on('data', onData);
    proc.process.on('error', onError);
    proc.process.on('close', onClose);

    // Write request to stdin
    const payload = JSON.stringify(request) + '\n';
    proc.process.stdin?.write(payload);
  });
}

export function sendNotification(
  proc: McpStdioProcess,
  notification: JsonRpcNotification,
): void {
  const payload = JSON.stringify(notification) + '\n';
  proc.process.stdin?.write(payload);
}

const KILL_TIMEOUT_MS = 5000;

export function killProcess(proc: McpStdioProcess): Promise<void> {
  return new Promise((resolve) => {
    proc.process.once('close', () => resolve());

    // On Windows, process.kill() uses TerminateProcess (unconditional hard kill),
    // so no SIGTERM/SIGKILL escalation is needed.
    if (process.platform === 'win32') {
      proc.process.kill();
    } else {
      proc.process.kill('SIGTERM');

      // Escalate to SIGKILL if the process doesn't exit within the timeout
      const killTimer = setTimeout(() => {
        proc.process.kill('SIGKILL');
      }, KILL_TIMEOUT_MS);
      proc.process.once('close', () => clearTimeout(killTimer));
    }
  });
}
