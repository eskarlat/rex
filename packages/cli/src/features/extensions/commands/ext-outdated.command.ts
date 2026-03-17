import * as clack from '@clack/prompts';
import type Database from 'better-sqlite3';
import type { RegistryConfig } from '../../../core/types/index.js';
import { listInstalled } from '../manager/extension-manager.js';
import { resolve } from '../../registry/registry-manager.js';

interface ExtOutdatedOptions {
  registryConfigs: RegistryConfig[];
  db: Database.Database;
}

export function handleExtOutdated(options: ExtOutdatedOptions): void {
  const installed = listInstalled(options.db);

  if (installed.length === 0) {
    clack.log.info('No extensions installed.');
    return;
  }

  const outdated: Array<{ name: string; current: string; latest: string }> = [];

  for (const ext of installed) {
    const resolved = resolve(ext.name, options.registryConfigs);
    if (resolved && resolved.latestVersion !== ext.version) {
      outdated.push({
        name: ext.name,
        current: ext.version,
        latest: resolved.latestVersion,
      });
    }
  }

  if (outdated.length === 0) {
    clack.log.info('All extensions are up to date.');
    return;
  }

  for (const ext of outdated) {
    clack.log.warn(`${ext.name}: ${ext.current} → ${ext.latest}`);
  }
}
