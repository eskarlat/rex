import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { JiraClient } from './client/jira-client.js';
import { ConfluenceClient } from './client/confluence-client.js';
import { createClientFromEnv } from './client/base-client.js';
import { collectToolDefinitions, createToolRegistry } from './toolsets/registry.js';
import { errorResult } from './toolsets/types.js';
const server = new Server({ name: 'atlassian-mcp', version: '1.0.0' }, { capabilities: { tools: {} } });
// Tool definitions are static schemas — always available regardless of auth.
const toolDefinitions = collectToolDefinitions();
// Real registry with authenticated clients — created lazily on first tool call.
let registry;
function getRegistry() {
    if (!registry) {
        const config = createClientFromEnv();
        const jira = new JiraClient(config);
        const confluence = new ConfluenceClient(config);
        registry = createToolRegistry(jira, confluence);
    }
    return registry;
}
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: toolDefinitions };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const reg = getRegistry();
        const handler = reg.handlers[request.params.name];
        if (!handler) {
            return errorResult(`Unknown tool: ${request.params.name}`);
        }
        return handler((request.params.arguments ?? {}));
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return errorResult(message);
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch((err) => {
    process.stderr.write(`Fatal: ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
});
