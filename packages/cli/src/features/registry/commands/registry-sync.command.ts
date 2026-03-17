import * as clack from '@clack/prompts';
import type { RegistryConfig } from '../../../core/types/index.js';
import { syncAll } from '../registry-manager.js';

interface RegistrySyncOptions {
  configs: RegistryConfig[];
}

export async function handleRegistrySync(options: RegistrySyncOptions): Promise<void> {
  const s = clack.spinner();
  s.start('Syncing registries...');

  try {
    await syncAll(options.configs);
    s.stop('Registries synced');
    clack.log.success('All registries synchronized.');
  } catch (err) {
    s.stop('Sync failed');
    const message = err instanceof Error ? err.message : String(err);
    clack.log.error(`Failed to sync registries: ${message}`);
  }
}
