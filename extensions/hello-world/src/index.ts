interface CommandResult {
  output: string;
  exitCode: number;
}

interface ExecutionContext {
  projectName: string;
  projectPath: string;
  args: Record<string, unknown>;
  config: Record<string, unknown>;
}

export function onInit(context: ExecutionContext): void {
  console.log(`[hello-world] Activated for project: ${context.projectPath}`);
}

export function onDestroy(context: ExecutionContext): void {
  console.log(`[hello-world] Deactivated for project: ${context.projectPath}`);
}

export function greet(context: ExecutionContext): CommandResult {
  const name = typeof context.args.name === 'string' ? context.args.name : 'World';
  return {
    output: `Hello, ${name}! Welcome to RenreKit.`,
    exitCode: 0,
  };
}

export function info(): CommandResult {
  return {
    output: 'hello-world v1.0.0 — A simple hello world extension for RenreKit',
    exitCode: 0,
  };
}
