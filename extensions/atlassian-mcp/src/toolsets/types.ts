import { jsonToMarkdown } from '@renre-kit/extension-sdk/node';
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
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

export interface Toolset {
  name: string;
  tools: ToolDefinition[];
  handlers: Record<string, (args: Record<string, unknown>) => Promise<ToolResult>>;
}

export function textResult(data: unknown): ToolResult {
  return {
    content: [
      { type: 'text', text: typeof data === 'string' ? data : JSON.stringify(data, null, 2) },
    ],
  };
}

/** Converts data to LLM-friendly Markdown instead of raw JSON */
export function markdownResult(data: unknown, options?: JsonToMarkdownOptions): ToolResult {
  return {
    content: [{ type: 'text', text: jsonToMarkdown(data, { filterNoise: true, ...options }) }],
  };
}

export function errorResult(message: string): ToolResult {
  return {
    content: [{ type: 'text', text: message }],
    isError: true,
  };
}
