import fs from 'node:fs';
import path from 'node:path';
import semver from 'semver';
import type Database from 'better-sqlite3';
import type { RegistryConfig } from '../../../core/types/index.js';
import type { UpdateCache, UpdateInfo } from '../types/update-cache.types.js';
import { listInstalled } from '../manager/extension-manager.js';
import { resolve } from '../../registry/registry-manager.js';
import { checkEngineConstraints } from '../engine/engine-compat.js';
import { CLI_VERSION, SDK_VERSION } from '../../../core/version.js';

function getCachePath(): string {
  const home = process.env['RENRE_KIT_HOME'] ?? path.join(process.env['HOME'] ?? '', '.renre-kit');
  return path.join(home, 'update-cache.json');
}

export function computeUpdates(
  db: Database.Database,
  registryConfigs: RegistryConfig[],
): UpdateInfo[] {
  const installed = listInstalled(db);
  const updates: UpdateInfo[] = [];

  for (const ext of installed) {
    if (!semver.valid(ext.version)) continue;

    const resolved = resolve(ext.name, registryConfigs);
    if (!resolved) continue;
    if (!semver.valid(resolved.latestVersion)) continue;
    if (!semver.gt(resolved.latestVersion, ext.version)) continue;

    const compat = checkEngineConstraints(resolved.engines, CLI_VERSION, SDK_VERSION);

    updates.push({
      name: ext.name,
      installedVersion: ext.version,
      availableVersion: resolved.latestVersion,
      engineCompatible: compat.compatible,
      engineIssues: compat.issues,
      registryName: resolved.registryName,
    });
  }

  return updates;
}

export function writeUpdateCache(updates: UpdateInfo[]): void {
  const cache: UpdateCache = {
    checkedAt: new Date().toISOString(),
    updates,
  };
  const dir = path.dirname(getCachePath());
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(getCachePath(), JSON.stringify(cache, null, 2));
}

export function readUpdateCache(): UpdateCache | null {
  const cachePath = getCachePath();
  if (!fs.existsSync(cachePath)) return null;

  try {
    const raw = fs.readFileSync(cachePath, 'utf-8');
    return JSON.parse(raw) as UpdateCache;
  } catch {
    return null;
  }
}

export function refreshUpdateCache(
  db: Database.Database,
  registryConfigs: RegistryConfig[],
): void {
  const updates = computeUpdates(db, registryConfigs);
  writeUpdateCache(updates);
}

export function getUpdateForExtension(name: string): UpdateInfo | null {
  const cache = readUpdateCache();
  if (!cache) return null;
  return cache.updates.find((u) => u.name === name) ?? null;
}
