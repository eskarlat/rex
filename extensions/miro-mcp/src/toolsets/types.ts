export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface ToolResult {
  [key: string]: unknown;
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

export interface Toolset {
  name: string;
  tools: ToolDefinition[];
  handlers: Record<string, (args: Record<string, unknown>) => Promise<ToolResult>>;
}

function textResult(data: unknown): ToolResult {
  return {
    content: [
      { type: 'text', text: typeof data === 'string' ? data : JSON.stringify(data, null, 2) },
    ],
  };
}

export function errorResult(message: string): ToolResult {
  return {
    content: [{ type: 'text', text: message }],
    isError: true,
  };
}

/**
 * Creates a tool handler that wraps a client call with try/catch error handling.
 * Eliminates boilerplate duplication across toolset handlers.
 */
export function createHandler(
  fn: (args: Record<string, unknown>) => Promise<unknown>,
): (args: Record<string, unknown>) => Promise<ToolResult> {
  return async (args) => {
    try {
      const data = await fn(args);
      return textResult(data ?? 'Success');
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err));
    }
  };
}
