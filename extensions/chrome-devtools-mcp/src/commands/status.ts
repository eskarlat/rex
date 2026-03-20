interface ExecutionContext {
  projectName: string;
  projectPath: string;
  args: Record<string, unknown>;
  config: Record<string, unknown>;
}

interface CommandResult {
  output: string;
  exitCode: number;
}

const TOOLS = [
  'browser_navigate',
  'browser_click',
  'browser_type',
  'browser_snapshot',
  'browser_screenshot',
  'browser_console_messages',
  'browser_network_requests',
  'browser_evaluate',
  'browser_wait_for',
  'browser_tab_list',
  'browser_tab_create',
  'browser_tab_select',
  'browser_tab_close',
  'browser_file_upload',
  'browser_performance_trace',
];

export default function status(_context: ExecutionContext): CommandResult {
  return {
    output: [
      'chrome-devtools-mcp v1.0.0',
      'Transport: stdio',
      'Command: npx -y chrome-devtools-mcp@latest',
      `Tools: ${TOOLS.join(', ')}`,
      'Requires: Node.js 22+, Chrome browser',
      'Status: ready',
    ].join('\n'),
    exitCode: 0,
  };
}
