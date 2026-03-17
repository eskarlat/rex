import * as clack from '@clack/prompts';
import { listEntries } from '../vault-manager.js';

export function handleVaultList(): void {
  const entries = listEntries();

  if (entries.length === 0) {
    clack.log.info('No vault entries found.');
    return;
  }

  for (const entry of entries) {
    const tags = entry.tags.length > 0 ? ` [${entry.tags.join(', ')}]` : '';
    const secretLabel = entry.secret ? ' (secret)' : '';
    clack.log.info(`${entry.key}: ${entry.value}${secretLabel}${tags}`);
  }
}
