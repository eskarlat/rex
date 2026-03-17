export interface GlobalConfig {
  registries: RegistryConfig[];
  settings: Record<string, unknown>;
  extensionConfigs: Record<string, Record<string, ConfigMapping>>;
}

export interface RegistryConfig {
  name: string;
  url: string;
  priority: number;
  cacheTTL: number;
}

export interface RegistryEntry {
  name: string;
  description: string;
  gitUrl: string;
  latestVersion: string;
  type: 'standard' | 'mcp';
  icon: string;
  author: string;
}

export interface ConfigMapping {
  source: 'vault' | 'direct';
  value: string;
}

export interface ConfigSchemaField {
  type: 'string' | 'number' | 'boolean';
  description: string;
  secret: boolean;
  vaultHint?: string;
  default?: string | number | boolean;
}
