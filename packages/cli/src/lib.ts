// Library entry point — exports managers for use by the server package.
// Unlike index.ts, this does NOT auto-run the CLI.

// Version constants
export { CLI_VERSION, SDK_VERSION } from './core/version.js';

// Core infrastructure
export { initDatabase, getDb, closeDatabase } from './core/database/database.js';
export {
  GLOBAL_DIR,
  getExtensionDir,
  getManifestPath,
  getPluginsPath,
  getAgentDir,
  getSkillsDir,
  LOGS_DIR,
  REGISTRIES_DIR,
  SERVER_PID_PATH,
  LAN_PIN_PATH,
} from './core/paths/paths.js';
export { EventBus } from './core/event-bus/event-bus.js';
export { Logger, getLogger } from './core/logger/index.js';
export type { LogLevel } from './core/logger/index.js';
export { createExtensionLogger } from './core/logger/extension-logger.js';
export { CommandRegistry } from './core/command-registry/command-registry.js';
export { ProjectManager } from './core/project/project-manager.js';

// Extension system
export {
  install,
  remove,
  listInstalled,
  activate,
  deactivate,
  getActivated,
  status,
  validateVaultKeys,
} from './features/extensions/manager/extension-manager.js';
export { loadManifest } from './features/extensions/manifest/manifest-loader.js';
export {
  checkEngineCompat,
  checkEngineConstraints,
} from './features/extensions/engine/engine-compat.js';
export type { CompatResult } from './features/extensions/engine/engine-compat.js';
export { ConnectionManager } from './features/extensions/mcp/connection-manager.js';
export {
  loadCommandHandler,
  executeCommand,
} from './features/extensions/runtime/standard-runtime.js';

// Vault
export {
  setEntry,
  getEntry,
  removeEntry,
  listEntries,
  getDecryptedValue,
  hasEntry,
  listKeys,
  getEntriesByTag,
} from './features/vault/vault-manager.js';

// Config
export {
  loadGlobalConfig,
  saveGlobalConfig,
  setExtensionConfig,
  getExtensionConfigMappings,
  resolveExtensionConfig,
  getReferencingExtensions,
} from './features/config/config-manager.js';

// Registry
export {
  sync,
  syncAll,
  ensureSynced,
  list as listRegistries,
  resolve as resolveExtension,
  listAvailable as listAvailableExtensions,
  searchAvailable as searchAvailableExtensions,
  installExtension,
  resolveRegistryIcon,
} from './features/registry/registry-manager.js';
export type { SearchOptions } from './features/registry/registry-manager.js';

// Notifications
export {
  createNotification,
  listNotifications,
  countUnread,
  markRead,
  markAllRead,
  deleteNotification,
  cleanupNotifications,
} from './features/notifications/notification-manager.js';
export type { ListNotificationsOptions } from './features/notifications/notification-manager.js';
export type {
  NotificationRecord,
  NotificationVariant,
  CreateNotificationPayload,
} from './features/notifications/notification.types.js';

// Dashboard
export { getDashboardLayout, saveDashboardLayout } from './features/dashboard/dashboard-layout.js';

// Skills
export { aggregateSkills } from './features/skills/capabilities-aggregator.js';

// Shared utilities
export {
  pathExistsSync,
  readJsonSync,
  writeJsonSync,
  ensureDirSync,
  removeDirSync,
  copyDirSync,
} from './shared/fs-helpers.js';
export { interpolate } from './shared/interpolation.js';
export { jsonToMarkdown } from './shared/json-to-markdown.js';
export type { JsonToMarkdownOptions } from './shared/json-to-markdown.js';
export { executeTaskCommand } from './shared/task-execution.js';
export type { TaskExecResult } from './shared/task-execution.js';

// Update cache
export {
  readUpdateCache,
  refreshUpdateCache,
} from './features/extensions/update-cache/update-cache.js';
export type { UpdateCache, UpdateInfo } from './features/extensions/types/update-cache.types.js';

// Types
export type { ProjectRecord, ProjectManifest, PluginsJson } from './core/types/project.types.js';
export type {
  GlobalConfig,
  RegistryConfig,
  RegistryEntry,
  ConfigMapping,
  ConfigSchemaField,
} from './core/types/config.types.js';
export type { EventType, EventPayload } from './core/types/events.types.js';
export type { ExecutionContext, ExtensionLogger } from './core/types/context.types.js';
export type {
  ExtensionManifest,
  ExtensionCommand,
  EngineConstraints,
  PartialEngineConstraints,
  UiWidget,
  WidgetSize,
} from './features/extensions/types/extension.types.js';
export type { DashboardLayout, WidgetPlacement } from './core/types/dashboard.types.js';
