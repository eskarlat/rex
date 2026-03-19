import * as readline from 'node:readline';
function handleToolCall(params) {
    switch (params.name) {
        case 'echo':
            return params.arguments ?? {};
        case 'ping':
            return 'pong';
        default:
            return null;
    }
}
function handleRequest(request) {
    if (request.method === 'tools/call') {
        const params = request.params;
        if (!params?.name) {
            return {
                jsonrpc: '2.0',
                id: request.id,
                error: { code: -32602, message: 'Missing tool name in params' },
            };
        }
        const result = handleToolCall(params);
        if (result === null) {
            return {
                jsonrpc: '2.0',
                id: request.id,
                error: { code: -32601, message: `Tool not found: ${params.name}` },
            };
        }
        return { jsonrpc: '2.0', id: request.id, result };
    }
    return {
        jsonrpc: '2.0',
        id: request.id,
        error: { code: -32601, message: `Method not found: ${request.method}` },
    };
}
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
    try {
        const request = JSON.parse(line);
        const response = handleRequest(request);
        process.stdout.write(JSON.stringify(response) + '\n');
    }
    catch {
        const errorResponse = {
            jsonrpc: '2.0',
            id: 0,
            error: { code: -32700, message: 'Parse error' },
        };
        process.stdout.write(JSON.stringify(errorResponse) + '\n');
    }
});
