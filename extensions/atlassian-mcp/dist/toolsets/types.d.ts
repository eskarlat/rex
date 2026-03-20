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
export declare function textResult(data: unknown): ToolResult;
export declare function errorResult(message: string): ToolResult;
