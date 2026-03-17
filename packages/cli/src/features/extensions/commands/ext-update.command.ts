import * as clack from '@clack/prompts';
import type Database from 'better-sqlite3';
import type { RegistryConfig } from '../../../core/types/index.js';
import { listInstalled, install, activate, getActivated } from '../manager/extension-manager.js';
import { resolve, installExtension } from '../../registry/registry-manager.js';

interface ExtUpdateOptions {
  name?: string;
  all: boolean;
  registryConfigs: RegistryConfig[];
  projectPath: string;
  db: Database.Database;
}

async function updateSingle(
  name: string,
  registryConfigs: RegistryConfig[],
  projectPath: string,
  db: Database.Database,
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

  if (resolved.latestVersion === ext.version) {
    clack.log.info(`${name}@${ext.version} is already up to date.`);
    return false;
  }

  const s = clack.spinner();
  s.start(`Updating ${name} ${ext.version} → ${resolved.latestVersion}...`);

  const extPath = await installExtension(name, resolved.gitUrl, resolved.latestVersion);
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
  if (options.all) {
    const installed = listInstalled(options.db);
    let updated = 0;

    for (const ext of installed) {
      const resolved = resolve(ext.name, options.registryConfigs);
      if (resolved && resolved.latestVersion !== ext.version) {
        const success = await updateSingle(
          ext.name,
          options.registryConfigs,
          options.projectPath,
          options.db,
        );
        if (success) {
          updated++;
        }
      }
    }

    if (updated === 0) {
      clack.log.info('All extensions are up to date.');
    }
    return;
  }

  if (!options.name) {
    clack.log.error('Please specify an extension name or use --all.');
    return;
  }

  await updateSingle(options.name, options.registryConfigs, options.projectPath, options.db);
}
