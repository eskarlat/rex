import type { JsonRpcRequest, JsonRpcResponse } from '../types/mcp.types.js';
import { ExtensionError, ErrorCode } from '../../../core/errors/extension-error.js';

export interface McpSseConnection {
  url: string;
  headers: Record<string, string>;
  connected: boolean;
}

const REQUEST_TIMEOUT_MS = 30_000;

export function connect(url: string, headers: Record<string, string>): McpSseConnection {
  return {
    url,
    headers,
    connected: true,
  };
}

export async function sendRequest(
  connection: McpSseConnection,
  request: JsonRpcRequest,
): Promise<JsonRpcResponse> {
  if (!connection.connected) {
    throw new ExtensionError(
      '',
      ErrorCode.MCP_CONNECTION_FAILED,
      'Cannot send request: connection is disconnected',
    );
  }

  let response: Response;
  try {
    response = await fetch(connection.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...connection.headers,
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    throw new ExtensionError(
      '',
      ErrorCode.MCP_REQUEST_FAILED,
      `MCP SSE request failed: ${(err as Error).message}`,
      err as Error,
    );
  }

  if (!response.ok) {
    throw new ExtensionError(
      '',
      ErrorCode.MCP_REQUEST_FAILED,
      `MCP SSE request failed with HTTP ${response.status}: ${response.statusText}`,
    );
  }

  const data = (await response.json()) as JsonRpcResponse;
  return data;
}

export function disconnect(connection: McpSseConnection): void {
  connection.connected = false;
}
