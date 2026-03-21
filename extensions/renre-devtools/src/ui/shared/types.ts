export interface SdkExec {
  run: (command: string, args?: Record<string, unknown>) => Promise<{ output: string }>;
}

export interface SdkUi {
  toast: (opts: { title: string; description?: string }) => void;
}

export interface SdkNotify {
  (opts: { title: string; message?: string; variant?: 'success' | 'info' | 'error' }): void;
}

export interface SdkStorage {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
  delete: (key: string) => Promise<void>;
}

export interface SdkEvents {
  publish: (type: string, data?: Record<string, unknown>) => void;
}

export interface PanelSdk {
  exec: SdkExec;
  ui: SdkUi;
  notify: SdkNotify;
  storage: SdkStorage;
  events: SdkEvents;
}

export interface PanelProps {
  sdk?: PanelSdk;
  extensionName?: string;
}

export interface TabInfo {
  index: number;
  title: string;
  url: string;
}

export interface BrowserStatusData {
  running: boolean;
  pid?: number;
  port?: number;
  launchedAt?: string;
  tabCount?: number;
  tabs?: TabInfo[];
  headless?: boolean;
  projectPath?: string;
  staleSessionCleaned?: boolean;
}

export interface ChromeCheckResult {
  found: boolean;
  path?: string;
  source?: string;
  canInstall?: boolean;
}

export interface ScreenshotMeta {
  filename: string;
  path: string;
  timestamp: string;
  url: string;
  selector: string | null;
  fullPage: boolean;
}

export interface ConsoleEntry {
  timestamp: string;
  level: string;
  text: string;
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
