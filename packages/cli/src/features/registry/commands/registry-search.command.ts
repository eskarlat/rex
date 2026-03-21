import * as clack from '@clack/prompts';

import type { RegistryConfig } from '../../../core/types/index.js';
import { searchAvailable, type SearchOptions } from '../registry-manager.js';

interface RegistrySearchOptions {
  query?: string;
  type?: 'standard' | 'mcp';
  tag?: string;
  configs: RegistryConfig[];
}

export function handleRegistrySearch(options: RegistrySearchOptions): void {
  const searchOpts: SearchOptions = {
    query: options.query,
    type: options.type,
    tag: options.tag,
  };

  const results = searchAvailable(options.configs, searchOpts);

  if (results.length === 0) {
    clack.log.info('No extensions found matching your criteria.');
    return;
  }

  const lines = results.map((ext) => {
    const tags = ext.tags?.length ? ` [${ext.tags.join(', ')}]` : '';
    return `  ${ext.name} (${ext.type}) v${ext.latestVersion}\n    ${ext.description}${tags}`;
  });

  clack.log.info(`Found ${results.length} extension(s):\n${lines.join('\n')}`);
}
