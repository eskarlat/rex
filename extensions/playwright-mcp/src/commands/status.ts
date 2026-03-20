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

export default function status(_context: ExecutionContext): CommandResult {
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
