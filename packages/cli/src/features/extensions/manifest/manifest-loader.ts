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

const widgetSizeSchema = z.object({
  w: z.number().int().min(1).max(12),
  h: z.number().int().min(1),
});

const uiWidgetSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    entry: z.string(),
    defaultSize: widgetSizeSchema,
    minSize: widgetSizeSchema.optional(),
    maxSize: widgetSizeSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.minSize && data.maxSize) {
        return data.minSize.w <= data.maxSize.w && data.minSize.h <= data.maxSize.h;
      }
      return true;
    },
    { message: 'minSize must not exceed maxSize' },
  )
  .refine(
    (data) => {
      if (data.minSize) {
        return data.defaultSize.w >= data.minSize.w && data.defaultSize.h >= data.minSize.h;
      }
      return true;
    },
    { message: 'defaultSize must be at least minSize' },
  )
  .refine(
    (data) => {
      if (data.maxSize) {
        return data.defaultSize.w <= data.maxSize.w && data.defaultSize.h <= data.maxSize.h;
      }
      return true;
    },
    { message: 'defaultSize must not exceed maxSize' },
  );

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
  skills: z.array(skillRefSchema).optional(),
  prompts: z.array(z.string()).optional(),
  agents: z.array(z.string()).optional(),
  workflows: z.array(z.string()).optional(),
  context: z.array(z.string()).optional(),
});

const extensionManifestSchema = z
  .object({
    name: z.string(),
    title: z.string().optional(),
    version: z.string(),
    description: z.string(),
    icon: z.string().optional(),
    iconColor: z.string().optional(),
    type: z.enum(['standard', 'mcp']),
    main: z.string().optional(),
    commands: z.record(extensionCommandSchema),
    mcp: mcpConfigSchema.optional(),
    config: z
      .object({
        schema: z.record(configSchemaFieldSchema),
      })
      .optional(),
    ui: z
      .object({
        panels: z.array(uiPanelSchema).default([]),
        widgets: z.array(uiWidgetSchema).default([]),
      })
      .optional(),
    engines: z
      .object({
        'renre-kit': z.string().optional(),
        'extension-sdk': z.string().optional(),
      })
      .optional(),
    agent: agentAssetsSchema.optional(),
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
