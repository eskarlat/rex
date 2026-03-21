import type { ExtensionLogger } from './logger.js';

export interface ExecutionContext {
  projectName: string;
  projectPath: string;
  args: Record<string, unknown>;
  config: Record<string, unknown>;
  logger?: ExtensionLogger;
}

export interface CommandResult {
  output: string;
  exitCode: number;
}
