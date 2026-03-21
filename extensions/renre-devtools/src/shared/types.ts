export interface ExecutionContext {
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

export interface CommandResult {
  output: string;
  exitCode: number;
}

export interface BrowserState {
  wsEndpoint: string;
  pid: number;
  port: number;
  launchedAt: string;
  networkLogPath: string;
  consoleLogPath: string;
}

export interface NetworkEntry {
  timestamp: string;
  method: string;
  url: string;
  status: number;
  type: string;
  size: number;
  duration: number;
}

export interface ConsoleEntry {
  timestamp: string;
  level: string;
  text: string;
}

export interface GlobalBrowserSession {
  wsEndpoint: string;
  pid: number;
  port: number;
  projectPath: string;
  launchedAt: string;
  lastSeenAt: string;
  headless: boolean;
  networkLogPath: string;
  consoleLogPath: string;
}

export interface ScreenshotMeta {
  filename: string;
  path: string;
  timestamp: string;
  url: string;
  selector: string | null;
  fullPage: boolean;
}
