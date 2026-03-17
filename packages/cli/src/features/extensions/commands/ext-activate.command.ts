import * as clack from '@clack/prompts';
import { activate } from '../manager/extension-manager.js';

interface ExtActivateOptions {
  name: string;
  version: string;
  projectPath: string;
  extensionDir: string;
}

export async function handleExtActivate(options: ExtActivateOptions): Promise<void> {
  try {
    await activate(options.name, options.version, options.projectPath, options.extensionDir);
    clack.log.success(`Activated ${options.name}@${options.version} in project.`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    clack.log.error(`Failed to activate ${options.name}: ${message}`);
  }
}
