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
  platform: PlatformInfo;
  sdk: SdkMethods;
}

export type OSType = 'windows' | 'macos' | 'linux';

export type ArchType = 'x64' | 'arm64' | 'ia32' | 'arm';

export interface PlatformInfo {
  readonly os: OSType;
  readonly arch: ArchType;
  readonly isWindows: boolean;
  readonly isMacos: boolean;
  readonly isLinux: boolean;
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

export interface BuildExtensionEntry {
  in: string;
  out: string;
}

export interface BuildExtensionOptions {
  /** Node.js entry points to bundle (hooks, commands, MCP server) */
  entryPoints: BuildExtensionEntry[];
  /** Output directory (typically 'dist') */
  outdir: string;
  /** Packages to keep as external imports (not bundled) */
  external?: string[];
  /** Enable minification */
  minify?: boolean;
}
