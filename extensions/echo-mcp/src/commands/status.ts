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
      'echo-mcp v1.0.0',
      'Transport: stdio',
      'Tools: echo, ping',
      'Status: ready',
    ].join('\n'),
    exitCode: 0,
  };
}
