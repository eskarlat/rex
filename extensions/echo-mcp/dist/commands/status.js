export default function status(_context) {
    return {
        output: [
            'echo-mcp v1.0.0',
            'Transport: stdio',
            'Tools: echo, ping',
            'Status: ready',
        ].join('\n'),
        exitCode: 0,
    };
}
