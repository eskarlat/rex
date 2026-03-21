import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { simpleGit } from 'simple-git';
import type { RegistryConfig, RegistryEntry } from '../../core/types/index.js';
import type { PartialEngineConstraints } from '../extensions/types/extension.types.js';
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
  engines?: PartialEngineConstraints;
}

function getRegistriesDir(): string {
  const home = process.env['RENRE_KIT_HOME'] ?? path.join(os.homedir(), '.renre-kit');
  return path.join(home, 'registries');
}

function getExtensionsDir(): string {
  const home = process.env['RENRE_KIT_HOME'] ?? path.join(os.homedir(), '.renre-kit');
  return path.join(home, 'extensions');
}

function getRegistryPath(name: string): string {
  return path.join(getRegistriesDir(), name);
}

export async function sync(registryName: string, config: RegistryConfig): Promise<void> {
  const regDir = getRegistryPath(registryName);

  if (fs.existsSync(regDir)) {
    const git = simpleGit(regDir);
    await git.pull();
  } else {
    fs.mkdirSync(regDir, { recursive: true });
    await simpleGit().clone(config.url, regDir);
  }

  updateTimestamp(regDir);
}

export async function syncAll(configs: RegistryConfig[]): Promise<string[]> {
  const errors: string[] = [];
  for (const config of configs) {
    try {
      await sync(config.name, config);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`${config.name}: ${message}`);
    }
  }
  return errors;
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

export function resolveRegistryIcon(
  extensionName: string,
  configs: RegistryConfig[],
): string | null {
  const sorted = [...configs].sort((a, b) => a.priority - b.priority);

  for (const config of sorted) {
    const regDir = getRegistryPath(config.name);
    const entries = readExtensionsJson(regDir);
    const found = entries.find((e) => e.name === extensionName);
    if (found?.icon) {
      const iconsBase = path.join(regDir, '.renre-kit');
      const iconPath = path.resolve(iconsBase, found.icon);
      if (!iconPath.startsWith(iconsBase + path.sep)) continue;
      if (fs.existsSync(iconPath)) return iconPath;
    }
  }

  return null;
}

export async function ensureSynced(configs: RegistryConfig[]): Promise<void> {
  for (const config of configs) {
    const regDir = getRegistryPath(config.name);
    if (!fs.existsSync(regDir) || checkStale(regDir, config.cacheTTL)) {
      try {
        await sync(config.name, config);
      } catch {
        // Sync may fail (e.g. no network) — continue with stale/missing data
      }
    }
  }
}

export function listAvailable(configs: RegistryConfig[]): RegistryEntry[] {
  const sorted = [...configs].sort((a, b) => a.priority - b.priority);
  const seen = new Set<string>();
  const result: RegistryEntry[] = [];

  for (const config of sorted) {
    const regDir = getRegistryPath(config.name);
    const entries = readExtensionsJson(regDir);
    for (const entry of entries) {
      if (!seen.has(entry.name)) {
        seen.add(entry.name);
        result.push(entry);
      }
    }
  }

  return result;
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
        engines: found.engines,
      };
    }
  }

  return null;
}

export interface SearchOptions {
  query?: string;
  type?: 'standard' | 'mcp';
  tag?: string;
}

export function searchAvailable(
  configs: RegistryConfig[],
  options: SearchOptions,
): RegistryEntry[] {
  const all = listAvailable(configs);
  const queryLower = options.query?.toLowerCase();

  return all.filter((entry) => {
    if (queryLower) {
      const matchesName = entry.name.toLowerCase().includes(queryLower);
      const matchesDesc = entry.description.toLowerCase().includes(queryLower);
      if (!matchesName && !matchesDesc) {
        return false;
      }
    }

    if (options.type && entry.type !== options.type) {
      return false;
    }

    if (options.tag) {
      const tagLower = options.tag.toLowerCase();
      const hasTags = entry.tags?.some((t) => t.toLowerCase() === tagLower);
      if (!hasTags) {
        return false;
      }
    }

    return true;
  });
}

function isLocalPath(source: string): boolean {
  return source.startsWith('./') || source.startsWith('../') || source.startsWith('/');
}

export async function installExtension(
  name: string,
  gitUrl: string,
  version: string,
  registryName?: string,
): Promise<string> {
  const extDir = path.join(getExtensionsDir(), `${name}@${version}`);

  if (isLocalPath(gitUrl)) {
    const basePath = registryName ? getRegistryPath(registryName) : process.cwd();
    const sourcePath = path.resolve(basePath, gitUrl);
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Local extension path not found: ${sourcePath}`);
    }
    fs.cpSync(sourcePath, extDir, { recursive: true });
  } else {
    const git = simpleGit();
    await git.clone(gitUrl, extDir, ['--branch', `v${version}`, '--depth', '1']);
  }

  postInstallDeps(extDir);

  return extDir;
}

/**
 * Run `npm install --omit=dev` as a fallback for extensions that are not fully bundled.
 * Skips if: no package.json, node_modules already exists, no real (non-workspace) dependencies,
 * or dist files appear to be bundled (self-contained).
 */
function postInstallDeps(extDir: string): void {
  const pkgPath = path.join(extDir, 'package.json');
  const nodeModulesPath = path.join(extDir, 'node_modules');

  if (!fs.existsSync(pkgPath) || fs.existsSync(nodeModulesPath)) {
    return;
  }

  const raw = fs.readFileSync(pkgPath, 'utf-8');
  const pkg = JSON.parse(raw) as Record<string, unknown>;
  const deps = (pkg['dependencies'] ?? {}) as Record<string, string>;

  // Filter out workspace:* references — they don't resolve outside a monorepo
  const realDeps = Object.entries(deps).filter(([, v]) => !v.startsWith('workspace:'));

  if (realDeps.length === 0) {
    return;
  }

  // Check if the main dist file is bundled (contains no bare import specifiers).
  // Bundled extensions don't need npm install.
  const mainField = pkg['main'] as string | undefined;
  if (mainField) {
    const mainPath = path.join(extDir, mainField);
    if (fs.existsSync(mainPath)) {
      const content = fs.readFileSync(mainPath, 'utf-8');
      // A bundled ESM file typically has createRequire banner and no bare module imports.
      // If it has the esbuild createRequire banner, it's bundled.
      if (content.includes("createRequire(import.meta.url)")) {
        return;
      }
    }
  }

  // Rewrite workspace:* refs to avoid npm install failures
  rewriteWorkspaceRefs(pkgPath);

  try {
    execSync('npm install --omit=dev --ignore-scripts', {
      cwd: extDir,
      stdio: 'pipe',
      timeout: 60_000,
    });
  } catch {
    // npm install may fail (e.g. no network) — extension may still work if partially bundled
  }
}

/**
 * Rewrite workspace:* references in package.json dependencies to wildcard ranges.
 * These references only work inside a pnpm workspace and break when cloned standalone.
 */
function rewriteWorkspaceRefs(pkgPath: string): void {
  const raw = fs.readFileSync(pkgPath, 'utf-8');
  const pkg = JSON.parse(raw) as Record<string, unknown>;
  let changed = false;

  for (const depType of ['dependencies', 'devDependencies'] as const) {
    const section = pkg[depType] as Record<string, string> | undefined;
    if (!section) continue;

    for (const [name, version] of Object.entries(section)) {
      if (version.startsWith('workspace:')) {
        // Replace with a permissive range — the exact version doesn't matter
        // for bundled extensions since the dep is inlined
        section[name] = '*';
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  }
}
