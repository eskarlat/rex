import * as clack from '@clack/prompts';
import type { RegistryConfig } from '../../../core/types/index.js';
import { syncAll } from '../registry-manager.js';

interface RegistrySyncOptions {
  configs: RegistryConfig[];
}

export async function handleRegistrySync(options: RegistrySyncOptions): Promise<void> {
  const s = clack.spinner();
  s.start('Syncing registries...');

  const errors = await syncAll(options.configs);
  if (errors.length === 0) {
    s.stop('Registries synced');
    clack.log.success('All registries synchronized.');
  } else {
    s.stop('Sync completed with errors');
    for (const error of errors) {
      clack.log.warn(`Failed to sync: ${error}`);
    }
  }
}
