import type { McpConfig } from '../types/extension.types.js';
import type { ConnectionState, McpConnection } from '../types/mcp.types.js';
import {
  spawnProcess,
  sendRequest as stdioSendRequest,
  sendNotification,
  killProcess,
} from './mcp-stdio-transport.js';
import type { McpStdioProcess } from './mcp-stdio-transport.js';
import { getLogger } from '../../../core/logger/index.js';
import { connect, sendRequest as sseSendRequest, disconnect } from './mcp-sse-transport.js';
import type { McpSseConnection } from './mcp-sse-transport.js';
import { buildToolCallRequest, buildInitializeRequest, buildNotification } from './json-rpc.js';
import { ExtensionError, ErrorCode } from '../../../core/errors/extension-error.js';
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
  initPromise?: Promise<void>;
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
    cwd?: string,
  ): McpConnection {
    const existing = this.connections.get(extensionName);
    if (existing && existing.metadata.state === 'running') {
      existing.lastActivity = Date.now();
      return existing.metadata;
    }

    const internal = this.startConnection(extensionName, mcpConfig, resolvedConfig, cwd);
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
    // Ensure MCP handshake is complete for stdio connections
    if (internal.config.transport === 'stdio' && internal.stdioProcess && !internal.initPromise) {
      internal.initPromise = this.performHandshake(extensionName, internal);
    }
    if (internal.initPromise) {
      await internal.initPromise;
    }

    const requestId = ++internal.requestId;
    const request = buildToolCallRequest(toolName, args, requestId);

    if (internal.config.transport === 'stdio' && internal.stdioProcess) {
      const response = await stdioSendRequest(internal.stdioProcess, request);
      return this.extractResult(extensionName, response);
    }

    if (internal.config.transport === 'sse' && internal.sseConnection) {
      const response = await sseSendRequest(internal.sseConnection, request);
      return this.extractResult(extensionName, response);
    }

    throw new ExtensionError(
      extensionName,
      ErrorCode.MCP_CONNECTION_FAILED,
      `Connection for ${extensionName} is not properly initialized`,
    );
  }

  private extractResult(
    extensionName: string,
    response: { result?: unknown; error?: { code: number; message: string; data?: unknown } },
  ): unknown {
    if (response.error) {
      throw new ExtensionError(
        extensionName,
        ErrorCode.MCP_REQUEST_FAILED,
        `MCP error ${response.error.code}: ${response.error.message}`,
      );
    }
    return response.result;
  }

  private async performHandshake(
    extensionName: string,
    internal: InternalConnection,
  ): Promise<void> {
    const proc = internal.stdioProcess;
    if (!proc) return;

    const requestId = ++internal.requestId;
    const initRequest = buildInitializeRequest(requestId);
    const response = await stdioSendRequest(proc, initRequest);

    if (response.error) {
      throw new ExtensionError(
        extensionName,
        ErrorCode.MCP_CONNECTION_FAILED,
        `MCP initialization failed: ${response.error.message}`,
      );
    }

    sendNotification(proc, buildNotification('notifications/initialized'));
  }

  private async retryWithBackoff(
    extensionName: string,
    internal: InternalConnection,
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<unknown> {
    let retries = 0;
    let lastErr: unknown;
    while (retries < MAX_RETRIES) {
      retries++;
      internal.metadata.retryCount = retries;
      getLogger().warn('extensions', `Retrying MCP connection for ${extensionName}`, {
        attempt: retries,
      });
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
      internal.initPromise = undefined;
      internal.metadata.state = 'running';

      try {
        const result = await this.sendRequest(extensionName, internal, toolName, args);
        internal.metadata.retryCount = 0;
        this.resetIdleTimer(extensionName);
        return result;
      } catch (err) {
        lastErr = err;
        if (!isCrashError(err)) {
          throw err;
        }
      }
    }

    getLogger().error('extensions', `MCP process for ${extensionName} crashed`, {
      retries: MAX_RETRIES,
      lastError: String(lastErr),
    });
    internal.metadata.state = 'errored';
    internal.metadata.lastError = `Failed after ${MAX_RETRIES} restart attempts`;
    throw new ExtensionError(
      extensionName,
      ErrorCode.MCP_PROCESS_CRASHED,
      `MCP process for ${extensionName} crashed and failed to restart after ${MAX_RETRIES} attempts`,
    );
  }

  forwardEvent(event: { type: string; source: string; data: Record<string, unknown> }): void {
    for (const [, conn] of this.connections) {
      if (conn.metadata.state === 'running' && conn.stdioProcess) {
        try {
          sendNotification(conn.stdioProcess, buildNotification('notifications/event', event));
        } catch (err) {
          getLogger().warn('extensions', 'Failed to forward event to MCP connection', {
            extension: conn.metadata.extensionName,
            eventType: event.type,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }
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
    cwd?: string,
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
      internal.stdioProcess = this.createStdioProcess(mcpConfig, resolvedConfig, cwd);
    } else {
      internal.sseConnection = this.createSseConnection(mcpConfig, resolvedConfig);
    }

    return internal;
  }

  private createStdioProcess(
    mcpConfig: McpConfig,
    resolvedConfig?: Record<string, unknown>,
    cwd?: string,
  ): McpStdioProcess {
    const env = resolveEnv(mcpConfig.env ?? {}, resolvedConfig ?? {});
    return spawnProcess(mcpConfig.command ?? '', mcpConfig.args ?? [], env, cwd ?? process.cwd());
  }

  private createSseConnection(
    mcpConfig: McpConfig,
    resolvedConfig?: Record<string, unknown>,
  ): McpSseConnection {
    const config = resolvedConfig ?? {};
    const resolvedUrl = interpolate(mcpConfig.url ?? '', config);
    const resolvedHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(mcpConfig.headers ?? {})) {
      resolvedHeaders[key] = interpolate(value, config);
    }
    return connect(resolvedUrl, resolvedHeaders);
  }

  private async stopConnection(_name: string, internal: InternalConnection): Promise<void> {
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
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function resolveEnv(
  env: Record<string, string>,
  config: Record<string, unknown>,
): Record<string, string> {
  const resolved: Record<string, string> = {
    ...(process.env as Record<string, string>),
  };
  for (const [key, value] of Object.entries(env)) {
    resolved[key] = interpolate(value, config);
  }
  return resolved;
}
