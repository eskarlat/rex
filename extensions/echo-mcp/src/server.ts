import * as readline from 'node:readline';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: unknown;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string;
  result?: unknown;
  error?: { code: number; message: string };
}

interface ToolCallParams {
  name: string;
  arguments?: Record<string, unknown>;
}

function handleToolCall(params: ToolCallParams): unknown {
  switch (params.name) {
    case 'echo':
      return params.arguments ?? {};
    case 'ping':
      return 'pong';
    default:
      return null;
  }
}

function handleRequest(request: JsonRpcRequest): JsonRpcResponse {
  if (request.method === 'tools/call') {
    const params = request.params as ToolCallParams | undefined;
    if (!params?.name) {
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: { code: -32602, message: 'Missing tool name in params' },
      };
    }
    const result = handleToolCall(params);
    if (result === null) {
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: { code: -32601, message: `Tool not found: ${params.name}` },
      };
    }
    return { jsonrpc: '2.0', id: request.id, result };
  }

  return {
    jsonrpc: '2.0',
    id: request.id,
    error: { code: -32601, message: `Method not found: ${request.method}` },
  };
}

const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line: string) => {
  try {
    const request = JSON.parse(line) as JsonRpcRequest;
    const response = handleRequest(request);
    process.stdout.write(JSON.stringify(response) + '\n');
  } catch {
    const errorResponse: JsonRpcResponse = {
      jsonrpc: '2.0',
      id: 0,
      error: { code: -32700, message: 'Parse error' },
    };
    process.stdout.write(JSON.stringify(errorResponse) + '\n');
  }
});
