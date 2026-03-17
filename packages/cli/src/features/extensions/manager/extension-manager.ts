import fs from 'node:fs';
import path from 'node:path';
import type Database from 'better-sqlite3';
import type { PluginsJson } from '../../../core/types/index.js';
import { loadManifest } from '../manifest/manifest-loader.js';
import type { EventBus } from '../../../core/event-bus/event-bus.js';
import { getExtensionConfigMappings } from '../../config/config-manager.js';
import { hasEntry } from '../../vault/vault-manager.js';
import type { AgentAssets, ExtensionManifest, SkillRef } from '../types/extension.types.js';
import {
  AGENT_DIR,
  SKILLS_DIR,
} from '../../../core/paths/paths.js';

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

const AGENT_ASSET_TYPES = ['prompts', 'agents', 'workflows', 'context'] as const;

function copyFileIfExists(src: string, dest: string): void {
  if (!fs.existsSync(src)) {
    return;
  }
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

function resolveSkills(manifest: ExtensionManifest): string | SkillRef[] | undefined {
  // Prefer agent.skills (unified), fall back to top-level skills (deprecated)
  if (manifest.agent && typeof manifest.agent !== 'string' && manifest.agent.skills) {
    return manifest.agent.skills;
  }
  return manifest.skills;
}

function deploySkillsFromRef(
  skills: string | SkillRef[],
  extensionName: string,
  extensionDir: string,
  projectPath: string,
): void {
  const extensionSkillsDir = path.join(
    projectPath,
    AGENT_DIR,
    SKILLS_DIR,
    extensionName,
  );

  if (typeof skills === 'string') {
    // Single SKILL.md (backward compat)
    const src = path.join(extensionDir, skills);
    const dest = path.join(extensionSkillsDir, 'SKILL.md');
    copyFileIfExists(src, dest);
  } else {
    // Array of SkillRef
    for (const skill of skills as SkillRef[]) {
      const src = path.join(extensionDir, skill.path);
      const dest = path.join(extensionSkillsDir, skill.name, 'SKILL.md');
      copyFileIfExists(src, dest);
    }
  }
}

function deploySkills(
  manifest: ExtensionManifest,
  extensionDir: string,
  projectPath: string,
): void {
  const skills = resolveSkills(manifest);
  if (!skills) {
    return;
  }
  deploySkillsFromRef(skills, manifest.name, extensionDir, projectPath);
}

function deployAgentAssets(
  manifest: ExtensionManifest,
  extensionDir: string,
  projectPath: string,
): void {
  if (!manifest.agent || typeof manifest.agent === 'string') {
    return;
  }

  const assets = manifest.agent as AgentAssets;

  for (const assetType of AGENT_ASSET_TYPES) {
    const files = assets[assetType];
    if (!files) {
      continue;
    }
    for (const filePath of files) {
      const src = path.join(extensionDir, filePath);
      const fileName = path.basename(filePath);
      const dest = path.join(
        projectPath,
        AGENT_DIR,
        assetType,
        manifest.name,
        fileName,
      );
      copyFileIfExists(src, dest);
    }
  }
}

function cleanupDeployedAssets(
  name: string,
  projectPath: string,
): void {
  // Remove skills
  const skillsDir = path.join(projectPath, AGENT_DIR, SKILLS_DIR, name);
  if (fs.existsSync(skillsDir)) {
    fs.rmSync(skillsDir, { recursive: true, force: true });
  }

  // Remove agent assets
  for (const assetType of AGENT_ASSET_TYPES) {
    const assetDir = path.join(projectPath, AGENT_DIR, assetType, name);
    if (fs.existsSync(assetDir)) {
      fs.rmSync(assetDir, { recursive: true, force: true });
    }
  }
}

export async function activate(
  name: string,
  version: string,
  projectPath: string,
  extensionDir: string,
  bus?: EventBus,
): Promise<string[]> {
  const manifest = loadManifest(extensionDir);
  const plugins = readPluginsJson(projectPath);

  plugins[name] = version;
  writePluginsJson(projectPath, plugins);

  const missingKeys = validateVaultKeys(name);

  // Layer 1: Auto-deploy skills and agent assets
  deploySkills(manifest, extensionDir, projectPath);
  deployAgentAssets(manifest, extensionDir, projectPath);

  if (manifest.hooks?.onInit) {
    await runHook(extensionDir, manifest.hooks.onInit, projectPath);
  }

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

  if (manifest.hooks?.onDestroy) {
    await runHook(extensionDir, manifest.hooks.onDestroy, projectPath);
  }

  // Clean up deployed skills and agent assets
  cleanupDeployedAssets(name, projectPath);

  const plugins = readPluginsJson(projectPath);
  delete plugins[name];
  writePluginsJson(projectPath, plugins);

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
