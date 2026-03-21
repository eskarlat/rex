interface ExecutionContext {
  projectName: string;
  projectPath: string;
  args: Record<string, unknown>;
  config: Record<string, unknown>;
  logger?: {
    debug(message: string, data?: unknown): void;
    info(message: string, data?: unknown): void;
    warn(message: string, data?: unknown): void;
    error(message: string, data?: unknown): void;
  };
}

interface CommandResult {
  output: string;
  exitCode: number;
}

export default function greet(context: ExecutionContext): CommandResult {
  const positional = context.args._positional as string[] | undefined;
  const name =
    (typeof context.args.name === 'string' ? context.args.name : undefined) ??
    positional?.[0] ??
    'World';

  const company =
    typeof context.config.companyName === 'string' ? context.config.companyName : 'RenreKit';

  context.logger?.info(`Greeting ${name} from ${company}`);

  return {
    output: `Hello, ${name}! Welcome from ${company}.`,
    exitCode: 0,
  };
}
