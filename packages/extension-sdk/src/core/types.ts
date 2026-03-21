// RenreKit Extension SDK — Core Types

/** Props passed to extension UI panels and widgets by the dynamic loaders */
export interface PanelProps {
  sdk: RenreKitSDK;
  extensionName: string;
  projectPath: string | null;
}

/** Project context information */
export interface ProjectContext {
  name: string;
  path: string;
  config: Record<string, unknown>;
}

/** Command execution result */
export interface CommandResult {
  output: string;
  exitCode: number;
}

/** Storage entry */
export interface StorageEntry {
  key: string;
  value: string;
}

/** Event types supported by the SDK — widened to string for cross-extension events */
// eslint-disable-next-line sonarjs/redundant-type-aliases -- kept as semantic alias for API clarity across SDK consumers
export type SDKEventType = string;

/** Event handler function */
export type SDKEventHandler = (payload: SDKEventPayload) => void | Promise<void>;

/** Event payload */
export interface SDKEventPayload {
  type: SDKEventType;
  [key: string]: unknown;
}

/** Scheduled task */
export interface ScheduledTask {
  id: string;
  name: string;
  type: string;
  project_path: string | null;
  cron: string;
  command: string;
  enabled: number;
  last_run_at: string | null;
  last_status: string | null;
  next_run_at: string;
  created_at: string;
}

/** Task creation payload */
export interface CreateTaskPayload {
  extension_name: string;
  cron: string;
  command: string;
  project_path?: string;
}

/** Task update payload */
export interface UpdateTaskPayload {
  cron?: string;
  command?: string;
  enabled?: number;
}

/** Toast notification options */
export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

/** Persistent notification options */
export interface NotificationOptions {
  title: string;
  message?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  actionUrl?: string;
}

/** SDK Configuration */
export interface SDKConfig {
  baseUrl?: string;
  projectPath?: string | null;
}

/** Project Context capability group */
export interface ProjectContextAPI {
  readonly name: string | null;
  readonly path: string | null;
  readonly config: Record<string, unknown>;
  refresh(): Promise<void>;
}

/** Command Execution capability group */
export interface CommandExecutionAPI {
  run(command: string, args?: Record<string, unknown>): Promise<CommandResult>;
}

/** Persistent Storage capability group */
export interface StorageAPI {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(): Promise<StorageEntry[]>;
}

/** Dashboard UI Helpers capability group */
export interface DashboardUIAPI {
  toast(options: ToastOptions): void;
  confirm(message: string): Promise<boolean>;
  navigate(path: string): void;
}

/** Cross-Extension Events capability group */
export interface EventsAPI {
  on(event: SDKEventType, handler: SDKEventHandler): void;
  off(event: SDKEventType, handler: SDKEventHandler): void;
  emit(event: SDKEventType, payload: SDKEventPayload): void;
  publish(event: string, data?: Record<string, unknown>): Promise<void>;
}

/** Scheduler capability group */
export interface SchedulerAPI {
  list(): Promise<ScheduledTask[]>;
  register(task: CreateTaskPayload): Promise<ScheduledTask>;
  unregister(id: string): Promise<void>;
  update(id: string, payload: UpdateTaskPayload): Promise<ScheduledTask>;
}

/** Terminal capability group */
export interface TerminalAPI {
  open(): void;
  close(): void;
  send(data: string): void;
}

/** Logger capability group */
export interface LoggerAPI {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}

/** Main SDK interface — 9 capability groups */
export interface RenreKitSDK {
  readonly project: ProjectContextAPI;
  readonly exec: CommandExecutionAPI;
  readonly storage: StorageAPI;
  readonly ui: DashboardUIAPI;
  readonly events: EventsAPI;
  readonly scheduler: SchedulerAPI;
  readonly terminal: TerminalAPI;
  readonly logger: LoggerAPI;
  notify(options: NotificationOptions): Promise<void>;
  destroy(): void;
}

/** Semantic alias for PanelProps — widgets receive the same props as panels */
export type WidgetProps = PanelProps;
