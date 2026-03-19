import * as clack from '@clack/prompts';
import semver from 'semver';
import type Database from 'better-sqlite3';
import type { RegistryConfig } from '../../../core/types/index.js';
import { listInstalled, install, activate, getActivated } from '../manager/extension-manager.js';
import { resolve, installExtension, ensureSynced } from '../../registry/registry-manager.js';
import type { ResolvedExtension } from '../../registry/registry-manager.js';
import { checkEngineConstraints } from '../engine/engine-compat.js';
import { CLI_VERSION, SDK_VERSION } from '../../../core/version.js';
import { refreshUpdateCache } from '../update-cache/update-cache.js';

interface ExtUpdateOptions {
  name?: string;
  all: boolean;
  force?: boolean;
  registryConfigs: RegistryConfig[];
  projectPath: string;
  db: Database.Database;
}

function checkEngineGate(resolved: ResolvedExtension, force?: boolean): boolean {
  const compat = checkEngineConstraints(resolved.engines, CLI_VERSION, SDK_VERSION);
  if (compat.compatible) return true;

  if (!force) {
    clack.log.error(`Extension "${resolved.name}" ${resolved.latestVersion} is incompatible with current engine:`);
    for (const issue of compat.issues) {
      clack.log.error(`  - ${issue}`);
    }
    clack.log.error('Use --force to update anyway.');
    return false;
  }

  clack.log.warn(`Forcing update of "${resolved.name}" despite engine incompatibility.`);
  return true;
}

function isNewerVersion(latestVersion: string, currentVersion: string): boolean {
  return !!semver.valid(latestVersion) && !!semver.valid(currentVersion) && semver.gt(latestVersion, currentVersion);
}

async function updateSingle(
  name: string,
  registryConfigs: RegistryConfig[],
  projectPath: string,
  db: Database.Database,
  force?: boolean,
): Promise<boolean> {
  const installed = listInstalled(db);
  const ext = installed.find((e) => e.name === name);

  if (!ext) {
    clack.log.error(`Extension "${name}" is not installed.`);
    return false;
  }

  const resolved = resolve(name, registryConfigs);
  if (!resolved) {
    clack.log.error(`Extension "${name}" not found in any registry.`);
    return false;
  }

  if (!isNewerVersion(resolved.latestVersion, ext.version)) {
    clack.log.info(`${name}@${ext.version} is already up to date.`);
    return false;
  }

  if (!checkEngineGate(resolved, force)) return false;

  const s = clack.spinner();
  s.start(`Updating ${name} ${ext.version} → ${resolved.latestVersion}...`);

  const extPath = await installExtension(name, resolved.gitUrl, resolved.latestVersion, resolved.registryName);
  install(name, resolved.latestVersion, resolved.registryName, resolved.type, db);

  // Re-activate if the extension was active in this project
  const plugins = getActivated(projectPath);
  if (plugins[name]) {
    await activate(name, resolved.latestVersion, projectPath, extPath);
  }

  s.stop(`Updated ${name} to ${resolved.latestVersion}`);
  clack.log.success(`${name}: ${ext.version} → ${resolved.latestVersion}`);
  return true;
}

export async function handleExtUpdate(options: ExtUpdateOptions): Promise<void> {
  await ensureSynced(options.registryConfigs);

  if (options.all) {
    await updateAll(options);
  } else if (!options.name) {
    clack.log.error('Please specify an extension name or use --all.');
    return;
  } else {
    await updateSingle(
      options.name,
      options.registryConfigs,
      options.projectPath,
      options.db,
      options.force,
    );
  }

  // Always refresh so checkedAt and availability stay accurate after sync
  refreshUpdateCache(options.db, options.registryConfigs);
}

async function updateAll(options: ExtUpdateOptions): Promise<number> {
  const installed = listInstalled(options.db);
  let updated = 0;

  for (const ext of installed) {
    const resolved = resolve(ext.name, options.registryConfigs);
    if (resolved && isNewerVersion(resolved.latestVersion, ext.version)) {
      const success = await updateSingle(
        ext.name,
        options.registryConfigs,
        options.projectPath,
        options.db,
        options.force,
      );
      if (success) updated++;
    }
  }

  if (updated === 0) clack.log.info('All extensions are up to date.');
  return updated;
}
