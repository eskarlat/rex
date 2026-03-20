export default function status(context) {
    const hasToken = Boolean(context.config['accessToken']);
    const lines = [
        'miro-mcp v1.0.0',
        'Transport: stdio (MCP SDK)',
        `Access Token: ${hasToken ? '(set)' : '(not set)'}`,
        '',
        'Toolsets: 21',
        'Total Tools: 98',
        '',
        hasToken ? 'Status: ready' : 'Status: configuration required',
    ];
    return { output: lines.join('\n'), exitCode: 0 };
}
