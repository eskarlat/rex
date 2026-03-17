import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import type { ExtensionManifest } from '../types/extension.types.js';
import {
  ExtensionError,
  ErrorCode,
} from '../../../core/errors/extension-error.js';

const extensionCommandSchema = z.object({
  handler: z.string(),
  description: z.string().optional(),
});

const uiPanelSchema = z.object({
  id: z.string(),
  title: z.string(),
  entry: z.string(),
});

const hookConfigSchema = z.object({
  onInit: z.string().optional(),
  onDestroy: z.string().optional(),
});

const mcpConfigSchema = z.object({
  transport: z.enum(['stdio', 'sse']),
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
  env: z.record(z.string()).optional(),
  url: z.string().optional(),
  headers: z.record(z.string()).optional(),
});

const configSchemaFieldSchema = z.object({
  type: z.enum(['string', 'number', 'boolean']),
  description: z.string(),
  secret: z.boolean(),
  vaultHint: z.string().optional(),
  default: z.union([z.string(), z.number(), z.boolean()]).optional(),
});

const skillRefSchema = z.object({
  name: z.string(),
  path: z.string(),
});

const agentAssetsSchema = z.object({
  skills: z.union([z.string(), z.array(skillRefSchema)]).optional(),
  prompts: z.array(z.string()).optional(),
  agents: z.array(z.string()).optional(),
  workflows: z.array(z.string()).optional(),
  context: z.array(z.string()).optional(),
});

const extensionManifestSchema = z
  .object({
    name: z.string(),
    version: z.string(),
    description: z.string(),
    icon: z.string().optional(),
    iconColor: z.string().optional(),
    type: z.enum(['standard', 'mcp']),
    commands: z.record(extensionCommandSchema),
    mcp: mcpConfigSchema.optional(),
    config: z
      .object({
        schema: z.record(configSchemaFieldSchema),
      })
      .optional(),
    hooks: hookConfigSchema.optional(),
    skills: z.union([z.string(), z.array(skillRefSchema)]).optional(),
    ui: z
      .object({
        panels: z.array(uiPanelSchema),
      })
      .optional(),
    agent: z.union([z.string(), agentAssetsSchema]).optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'mcp') {
        return data.mcp?.transport !== undefined;
      }
      return true;
    },
    {
      message: 'MCP extensions require mcp config with transport field',
    },
  );

export function loadManifest(extensionDir: string): ExtensionManifest {
  const manifestPath = join(extensionDir, 'manifest.json');

  if (!existsSync(manifestPath)) {
    throw new ExtensionError(
      '',
      ErrorCode.MANIFEST_NOT_FOUND,
      `manifest.json not found in ${extensionDir}`,
    );
  }

  let raw: unknown;
  try {
    const content = readFileSync(manifestPath, 'utf-8');
    raw = JSON.parse(content);
  } catch (err) {
    if (err instanceof ExtensionError) {
      throw err;
    }
    throw new ExtensionError(
      '',
      ErrorCode.MANIFEST_INVALID,
      `Failed to parse manifest.json in ${extensionDir}: ${(err as Error).message}`,
      err as Error,
    );
  }

  const result = extensionManifestSchema.safeParse(raw);

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new ExtensionError(
      '',
      ErrorCode.MANIFEST_INVALID,
      `Invalid manifest in ${extensionDir}: ${issues}`,
    );
  }

  return result.data;
}
