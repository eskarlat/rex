import * as clack from '@clack/prompts';

import { setEntry } from '../vault-manager.js';

interface VaultSetOptions {
  key: string;
  value?: string;
  secret: boolean;
  tags: string[];
}

function isCancel(value: unknown): value is symbol {
  return typeof value === 'symbol';
}

export async function handleVaultSet(options: VaultSetOptions): Promise<void> {
  let { value } = options;

  if (value === undefined) {
    const prompted = options.secret
      ? await clack.password({ message: `Enter secret value for "${options.key}":` })
      : await clack.text({ message: `Enter value for "${options.key}":` });

    if (isCancel(prompted)) {
      clack.log.info('Cancelled.');
      return;
    }
    value = prompted;
  }

  setEntry(options.key, value, options.secret, options.tags);
  clack.log.success(`Vault entry "${options.key}" saved${options.secret ? ' (encrypted)' : ''}.`);
}
