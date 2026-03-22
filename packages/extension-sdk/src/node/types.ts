import type { ExtensionLogger, PlatformInfo } from '@renre-kit/shared';

export type { ExtensionLogger, OSType, ArchType, PlatformInfo } from '@renre-kit/shared';

export interface SdkMethods {
  deployAgentAssets: () => void;
  cleanupAgentAssets: () => void;
  logger: ExtensionLogger;
  notify: (options: { title: string; message?: string; variant?: string; actionUrl?: string }) => void;
}

export interface HookContext {
  projectDir: string;
  agentDir: string;
  extensionDir: string;
  platform?: PlatformInfo;
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
  /** Enable code splitting to share common dependencies across entry points */
  splitting?: boolean;
}
