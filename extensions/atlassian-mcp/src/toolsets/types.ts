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

/** Wraps an async operation, converting thrown errors into errorResult responses */
export async function safeExec(fn: () => Promise<unknown>): Promise<ToolResult> {
  try {
    return markdownResult(await fn());
  } catch (err) {
    return errorResult(err instanceof Error ? err.message : String(err));
  }
}

/** Build an Atlassian Document Format (ADF) body from plain text */
export function buildAdfBody(text: string): Record<string, unknown> {
  return {
    type: 'doc',
    version: 1,
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text }],
      },
    ],
  };
}

/** Extract pagination args with defaults */
export function paginationArgs(
  args: Record<string, unknown>,
  defaults = { startAt: 0, maxResults: 50 },
): [number, number] {
  return [
    (args['startAt'] as number | undefined) ?? defaults.startAt,
    (args['maxResults'] as number | undefined) ?? defaults.maxResults,
  ];
}

/** Extract Confluence pagination args with defaults */
export function confluencePaginationArgs(
  args: Record<string, unknown>,
  defaults = { limit: 25, start: 0 },
): [number, number] {
  return [
    (args['limit'] as number | undefined) ?? defaults.limit,
    (args['start'] as number | undefined) ?? defaults.start,
  ];
}
