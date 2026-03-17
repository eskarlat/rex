import fs from 'node:fs';
import path from 'node:path';
import type Database from 'better-sqlite3';
import type { PluginsJson } from '../../../core/types/index.js';
import { loadManifest } from '../manifest/manifest-loader.js';

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
  hookPath: string,
  projectDir: string,
): Promise<void> {
  const fullPath = path.resolve(extensionDir, hookPath);
  if (!fs.existsSync(fullPath)) {
    return;
  }
  try {
    const mod: unknown = await import(fullPath);
    const modRecord = mod as Record<string, unknown>;
    const hookFn = modRecord.default ?? mod;
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

export async function activate(
  name: string,
  version: string,
  projectPath: string,
  extensionDir: string,
): Promise<void> {
  const manifest = loadManifest(extensionDir);
  const plugins = readPluginsJson(projectPath);

  plugins[name] = version;
  writePluginsJson(projectPath, plugins);

  if (manifest.hooks?.onInit) {
    await runHook(extensionDir, manifest.hooks.onInit, projectPath);
  }
}

export async function deactivate(
  name: string,
  projectPath: string,
  extensionDir: string,
): Promise<void> {
  const manifest = loadManifest(extensionDir);

  if (manifest.hooks?.onDestroy) {
    await runHook(extensionDir, manifest.hooks.onDestroy, projectPath);
  }

  const plugins = readPluginsJson(projectPath);
  delete plugins[name];
  writePluginsJson(projectPath, plugins);
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
