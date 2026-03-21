import * as clack from '@clack/prompts';

import type { RegistryConfig } from '../../../core/types/index.js';
import { resolve, installExtension, ensureSynced } from '../../registry/registry-manager.js';
import { install, activate } from '../manager/extension-manager.js';
import { getDb } from '../../../core/database/database.js';
import { loadManifest } from '../manifest/manifest-loader.js';
import { checkEngineCompat } from '../engine/engine-compat.js';
import { CLI_VERSION, SDK_VERSION } from '../../../core/version.js';

interface ExtAddOptions {
  name: string;
  registryConfigs: RegistryConfig[];
  projectPath: string | null;
}

export async function handleExtAdd(options: ExtAddOptions): Promise<void> {
  await ensureSynced(options.registryConfigs);
  const resolved = resolve(options.name, options.registryConfigs);
  if (!resolved) {
    clack.log.error(`Extension "${options.name}" not found in any registry.`);
    return;
  }

  const s = clack.spinner();
  s.start(`Installing ${resolved.name}@${resolved.latestVersion}...`);

  const extPath = await installExtension(
    resolved.name,
    resolved.gitUrl,
    resolved.latestVersion,
    resolved.registryName,
  );

  const db = getDb();
  install(resolved.name, resolved.latestVersion, resolved.registryName, resolved.type, db);

  s.stop(`Installed ${resolved.name}@${resolved.latestVersion}`);

  const manifest = loadManifest(extPath);
  const compat = checkEngineCompat(manifest, CLI_VERSION, SDK_VERSION);
  if (!compat.compatible) {
    for (const issue of compat.issues) {
      clack.log.error(issue);
    }
    return;
  }

  if (options.projectPath) {
    await activate(resolved.name, resolved.latestVersion, options.projectPath, extPath);
    clack.log.success(`Activated ${resolved.name} in project.`);
  }
}
