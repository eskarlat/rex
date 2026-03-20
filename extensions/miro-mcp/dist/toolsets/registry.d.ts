import type { MiroClient } from '../client/miro-client.js';
import type { ToolDefinition, ToolResult } from './types.js';
export interface ToolRegistry {
    tools: ToolDefinition[];
    handlers: Record<string, (args: Record<string, unknown>) => Promise<ToolResult>>;
}
export declare function createToolRegistry(client: MiroClient): ToolRegistry;
