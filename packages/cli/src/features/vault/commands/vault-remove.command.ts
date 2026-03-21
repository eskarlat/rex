import * as clack from '@clack/prompts';

import { removeEntry } from '../vault-manager.js';
import { getReferencingExtensions } from '../../config/config-manager.js';

interface VaultRemoveOptions {
  key: string;
}

export function handleVaultRemove(options: VaultRemoveOptions): void {
  const refs = getReferencingExtensions(options.key);
  if (refs.length > 0) {
    clack.log.warn(
      `Vault entry "${options.key}" is referenced by: ${refs.join(', ')}. Removing anyway.`,
    );
  }

  const removed = removeEntry(options.key);
  if (removed) {
    clack.log.success(`Removed vault entry "${options.key}".`);
  } else {
    clack.log.error(`Vault entry "${options.key}" not found.`);
  }
}
