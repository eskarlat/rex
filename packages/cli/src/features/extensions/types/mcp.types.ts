export type McpTransport = 'stdio' | 'sse';

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, unknown>;
  id: number;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  result?: unknown;
  error?: JsonRpcError;
  id: number;
}

export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

export type ConnectionState = 'stopped' | 'starting' | 'running' | 'errored';

export interface JsonRpcNotification {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, unknown>;
}

export interface McpConnection {
  extensionName: string;
  transport: McpTransport;
  state: ConnectionState;
  lastError?: string;
  retryCount: number;
}
