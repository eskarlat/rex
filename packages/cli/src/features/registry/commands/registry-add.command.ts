import * as clack from '@clack/prompts';
import { loadGlobalConfig, saveGlobalConfig } from '../../config/config-manager.js';
import type { RegistryConfig } from '../../../core/types/index.js';

const DEFAULT_PRIORITY = 100;
const DEFAULT_CACHE_TTL = 3600;

interface RegistryAddOptions {
  name: string;
  url: string;
  priority?: number;
  cacheTTL?: number;
}

export function handleRegistryAdd(options: RegistryAddOptions): void {
  const config = loadGlobalConfig();
  const existing = config.registries.find((r) => r.name === options.name);

  if (existing) {
    clack.log.warn(`Registry '${options.name}' already exists.`);
    return;
  }

  const entry: RegistryConfig = {
    name: options.name,
    url: options.url,
    priority: options.priority ?? DEFAULT_PRIORITY,
    cacheTTL: options.cacheTTL ?? DEFAULT_CACHE_TTL,
  };

  config.registries.push(entry);
  saveGlobalConfig(config);

  clack.log.success(`Registry '${options.name}' added.`);
}
