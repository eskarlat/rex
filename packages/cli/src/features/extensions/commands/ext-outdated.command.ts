import * as clack from '@clack/prompts';
import semver from 'semver';
import type Database from 'better-sqlite3';
import type { RegistryConfig } from '../../../core/types/index.js';
import type { InstalledExtension } from '../manager/extension-manager.js';
import { listInstalled } from '../manager/extension-manager.js';
import { resolve } from '../../registry/registry-manager.js';
import { checkEngineConstraints } from '../engine/engine-compat.js';
import { CLI_VERSION, SDK_VERSION } from '../../../core/version.js';

interface OutdatedEntry {
  name: string;
  current: string;
  latest: string;
  engineCompatible: boolean;
  engineIssues: string[];
}

interface ExtOutdatedOptions {
  registryConfigs: RegistryConfig[];
  db: Database.Database;
}

function checkExtension(
  ext: InstalledExtension,
  registryConfigs: RegistryConfig[],
): OutdatedEntry | null {
  if (!semver.valid(ext.version)) return null;

  const resolved = resolve(ext.name, registryConfigs);
  if (!resolved || !semver.valid(resolved.latestVersion)) return null;
  if (!semver.gt(resolved.latestVersion, ext.version)) return null;

  const compat = checkEngineConstraints(resolved.engines, CLI_VERSION, SDK_VERSION);
  return {
    name: ext.name,
    current: ext.version,
    latest: resolved.latestVersion,
    engineCompatible: compat.compatible,
    engineIssues: compat.issues,
  };
}

function displayOutdated(outdated: OutdatedEntry[]): void {
  for (const ext of outdated) {
    const tag = ext.engineCompatible ? '' : ' [incompatible engine]';
    clack.log.warn(`${ext.name}: ${ext.current} → ${ext.latest}${tag}`);
    for (const issue of ext.engineIssues) {
      clack.log.warn(`  - ${issue}`);
    }
  }
}

export function handleExtOutdated(options: ExtOutdatedOptions): void {
  const installed = listInstalled(options.db);

  if (installed.length === 0) {
    clack.log.info('No extensions installed.');
    return;
  }

  const outdated = installed
    .map((ext) => checkExtension(ext, options.registryConfigs))
    .filter((entry): entry is OutdatedEntry => entry !== null);

  if (outdated.length === 0) {
    clack.log.info('All extensions are up to date.');
    return;
  }

  displayOutdated(outdated);
}
