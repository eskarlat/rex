import * as clack from '@clack/prompts';
import type { RegistryConfig } from '../../../core/types/index.js';
import { list } from '../registry-manager.js';

interface RegistryListOptions {
  configs: RegistryConfig[];
}

export function handleRegistryList(options: RegistryListOptions): void {
  const registries = list(options.configs);

  if (registries.length === 0) {
    clack.log.info('No registries configured.');
    return;
  }

  const lines = registries.map((reg) => {
    const staleMark = reg.isStale ? ' (stale)' : '';
    const fetched = reg.lastFetched ? reg.lastFetched.toISOString() : 'never';
    return `  ${reg.name} [priority: ${reg.priority}] ${reg.url}\n    Last fetched: ${fetched}${staleMark}`;
  });

  clack.log.info(`Registries:\n${lines.join('\n')}`);
}
