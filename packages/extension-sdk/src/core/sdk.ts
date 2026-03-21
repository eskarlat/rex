import { ApiClient } from './api-client';
import type {
  RenreKitSDK,
  SDKConfig,
  ProjectContextAPI,
  CommandExecutionAPI,
  StorageAPI,
  DashboardUIAPI,
  EventsAPI,
  SchedulerAPI,
  TerminalAPI,
  LoggerAPI,
  SDKEventType,
  SDKEventHandler,
  SDKEventPayload,
  ToastOptions,
  ProjectContext,
} from './types';

/** Callback type for toast notifications */
type ToastCallback = (options: ToastOptions) => void;

/** Callback type for navigation */
type NavigateCallback = (path: string) => void;

/** Callback type for terminal open */
type TerminalOpenCallback = () => void;

/** Callback type for terminal close */
type TerminalCloseCallback = () => void;

/** Callback type for terminal send */
type TerminalSendCallback = (data: string) => void;

/**
 * Creates the project context capability group.
 * Caches project info and allows refresh via API.
 */
function createProjectAPI(client: ApiClient, config: SDKConfig): ProjectContextAPI {
  let cached: ProjectContext | null = null;

  const api: ProjectContextAPI = {
    get name() {
      return cached?.name ?? null;
    },
    get path() {
      return config.projectPath ?? null;
    },
    get config() {
      return cached?.config ?? {};
    },
    async refresh() {
      cached = await client.getProject();
    },
  };

  return api;
}

/**
 * Creates the command execution capability group.
 */
function createExecAPI(client: ApiClient): CommandExecutionAPI {
  return {
    async run(command, args) {
      return client.runCommand(command, args);
    },
  };
}

/**
 * Creates the persistent storage capability group.
 * Uses a fixed extension name derived from config.
 */
function createStorageAPI(client: ApiClient, extensionName: string): StorageAPI {
  return {
    async get(key) {
      return client.getStorageValue(extensionName, key);
    },
    async set(key, value) {
      await client.setStorage(extensionName, key, value);
    },
    async delete(key) {
      await client.deleteStorage(extensionName, key);
    },
    async list() {
      return client.listStorage(extensionName);
    },
  };
}

/**
 * Creates the dashboard UI capability group.
 * Toast and navigate use registered callbacks; confirm uses window.confirm.
 */
function createUIAPI(): DashboardUIAPI & {
  setToastHandler: (handler: ToastCallback) => void;
  setNavigateHandler: (handler: NavigateCallback) => void;
} {
  let toastHandler: ToastCallback | null = null;
  let navigateHandler: NavigateCallback | null = null;

  return {
    toast(options: ToastOptions) {
      if (toastHandler) {
        toastHandler(options);
      }
    },
    confirm(message: string): Promise<boolean> {
      return Promise.resolve(globalThis.confirm(message));
    },
    navigate(path: string) {
      if (navigateHandler) {
        navigateHandler(path);
      }
    },
    setToastHandler(handler: ToastCallback) {
      toastHandler = handler;
    },
    setNavigateHandler(handler: NavigateCallback) {
      navigateHandler = handler;
    },
  };
}

/**
 * Creates the cross-extension events capability group.
 * Uses an internal Map of handler sets, similar to the CLI EventBus.
 */
function createEventsAPI(): EventsAPI & { clearAll: () => void } {
  const handlers = new Map<SDKEventType, Set<SDKEventHandler>>();

  return {
    on(event: SDKEventType, handler: SDKEventHandler) {
      let set = handlers.get(event);
      if (!set) {
        set = new Set();
        handlers.set(event, set);
      }
      set.add(handler);
    },
    off(event: SDKEventType, handler: SDKEventHandler) {
      const set = handlers.get(event);
      if (set) {
        set.delete(handler);
      }
    },
    emit(event: SDKEventType, payload: SDKEventPayload) {
      const set = handlers.get(event);
      if (set) {
        for (const handler of set) {
          Promise.resolve(handler(payload)).catch(() => {
            /* swallow handler errors */
          });
        }
      }
    },
    clearAll() {
      handlers.clear();
    },
  };
}

