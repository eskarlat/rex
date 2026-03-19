import fs from 'node:fs';
import path from 'node:path';
import type Database from 'better-sqlite3';
import type { PluginsJson } from '../../../core/types/index.js';
import { loadManifest } from '../manifest/manifest-loader.js';
import type { EventBus } from '../../../core/event-bus/event-bus.js';
import { getExtensionConfigMappings } from '../../config/config-manager.js';
import { hasEntry } from '../../vault/vault-manager.js';
import { getLogger } from '../../../core/logger/index.js';
import { checkEngineCompat } from '../engine/engine-compat.js';
import { CLI_VERSION, SDK_VERSION } from '../../../core/version.js';

export interface InstalledExtension {
  name: string;
  version: string;
  registry_source: string | null;
  installed_at: string;
  type: string;
}

export interface ExtensionStatus {
  name: string;
  version: string;
  type: string;
  activatedInProject: boolean;
  activatedVersion: string | null;
}

const PLUGINS_JSON_PATH = '.renre-kit/plugins.json';

function readPluginsJson(projectPath: string): PluginsJson {
  const filePath = path.join(projectPath, PLUGINS_JSON_PATH);
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as PluginsJson;
}

function writePluginsJson(projectPath: string, plugins: PluginsJson): void {
  const filePath = path.join(projectPath, PLUGINS_JSON_PATH);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(plugins, null, 2));
}

async function runHook(
  extensionDir: string,
  mainPath: string,
  hookName: string,
  projectDir: string,
): Promise<void> {
  const fullPath = path.resolve(extensionDir, mainPath);
  if (!fs.existsSync(fullPath)) {
    return;
  }
  try {
    const mod: unknown = await import(fullPath);
    const modRecord = mod as Record<string, unknown>;
    const hookFn = modRecord[hookName];
    if (typeof hookFn === 'function') {
      await (hookFn as (ctx: { projectDir: string }) => Promise<void>)({ projectDir });
    }
  } catch {
    // Hook execution failures are non-fatal during activate/deactivate
  }
}

export function install(
  name: string,
  version: string,
  registrySource: string,
  type: string,
  db: Database.Database,
): void {
  const stmt = db.prepare(
    'INSERT OR REPLACE INTO installed_extensions (name, version, registry_source, type, installed_at) VALUES (?, ?, ?, ?, datetime(\'now\'))',
  );
  stmt.run(name, version, registrySource, type);
  getLogger().info('extension-manager', `Installed ${name}@${version}`, { registrySource, type });
}

export function remove(
  name: string,
  version: string,
  db: Database.Database,
): void {
  const stmt = db.prepare(
    'DELETE FROM installed_extensions WHERE name = ? AND version = ?',
  );
  stmt.run(name, version);
}

export function listInstalled(db: Database.Database): InstalledExtension[] {
  const stmt = db.prepare('SELECT * FROM installed_extensions');
  return stmt.all() as InstalledExtension[];
}

export function validateVaultKeys(extensionName: string): string[] {
  const mappings = getExtensionConfigMappings(extensionName);
  const missing: string[] = [];

  for (const [field, mapping] of Object.entries(mappings)) {
    if (mapping.source === 'vault' && !hasEntry(mapping.value)) {
      missing.push(`${field} → vault:${mapping.value}`);
    }
  }

  return missing;
}

export async function activate(
  name: string,
  version: string,
  projectPath: string,
  extensionDir: string,
  bus?: EventBus,
): Promise<string[]> {
  const manifest = loadManifest(extensionDir);

  const compat = checkEngineCompat(manifest, CLI_VERSION, SDK_VERSION);
  if (!compat.compatible) {
    for (const issue of compat.issues) {
      getLogger().warn('extension-manager', issue);
    }
  }

  const plugins = readPluginsJson(projectPath);

  plugins[name] = version;
  writePluginsJson(projectPath, plugins);

  const missingKeys = validateVaultKeys(name);

  if (manifest.main) {
    await runHook(extensionDir, manifest.main, 'onInit', projectPath);
  }

  getLogger().info('extension-manager', `Activated ${name}@${version}`, { projectPath });

  if (bus) {
    void bus.emit('ext:activate', {
      type: 'ext:activate',
      extensionName: name,
      version,
      projectPath,
    });
  }

  return missingKeys;
}

export async function deactivate(
  name: string,
  projectPath: string,
  extensionDir: string,
  bus?: EventBus,
): Promise<void> {
  const manifest = loadManifest(extensionDir);

  if (manifest.main) {
    await runHook(extensionDir, manifest.main, 'onDestroy', projectPath);
  }

  const plugins = readPluginsJson(projectPath);
  delete plugins[name];
  writePluginsJson(projectPath, plugins);

  getLogger().info('extension-manager', `Deactivated ${name}`, { projectPath });

  if (bus) {
    void bus.emit('ext:deactivate', {
      type: 'ext:deactivate',
      extensionName: name,
      projectPath,
    });
  }
}

export function getActivated(projectPath: string): PluginsJson {
  return readPluginsJson(projectPath);
}

export function status(
  projectPath: string,
  db: Database.Database,
): ExtensionStatus[] {
  const installed = listInstalled(db);
  const plugins = readPluginsJson(projectPath);

  return installed.map((ext) => {
    const activatedVersion = plugins[ext.name] ?? null;
    return {
      name: ext.name,
      version: ext.version,
      type: ext.type,
      activatedInProject: activatedVersion !== null,
      activatedVersion,
    };
  });
}
