import type { JsonToMarkdownOptions } from '@renre-kit/extension-sdk/node';
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
/** Converts data to LLM-friendly Markdown instead of raw JSON */
export declare function markdownResult(data: unknown, options?: JsonToMarkdownOptions): ToolResult;
export declare function errorResult(message: string): ToolResult;
