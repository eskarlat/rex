export interface CommandContext<T extends Record<string, unknown> = Record<string, unknown>> {
  projectName: string;
  projectPath: string;
  args: T;
  config: Record<string, unknown>;
  logger?: {
    debug(message: string, data?: unknown): void;
    info(message: string, data?: unknown): void;
    warn(message: string, data?: unknown): void;
    error(message: string, data?: unknown): void;
  };
}

export interface CommandResult {
  output: string;
  exitCode: number;
}
