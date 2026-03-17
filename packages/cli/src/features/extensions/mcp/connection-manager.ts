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

interface InternalConnection {
  metadata: McpConnection;
  config: McpConfig;
  stdioProcess?: McpStdioProcess;
  sseConnection?: McpSseConnection;
  lastActivity: number;
  idleTimer?: ReturnType<typeof setTimeout>;
  requestId: number;
}

type LifecycleMode = 'cli' | 'dashboard';

const CLI_IDLE_TIMEOUT_MS = 30_000;

export class ConnectionManager {
  private readonly connections = new Map<string, InternalConnection>();
  private mode: LifecycleMode = 'cli';

  getConnection(extensionName: string, mcpConfig: McpConfig): McpConnection {
    const existing = this.connections.get(extensionName);
    if (existing && existing.metadata.state === 'running') {
      existing.lastActivity = Date.now();
      return existing.metadata;
    }

    const internal = this.startConnection(extensionName, mcpConfig);
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
  ): Promise<McpConnection> {
    const existing = this.connections.get(extensionName);
    if (existing) {
      await this.stopConnection(extensionName, existing);
    }

    const internal = this.startConnection(extensionName, mcpConfig);
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
      lastActivity: Date.now(),
      requestId: 0,
    };

    if (mcpConfig.transport === 'stdio') {
      internal.stdioProcess = spawnProcess(
        mcpConfig.command ?? '',
        mcpConfig.args ?? [],
        mcpConfig.env ?? {},
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
