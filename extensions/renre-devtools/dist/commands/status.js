const TOOLS = [
    'puppeteer_navigate',
    'puppeteer_screenshot',
    'puppeteer_click',
    'puppeteer_hover',
    'puppeteer_fill',
    'puppeteer_select',
    'puppeteer_evaluate',
];
const RESOURCES = ['console://logs', 'screenshot://<name>'];
export default function status(_context) {
    return {
        output: [
            'renre-devtools v1.0.0',
            'Transport: stdio',
            'Command: npx -y @modelcontextprotocol/server-puppeteer',
            'Mode: headed (visible browser window)',
            `Tools: ${TOOLS.join(', ')}`,
            `Resources: ${RESOURCES.join(', ')}`,
            'Status: ready',
        ].join('\n'),
        exitCode: 0,
    };
}