/**
 * Creates the scheduler capability group.
 */
function createSchedulerAPI(client: ApiClient): SchedulerAPI {
  return {
    async list() {
      return client.getScheduledTasks();
    },
    async register(task) {
      return client.createTask(task);
    },
    async unregister(id) {
      await client.deleteTask(id);
    },
    async update(id, payload) {
      return client.updateTask(id, payload);
    },
  };
}

/**
 * Creates the terminal capability group.
 * Open, close, and send use registered callbacks from the dashboard host.
 */
function createTerminalAPI(): TerminalAPI & {
  setOpenHandler: (handler: TerminalOpenCallback) => void;
  setCloseHandler: (handler: TerminalCloseCallback) => void;
  setSendHandler: (handler: TerminalSendCallback) => void;
} {
  let openHandler: TerminalOpenCallback | null = null;
  let closeHandler: TerminalCloseCallback | null = null;
  let sendHandler: TerminalSendCallback | null = null;

  return {
    open() {
      if (openHandler) {
        openHandler();
      }
    },
    close() {
      if (closeHandler) {
        closeHandler();
      }
    },
    send(data: string) {
      if (sendHandler) {
        sendHandler(data);
      }
    },
    setOpenHandler(handler: TerminalOpenCallback) {
      openHandler = handler;
    },
    setCloseHandler(handler: TerminalCloseCallback) {
      closeHandler = handler;
    },
    setSendHandler(handler: TerminalSendCallback) {
      sendHandler = handler;
    },
  };
}

/**
 * Creates the logger capability group.
 * Sends log entries to the dashboard API with ext:<name> source prefix.
 */
function createLoggerAPI(client: ApiClient, extensionName: string): LoggerAPI {
  const source = `ext:${extensionName}`;

  return {
    debug(message: string, data?: unknown): void {
      void client.writeLog('debug', source, message, data);
    },
    info(message: string, data?: unknown): void {
      void client.writeLog('info', source, message, data);
    },
    warn(message: string, data?: unknown): void {
      void client.writeLog('warn', source, message, data);
    },
    error(message: string, data?: unknown): void {
      void client.writeLog('error', source, message, data);
    },
  };
}

/**
 * Concrete implementation of the RenreKitSDK interface.
 * Composes 8 capability groups backed by an ApiClient.
 */
export class RenreKitSDKImpl implements RenreKitSDK {
  readonly project: ProjectContextAPI;
  readonly exec: CommandExecutionAPI;
  readonly storage: StorageAPI;
  readonly ui: DashboardUIAPI & {
    setToastHandler: (handler: ToastCallback) => void;
    setNavigateHandler: (handler: NavigateCallback) => void;
  };
  readonly events: EventsAPI & { clearAll: () => void };
  readonly scheduler: SchedulerAPI;
  readonly terminal: TerminalAPI & {
    setOpenHandler: (handler: TerminalOpenCallback) => void;
    setCloseHandler: (handler: TerminalCloseCallback) => void;
    setSendHandler: (handler: TerminalSendCallback) => void;
  };
  readonly logger: LoggerAPI;

  private readonly internalEvents: EventsAPI & { clearAll: () => void };

  constructor(config: SDKConfig, extensionName = 'default') {
    const client = new ApiClient({
      baseUrl: config.baseUrl,
      projectPath: config.projectPath,
    });

    this.project = createProjectAPI(client, config);
    this.exec = createExecAPI(client);
    this.storage = createStorageAPI(client, extensionName);
    this.ui = createUIAPI();
    this.internalEvents = createEventsAPI();
    this.events = this.internalEvents;
    this.scheduler = createSchedulerAPI(client);
    this.terminal = createTerminalAPI();
    this.logger = createLoggerAPI(client, extensionName);
  }

  destroy(): void {
    this.internalEvents.clearAll();
  }
}
