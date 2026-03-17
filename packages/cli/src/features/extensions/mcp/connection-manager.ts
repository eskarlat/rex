import type { McpConfig } from '../types/extension.types.js';
import type { ConnectionState, McpConnection } from '../types/mcp.types.js';
import {
  spawnProcess,
  sendRequest as stdioSendRequest,
  killProcess,
} from './mcp-stdio-transport.js';
import type { McpStdioProcess } from './mcp-stdio-transport.js';
import {
  connect,
  sendRequest as sseSendRequest,
  disconnect,
} from './mcp-sse-transport.js';
import type { McpSseConnection } from './mcp-sse-transport.js';
import { buildToolCallRequest } from './json-rpc.js';
import {
  ExtensionError,
  ErrorCode,
} from '../../../core/errors/extension-error.js';
import { interpolate } from '../../../shared/interpolation.js';

interface InternalConnection {
  metadata: McpConnection;
  config: McpConfig;
  resolvedConfig: Record<string, unknown>;
  stdioProcess?: McpStdioProcess;
  sseConnection?: McpSseConnection;
  lastActivity: number;
  idleTimer?: ReturnType<typeof setTimeout>;
  requestId: number;
}

type LifecycleMode = 'cli' | 'dashboard';

const CLI_IDLE_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;

export class ConnectionManager {
  private readonly connections = new Map<string, InternalConnection>();
  private mode: LifecycleMode = 'cli';
  private backoffBaseMs = BASE_BACKOFF_MS;

  getConnection(
    extensionName: string,
    mcpConfig: McpConfig,
    resolvedConfig?: Record<string, unknown>,
  ): McpConnection {
    const existing = this.connections.get(extensionName);
    if (existing && existing.metadata.state === 'running') {
      existing.lastActivity = Date.now();
      return existing.metadata;
    }

    const internal = this.startConnection(extensionName, mcpConfig, resolvedConfig);
    this.connections.set(extensionName, internal);
    this.resetIdleTimer(extensionName);
    return internal.metadata;
  }

