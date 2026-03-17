import path from 'node:path';
import os from 'node:os';

// Global paths
export const GLOBAL_DIR = path.join(os.homedir(), '.renre-kit');
export const DB_PATH = path.join(GLOBAL_DIR, 'db.sqlite');
export const EXTENSIONS_DIR = path.join(GLOBAL_DIR, 'extensions');
export const REGISTRIES_DIR = path.join(GLOBAL_DIR, 'registries');
export const VAULT_PATH = path.join(GLOBAL_DIR, 'vault.json');
export const CONFIG_PATH = path.join(GLOBAL_DIR, 'config.json');
export const LOGS_DIR = path.join(GLOBAL_DIR, 'logs');

// Per-project constants
export const PROJECT_DIR = '.renre-kit';
export const PLUGINS_JSON = 'plugins.json';
export const MANIFEST_JSON = 'manifest.json';
export const STORAGE_DIR = 'storage';

// Agent constants
export const AGENT_DIR = '.agent';
export const SKILLS_DIR = 'skills';
export const PROMPTS_DIR = 'prompts';
export const AGENTS_DIR = 'agents';
export const WORKFLOWS_DIR = 'workflows';
export const CONTEXT_DIR = 'context';

// Helper functions
export function getProjectDir(projectPath: string): string {
  return path.join(projectPath, PROJECT_DIR);
}

export function getPluginsPath(projectPath: string): string {
  return path.join(projectPath, PROJECT_DIR, PLUGINS_JSON);
}

export function getManifestPath(projectPath: string): string {
  return path.join(projectPath, PROJECT_DIR, MANIFEST_JSON);
}

export function getExtensionDir(name: string, version: string): string {
  return path.join(EXTENSIONS_DIR, name, version);
}

export function getSkillsDir(
  projectPath: string,
  extensionName: string,
): string {
  return path.join(projectPath, AGENT_DIR, SKILLS_DIR, extensionName);
}

export function getAgentDir(
  projectPath: string,
  type: string,
  extensionName: string,
): string {
  return path.join(projectPath, AGENT_DIR, type, extensionName);
}
