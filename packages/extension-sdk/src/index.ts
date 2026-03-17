// RenreKit Extension SDK — Entry point

export const SDK_VERSION = '0.0.1';

// Core types
export type {
  PanelProps,
  ProjectContext,
  CommandResult,
  StorageEntry,
  SDKEventType,
  SDKEventHandler,
  SDKEventPayload,
  ScheduledTask,
  CreateTaskPayload,
  UpdateTaskPayload,
  ToastOptions,
  SDKConfig,
  ProjectContextAPI,
  CommandExecutionAPI,
  StorageAPI,
  DashboardUIAPI,
  EventsAPI,
  SchedulerAPI,
  RenreKitSDK,
} from './core/types';

// SDK implementation
export { RenreKitSDKImpl } from './core/sdk';

// API client
export { ApiClient, ApiClientError } from './core/api-client';

// React context provider
export { SDKProvider, useSDK } from './features/context/SDKProvider';

// React hooks
export { useCommand } from './features/hooks/useCommand';
export { useStorage } from './features/hooks/useStorage';
export { useEvents } from './features/hooks/useEvents';
export { useScheduler } from './features/hooks/useScheduler';
export { useExtension } from './features/hooks/useExtension';
