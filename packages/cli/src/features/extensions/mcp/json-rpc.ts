import type { JsonRpcRequest, JsonRpcResponse } from '../types/mcp.types.js';
import {
  ExtensionError,
  ErrorCode,
} from '../../../core/errors/extension-error.js';

export function buildRequest(
  method: string,
  params: Record<string, unknown>,
  id: number,
): JsonRpcRequest {
  return {
    jsonrpc: '2.0',
    method,
    params,
    id,
  };
}

export function parseResponse(data: string): JsonRpcResponse {
  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    throw new ExtensionError(
      '',
      ErrorCode.JSON_RPC_PARSE_ERROR,
      `Failed to parse JSON-RPC response: ${data.slice(0, 200)}`,
    );
  }

  const obj = parsed as Record<string, unknown>;

  if (obj.jsonrpc !== '2.0') {
    throw new ExtensionError(
      '',
      ErrorCode.JSON_RPC_INVALID_RESPONSE,
      'Invalid JSON-RPC response: missing or invalid jsonrpc field',
    );
  }

  if (typeof obj.id !== 'number') {
    throw new ExtensionError(
      '',
      ErrorCode.JSON_RPC_INVALID_RESPONSE,
      'Invalid JSON-RPC response: missing id field',
    );
  }

  const hasResult = 'result' in obj;
  const hasError = 'error' in obj;

  if (!hasResult && !hasError) {
    throw new ExtensionError(
      '',
      ErrorCode.JSON_RPC_INVALID_RESPONSE,
      'Invalid JSON-RPC response: must contain result or error',
    );
  }

  return obj as unknown as JsonRpcResponse;
}

export function buildToolCallRequest(
  toolName: string,
  args: Record<string, unknown>,
  id: number,
): JsonRpcRequest {
  return buildRequest('tools/call', { name: toolName, arguments: args }, id);
}

export function isNotification(msg: unknown): boolean {
  if (msg === null || msg === undefined || typeof msg !== 'object' || Array.isArray(msg)) {
    return false;
  }

  const obj = msg as Record<string, unknown>;
  return obj.jsonrpc === '2.0' && typeof obj.method === 'string' && !('id' in obj);
}
