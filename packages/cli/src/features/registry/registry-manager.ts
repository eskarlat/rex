import fs from 'node:fs';
import path from 'node:path';
import { simpleGit } from 'simple-git';
import type { RegistryConfig, RegistryEntry } from '../../core/types/index.js';
import { isStale as checkStale, updateTimestamp, getLastFetched } from './registry-cache.js';

export interface RegistryStatus {
  name: string;
  url: string;
  priority: number;
  lastFetched: Date | null;
  isStale: boolean;
}

export interface ResolvedExtension {
  name: string;
  gitUrl: string;
  latestVersion: string;
  type: string;
  registryName: string;
}

function getRegistriesDir(): string {
  const home = process.env['RENRE_KIT_HOME'] ?? path.join(process.env['HOME'] ?? '', '.renre-kit');
  return path.join(home, 'registries');
}

function getExtensionsDir(): string {
  const home = process.env['RENRE_KIT_HOME'] ?? path.join(process.env['HOME'] ?? '', '.renre-kit');
  return path.join(home, 'extensions');
}

function getRegistryPath(name: string): string {
  return path.join(getRegistriesDir(), name);
}

export async function sync(
  registryName: string,
  config: RegistryConfig,
): Promise<void> {
  const regDir = getRegistryPath(registryName);
  const git = simpleGit();

  if (fs.existsSync(regDir)) {
    await git.pull();
  } else {
    fs.mkdirSync(regDir, { recursive: true });
    await git.clone(config.url, regDir);
  }

  updateTimestamp(regDir);
}

export async function syncAll(configs: RegistryConfig[]): Promise<void> {
  for (const config of configs) {
    await sync(config.name, config);
  }
}

export function list(configs: RegistryConfig[]): RegistryStatus[] {
  return configs.map((config) => {
    const regDir = getRegistryPath(config.name);
    return {
      name: config.name,
      url: config.url,
      priority: config.priority,
      lastFetched: getLastFetched(regDir),
      isStale: checkStale(regDir, config.cacheTTL),
    };
  });
}

function readExtensionsJson(regDir: string): RegistryEntry[] {
  const filePath = path.join(regDir, '.renre-kit', 'extensions.json');
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw) as { extensions: RegistryEntry[] };
  return data.extensions;
}

export function resolve(
  extensionName: string,
  configs: RegistryConfig[],
): ResolvedExtension | null {
  const sorted = [...configs].sort((a, b) => a.priority - b.priority);

  for (const config of sorted) {
    const regDir = getRegistryPath(config.name);
    const entries = readExtensionsJson(regDir);
    const found = entries.find((e) => e.name === extensionName);
    if (found) {
      return {
        name: found.name,
        gitUrl: found.gitUrl,
        latestVersion: found.latestVersion,
        type: found.type,
        registryName: config.name,
      };
    }
  }

  return null;
}

export async function installExtension(
  name: string,
  gitUrl: string,
  version: string,
): Promise<string> {
  const extDir = path.join(getExtensionsDir(), `${name}@${version}`);
  const git = simpleGit();
  await git.clone(gitUrl, extDir, ['--branch', `v${version}`, '--depth', '1']);
  return extDir;
}
