import * as clack from '@clack/prompts';

import { loadGlobalConfig, saveGlobalConfig } from '../../config/config-manager.js';

interface RegistryRemoveOptions {
  name: string;
}

export function handleRegistryRemove(options: RegistryRemoveOptions): void {
  const config = loadGlobalConfig();
  const idx = config.registries.findIndex((r) => r.name === options.name);

  if (idx === -1) {
    clack.log.warn(`Registry '${options.name}' not found.`);
    return;
  }

  config.registries.splice(idx, 1);
  saveGlobalConfig(config);

  clack.log.success(`Registry '${options.name}' removed.`);
}
