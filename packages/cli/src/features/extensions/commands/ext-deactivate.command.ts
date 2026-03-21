import * as clack from '@clack/prompts';

import { deactivate } from '../manager/extension-manager.js';

interface ExtDeactivateOptions {
  name: string;
  projectPath: string;
  extensionDir: string;
}

export async function handleExtDeactivate(options: ExtDeactivateOptions): Promise<void> {
  try {
    await deactivate(options.name, options.projectPath, options.extensionDir);
    clack.log.success(`Deactivated ${options.name} from project.`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    clack.log.error(`Failed to deactivate ${options.name}: ${message}`);
  }
}
