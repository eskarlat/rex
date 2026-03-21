export interface SdkLogger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}

export interface SdkMethods {
  deployAgentAssets: () => void;
  cleanupAgentAssets: () => void;
  logger: SdkLogger;
  notify: (options: { title: string; message?: string; variant?: string; actionUrl?: string }) => void;
}

export interface HookContext {
  projectDir: string;
  agentDir: string;
  extensionDir: string;
  sdk: SdkMethods;
}

export interface BuildPanelEntry {
  in: string;
  out: string;
}

export interface BuildPanelOptions {
  entryPoints: BuildPanelEntry[];
  outdir: string;
  minify?: boolean;
}
