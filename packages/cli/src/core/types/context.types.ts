export interface ExecutionContext {
  projectName: string;
  projectPath: string;
  args: Record<string, unknown>;
  config: Record<string, unknown>;
}
