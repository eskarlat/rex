// Library entry point — exports managers for use by the server package.
// Unlike index.ts, this does NOT auto-run the CLI.

// Core infrastructure
export { initDatabase, getDb, closeDatabase } from './core/database/database.js';
export { GLOBAL_DIR, getExtensionDir, getManifestPath, getPluginsPath, getAgentDir, getSkillsDir, LOGS_DIR, REGISTRIES_DIR } from './core/paths/paths.js';
export { EventBus } from './core/event-bus/event-bus.js';
export { Logger } from './core/logger/logger.js';
export { CommandRegistry } from './core/command-registry/command-registry.js';
export { ProjectManager } from './core/project/project-manager.js';

// Extension system
export { install, remove, listInstalled, activate, deactivate, getActivated, status, validateVaultKeys } from './features/extensions/manager/extension-manager.js';
export { loadManifest } from './features/extensions/manifest/manifest-loader.js';
export { ConnectionManager } from './features/extensions/mcp/connection-manager.js';
export { loadCommandHandler, executeCommand } from './features/extensions/runtime/standard-runtime.js';

// Vault
export { setEntry, getEntry, removeEntry, listEntries, getDecryptedValue, hasEntry, listKeys, getEntriesByTag } from './features/vault/vault-manager.js';

// Config
export { loadGlobalConfig, saveGlobalConfig, setExtensionConfig, getExtensionConfigMappings, resolveExtensionConfig, getReferencingExtensions } from './features/config/config-manager.js';

// Registry
export { sync, syncAll, list as listRegistries, resolve as resolveExtension, installExtension } from './features/registry/registry-manager.js';

// Skills
export { aggregateSkills } from './features/skills/capabilities-aggregator.js';

// Shared utilities
export { pathExistsSync, readJsonSync, writeJsonSync, ensureDirSync, removeDirSync, copyDirSync } from './shared/fs-helpers.js';
export { interpolate } from './shared/interpolation.js';

// Types
export type { ProjectRecord, ProjectManifest, PluginsJson } from './core/types/project.types.js';
export type { GlobalConfig, RegistryConfig, ConfigMapping, ConfigSchemaField } from './core/types/config.types.js';
export type { EventType, EventPayload } from './core/types/events.types.js';
export type { ExecutionContext } from './core/types/context.types.js';
export type { ExtensionManifest, ExtensionCommand } from './features/extensions/types/extension.types.js';
