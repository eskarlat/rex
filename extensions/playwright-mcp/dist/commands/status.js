export default function status(_context) {
    return {
        output: [
            'playwright-mcp v1.0.0',
            'Transport: stdio',
            'Command: npx -y @anthropic-ai/playwright-mcp@latest',
            'Tools: browser_navigate, browser_screenshot, browser_click, browser_fill, browser_evaluate, browser_snapshot',
            'Status: ready',
        ].join('\n'),
        exitCode: 0,
    };
}
