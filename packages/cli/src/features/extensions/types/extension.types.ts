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

export interface WidgetSize {
  w: number;
  h: number;
}

export interface UiWidget {
  id: string;
  title: string;
  entry: string;
  defaultSize: WidgetSize;
  minSize?: WidgetSize;
  maxSize?: WidgetSize;
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
  skills?: SkillRef[];
  prompts?: string[];
  agents?: string[];
  workflows?: string[];
  context?: string[];
  hooks?: string[];
}

export interface EngineConstraints {
  'renre-kit': string;
  'extension-sdk': string;
}

export type PartialEngineConstraints = Partial<EngineConstraints>;

export interface ExtensionManifest {
  name: string;
  title?: string;
  version: string;
  description: string;
  icon?: string;
  iconColor?: string;
  type: ExtensionType;
  commands: Record<string, ExtensionCommand>;
  mcp?: McpConfig;
  main?: string;
  config?: {
    schema: Record<string, ConfigSchemaField>;
  };
  ui?: {
    panels: UiPanel[];
    widgets: UiWidget[];
  };
  engines: EngineConstraints;
  agent?: AgentAssets;
}
