import * as clack from '@clack/prompts';
import type { RegistryConfig } from '../../../core/types/index.js';
import { resolve, installExtension } from '../../registry/registry-manager.js';
import { install, activate } from '../manager/extension-manager.js';
import { getDb } from '../../../core/database/database.js';

interface ExtAddOptions {
  name: string;
  registryConfigs: RegistryConfig[];
  projectPath: string | null;
}

export async function handleExtAdd(options: ExtAddOptions): Promise<void> {
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
  );

  const db = getDb();
  install(resolved.name, resolved.latestVersion, resolved.registryName, resolved.type, db);

  s.stop(`Installed ${resolved.name}@${resolved.latestVersion}`);

  if (options.projectPath) {
    await activate(resolved.name, resolved.latestVersion, options.projectPath, extPath);
    clack.log.success(`Activated ${resolved.name} in project.`);
  }
}
