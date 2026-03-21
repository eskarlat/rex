import path from 'node:path';
import type {
  GlobalConfig,
  ConfigMapping,
  ConfigSchemaField,
  RegistryConfig,
} from '../../core/types/index.js';
import type { ProjectManifest } from '../../core/types/project.types.js';
import { CONFIG_PATH, GLOBAL_DIR, PROJECT_DIR, MANIFEST_JSON } from '../../core/paths/paths.js';
import {
  pathExistsSync,
  readJsonSync,
  writeJsonSync,
  ensureDirSync,
} from '../../shared/fs-helpers.js';
import { migrateFile } from '../../shared/schema-migration.js';
import { configMigrations } from './migrations/index.js';
import { getDecryptedValue } from '../vault/vault-manager.js';

const DEFAULT_REGISTRY: RegistryConfig = {
  name: 'default',
  url: 'https://github.com/eskarlat/rex.git',
  priority: 0,
  cacheTTL: 3600,
};

const DEFAULT_CONFIG: GlobalConfig = {
  schemaVersion: 1,
  registries: [DEFAULT_REGISTRY],
  settings: {},
  extensionConfigs: {},
};

export function loadGlobalConfig(): GlobalConfig {
  if (!pathExistsSync(CONFIG_PATH)) {
    return { ...DEFAULT_CONFIG, extensionConfigs: {} };
  }
  const stored = readJsonSync<Record<string, unknown>>(CONFIG_PATH);
  const migrated = migrateFile(CONFIG_PATH, stored, configMigrations) as Partial<GlobalConfig>;
  return {
    ...DEFAULT_CONFIG,
    ...migrated,
    extensionConfigs: migrated.extensionConfigs ?? {},
  };
}

export function saveGlobalConfig(config: GlobalConfig): void {
  ensureDirSync(GLOBAL_DIR);
  writeJsonSync(CONFIG_PATH, config);
}

export function setExtensionConfig(
  extensionName: string,
  fieldName: string,
  mapping: ConfigMapping,
): void {
  const config = loadGlobalConfig();
  if (!config.extensionConfigs[extensionName]) {
    config.extensionConfigs[extensionName] = {};
  }
  const extConfig = config.extensionConfigs[extensionName];
  if (extConfig) {
    extConfig[fieldName] = mapping;
  }
  saveGlobalConfig(config);
}

export function getExtensionConfigMappings(extensionName: string): Record<string, ConfigMapping> {
  const config = loadGlobalConfig();
  return config.extensionConfigs[extensionName] ?? {};
}

function loadProjectConfig(
  projectPath: string,
  extensionName: string,
): Record<string, ConfigMapping> | undefined {
  const manifestPath = path.join(projectPath, PROJECT_DIR, MANIFEST_JSON);
  if (!pathExistsSync(manifestPath)) {
    return undefined;
  }
  const manifest = readJsonSync<ProjectManifest>(manifestPath);
  return manifest.extensionConfigs?.[extensionName];
}

function resolveMapping(mapping: ConfigMapping): unknown {
  if (mapping.source === 'vault') {
    return getDecryptedValue(mapping.value);
  }
  return mapping.value;
}

export function resolveExtensionConfig(
  extensionName: string,
  schema: Record<string, ConfigSchemaField>,
  projectPath?: string,
): Record<string, unknown> {
  const globalMappings = getExtensionConfigMappings(extensionName);
  const projectMappings = projectPath ? loadProjectConfig(projectPath, extensionName) : undefined;

  const resolved: Record<string, unknown> = {};

  for (const [field, fieldSchema] of Object.entries(schema)) {
    // Priority: project override > global config > schema default
    const projectMapping = projectMappings?.[field];
    if (projectMapping) {
      resolved[field] = resolveMapping(projectMapping);
      continue;
    }

    const globalMapping = globalMappings[field];
    if (globalMapping) {
      resolved[field] = resolveMapping(globalMapping);
      continue;
    }

    if (fieldSchema.default !== undefined) {
      resolved[field] = fieldSchema.default;
    }
  }

  return resolved;
}

export function getReferencingExtensions(vaultKey: string): string[] {
  const config = loadGlobalConfig();
  const result: string[] = [];

  for (const [extName, mappings] of Object.entries(config.extensionConfigs)) {
    for (const mapping of Object.values(mappings)) {
      if (mapping.source === 'vault' && mapping.value === vaultKey) {
        result.push(extName);
        break;
      }
    }
  }

  return result;
}