  async executeToolCall(
    extensionName: string,
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<unknown> {
    const internal = this.connections.get(extensionName);
    if (!internal) {
      throw new ExtensionError(
        extensionName,
        ErrorCode.MCP_CONNECTION_FAILED,
        `No connection for extension: ${extensionName}`,
      );
    }

    internal.lastActivity = Date.now();
    this.resetIdleTimer(extensionName);

    try {
      return await this.sendRequest(extensionName, internal, toolName, args);
    } catch (err) {
      if (isCrashError(err)) {
        return this.retryWithBackoff(extensionName, internal, toolName, args);
      }
      throw err;
    }
  }

  private async sendRequest(
    extensionName: string,
    internal: InternalConnection,
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<unknown> {
    const requestId = ++internal.requestId;
    const request = buildToolCallRequest(toolName, args, requestId);

    if (internal.config.transport === 'stdio' && internal.stdioProcess) {
      const response = await stdioSendRequest(internal.stdioProcess, request);
      return response.result;
    }

    if (internal.config.transport === 'sse' && internal.sseConnection) {
      const response = await sseSendRequest(internal.sseConnection, request);
      return response.result;
    }

    throw new ExtensionError(
      extensionName,
      ErrorCode.MCP_CONNECTION_FAILED,
      `Connection for ${extensionName} is not properly initialized`,
    );
  }

  private async retryWithBackoff(
    extensionName: string,
    internal: InternalConnection,
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<unknown> {
    let retries = 0;
    while (retries < MAX_RETRIES) {
      retries++;
      internal.metadata.retryCount = retries;
      const delay = this.backoffBaseMs * Math.pow(2, retries - 1);
      await sleep(delay);

      await this.stopConnection(extensionName, internal);
      const restarted = this.startConnection(
        extensionName,
        internal.config,
        internal.resolvedConfig,
      );
      internal.stdioProcess = restarted.stdioProcess;
      internal.sseConnection = restarted.sseConnection;
      internal.metadata.state = 'running';

      try {
        const result = await this.sendRequest(extensionName, internal, toolName, args);
        internal.metadata.retryCount = 0;
        return result;
      } catch (err) {
        if (!isCrashError(err)) {
          throw err;
        }
      }
    }

    internal.metadata.state = 'errored';
    internal.metadata.lastError = `Failed after ${MAX_RETRIES} restart attempts`;
    throw new ExtensionError(
      extensionName,
      ErrorCode.MCP_PROCESS_CRASHED,
      `MCP process for ${extensionName} crashed and failed to restart after ${MAX_RETRIES} attempts`,
    );
  }

  async stopAll(): Promise<void> {
    const stopPromises: Promise<void>[] = [];
    for (const [name, internal] of this.connections) {
      stopPromises.push(this.stopConnection(name, internal));
    }
    await Promise.all(stopPromises);
    this.connections.clear();
  }

  async restart(
    extensionName: string,
    mcpConfig: McpConfig,
    resolvedConfig?: Record<string, unknown>,
  ): Promise<McpConnection> {
    const existing = this.connections.get(extensionName);
    if (existing) {
      await this.stopConnection(extensionName, existing);
    }

    const internal = this.startConnection(extensionName, mcpConfig, resolvedConfig);
    this.connections.set(extensionName, internal);
    this.resetIdleTimer(extensionName);
    return internal.metadata;
  }

  status(): Map<string, ConnectionState> {
    const result = new Map<string, ConnectionState>();
    for (const [name, internal] of this.connections) {
      result.set(name, internal.metadata.state);
    }
    return result;
  }

  setMode(mode: LifecycleMode): void {
    this.mode = mode;
    if (mode === 'dashboard') {
      for (const internal of this.connections.values()) {
        if (internal.idleTimer) {
          clearTimeout(internal.idleTimer);
          internal.idleTimer = undefined;
        }
      }
    }
  }

  private startConnection(
    extensionName: string,
    mcpConfig: McpConfig,
    resolvedConfig?: Record<string, unknown>,
  ): InternalConnection {
    const metadata: McpConnection = {
      extensionName,
      transport: mcpConfig.transport,
      state: 'running',
      retryCount: 0,
    };

    const internal: InternalConnection = {
      metadata,
      config: mcpConfig,
      resolvedConfig: resolvedConfig ?? {},
      lastActivity: Date.now(),
      requestId: 0,
    };

    if (mcpConfig.transport === 'stdio') {
      const env = resolveEnv(mcpConfig.env ?? {}, resolvedConfig ?? {});
      internal.stdioProcess = spawnProcess(
        mcpConfig.command ?? '',
        mcpConfig.args ?? [],
        env,
        process.cwd(),
      );
    } else {
      internal.sseConnection = connect(
        mcpConfig.url ?? '',
        mcpConfig.headers ?? {},
      );
    }

    return internal;
  }

  private async stopConnection(
    _name: string,
    internal: InternalConnection,
  ): Promise<void> {
    if (internal.idleTimer) {
      clearTimeout(internal.idleTimer);
    }

    if (internal.stdioProcess) {
      await killProcess(internal.stdioProcess);
    }

    if (internal.sseConnection) {
      disconnect(internal.sseConnection);
    }

    internal.metadata.state = 'stopped';
  }

  private resetIdleTimer(extensionName: string): void {
    if (this.mode !== 'cli') {
      return;
    }

    const internal = this.connections.get(extensionName);
    if (!internal) {
      return;
    }

    if (internal.idleTimer) {
      clearTimeout(internal.idleTimer);
    }

    internal.idleTimer = setTimeout(() => {
      void this.stopConnection(extensionName, internal).then(() => {
        this.connections.delete(extensionName);
      });
    }, CLI_IDLE_TIMEOUT_MS);
  }
}

function isCrashError(err: unknown): boolean {
  return err instanceof ExtensionError && err.code === ErrorCode.MCP_PROCESS_CRASHED;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

function resolveEnv(
  env: Record<string, string>,
  config: Record<string, unknown>,
): Record<string, string> {
  const resolved: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    resolved[key] = interpolate(value, config);
  }
  return resolved;
}
