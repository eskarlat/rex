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
    const missingKeys = await activate(
      options.name,
      options.version,
      options.projectPath,
      options.extensionDir,
    );
    clack.log.success(`Activated ${options.name}@${options.version} in project.`);
    if (missingKeys.length > 0) {
      const keyList = missingKeys.map((k) => `  - ${k}`).join('\n');
      clack.log.warn(
        `Missing vault keys for ${options.name}:\n${keyList}\nRun "renre-kit ext:config ${options.name}" to configure.`,
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    clack.log.error(`Failed to activate ${options.name}: ${message}`);
  }
}
