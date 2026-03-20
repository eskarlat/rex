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
    content: Array<{
        type: 'text';
        text: string;
    }>;
    isError?: boolean;
}
export interface Toolset {
    name: string;
    tools: ToolDefinition[];
    handlers: Record<string, (args: Record<string, unknown>) => Promise<ToolResult>>;
}
export declare function errorResult(message: string): ToolResult;
/**
 * Creates a tool handler that wraps a client call with try/catch error handling.
 * Eliminates boilerplate duplication across toolset handlers.
 */
export declare function createHandler(fn: (args: Record<string, unknown>) => Promise<unknown>): (args: Record<string, unknown>) => Promise<ToolResult>;
