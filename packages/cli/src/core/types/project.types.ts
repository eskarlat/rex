export interface ProjectRecord {
  id: number;
  name: string;
  path: string;
  created_at: string;
  last_accessed_at: string;
}

export interface ProjectManifest {
  name: string;
  version: string;
  created_at: string;
  extensionConfigs?: Record<string, Record<string, import('./config.types.js').ConfigMapping>>;
}

export type PluginsJson = Record<string, string>;
