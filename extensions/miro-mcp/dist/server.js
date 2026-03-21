import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { MiroClient } from './client/miro-client.js';
import { createClientFromEnv } from './client/base-client.js';
import { createToolRegistry } from './toolsets/registry.js';
import { errorResult } from './toolsets/types.js';
const server = new Server({ name: 'miro-mcp', version: '1.0.0' }, { capabilities: { tools: {} } });
let registry;
function getRegistry() {
    if (!registry) {
        const config = createClientFromEnv();
        const client = new MiroClient(config);
        registry = createToolRegistry(client);
    }
    return registry;
}
server.setRequestHandler(ListToolsRequestSchema, async () => {
    try {
        const reg = getRegistry();
        return { tools: reg.tools };
    }
    catch {
        return { tools: [] };
    }
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
