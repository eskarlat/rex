import { JiraClient } from '../client/jira-client.js';
import { ConfluenceClient } from '../client/confluence-client.js';
import type { ToolDefinition, ToolResult } from './types.js';
export interface ToolRegistry {
    tools: ToolDefinition[];
    handlers: Record<string, (args: Record<string, unknown>) => Promise<ToolResult>>;
}
/**
 * Collect tool definitions without requiring valid auth.
 * Creates dummy clients to extract static schema metadata only.
 */
export declare function collectToolDefinitions(): ToolDefinition[];
export declare function createToolRegistry(jira: JiraClient, confluence: ConfluenceClient): ToolRegistry;
