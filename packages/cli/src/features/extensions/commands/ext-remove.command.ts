import * as clack from '@clack/prompts';
import { remove, deactivate } from '../manager/extension-manager.js';
import { getDb } from '../../../core/database/database.js';
import { getExtensionDir } from '../../../core/paths/paths.js';

interface ExtRemoveOptions {
  name: string;
  version: string;
  projectPath: string | null;
}

export async function handleExtRemove(options: ExtRemoveOptions): Promise<void> {
  if (options.projectPath) {
    const extDir = getExtensionDir(options.name, options.version);
    try {
      await deactivate(options.name, options.projectPath, extDir);
      clack.log.info(`Deactivated ${options.name} from project.`);
    } catch {
      clack.log.warn(`Could not deactivate ${options.name} — continuing removal.`);
    }
  }

  const db = getDb();
  remove(options.name, options.version, db);
  clack.log.success(`Removed ${options.name}@${options.version}.`);
}
