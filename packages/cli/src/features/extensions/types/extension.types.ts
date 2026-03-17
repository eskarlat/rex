export type ExtensionType = 'standard' | 'mcp';

export interface ExtensionCommand {
  handler: string;
  description?: string;
}

export interface UiPanel {
  id: string;
  title: string;
  entry: string;
}

export interface HookConfig {
  onInit?: string;
  onDestroy?: string;
}

export interface McpConfig {
  transport: 'stdio' | 'sse';
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  headers?: Record<string, string>;
}

export interface ConfigSchemaField {
  type: 'string' | 'number' | 'boolean';
  description: string;
  secret: boolean;
  vaultHint?: string;
  default?: string | number | boolean;
}

export interface SkillRef {
  name: string;
  path: string;
}

export interface AgentAssets {
  skills?: string | SkillRef[];
  prompts?: string[];
  agents?: string[];
  workflows?: string[];
  context?: string[];
}

export interface ExtensionManifest {
  name: string;
  version: string;
  description: string;
  icon?: string;
  iconColor?: string;
  type: ExtensionType;
  commands: Record<string, ExtensionCommand>;
  mcp?: McpConfig;
  config?: {
    schema: Record<string, ConfigSchemaField>;
  };
  hooks?: HookConfig;
  /** @deprecated Use agent.skills instead */
  skills?: string | SkillRef[];
  ui?: {
    panels: UiPanel[];
  };
  agent?: string | AgentAssets;
}
