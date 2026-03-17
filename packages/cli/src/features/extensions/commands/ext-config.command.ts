import * as clack from '@clack/prompts';
import type { ConfigSchemaField, ConfigMapping } from '../../../core/types/index.js';
import { loadManifest } from '../manifest/manifest-loader.js';
import { getActivated } from '../manager/extension-manager.js';
import { getExtensionDir } from '../../../core/paths/paths.js';
import {
  setExtensionConfig,
  getExtensionConfigMappings,
} from '../../config/config-manager.js';
import { listKeys } from '../../vault/vault-manager.js';

interface ExtConfigOptions {
  name: string;
  projectPath: string;
}

function isCancel(value: unknown): value is symbol {
  return typeof value === 'symbol';
}

function formatCurrentLabel(
  current: ConfigMapping | undefined,
  fieldSchema: ConfigSchemaField,
): string {
  if (current) {
    const display = current.source === 'vault'
      ? `vault:${current.value}`
      : current.value;
    return `(current: ${display})`;
  }
  if (fieldSchema.default !== undefined) {
    return `(default: ${String(fieldSchema.default)})`;
  }
  return '(not set)';
}

async function configureField(
  extensionName: string,
  field: string,
  fieldSchema: ConfigSchemaField,
  currentMappings: Record<string, ConfigMapping>,
  vaultKeys: string[],
): Promise<boolean> {
  const current = currentMappings[field];
  const currentLabel = formatCurrentLabel(current, fieldSchema);

  const sourceChoice = await clack.select({
    message: `${field}: ${fieldSchema.description} ${currentLabel}`,
    options: buildSourceOptions(fieldSchema, vaultKeys),
  });

  if (isCancel(sourceChoice)) {
    return false;
  }

  if (sourceChoice === 'skip') {
    return true;
  }

  const mapping = await buildMapping(String(sourceChoice), field, fieldSchema, vaultKeys);
  if (!mapping) {
    return false;
  }

  setExtensionConfig(extensionName, field, mapping);
  return true;
}

export async function handleExtConfig(options: ExtConfigOptions): Promise<void> {
  const plugins = getActivated(options.projectPath);
  const version = plugins[options.name];
  if (!version) {
    clack.log.error(`Extension "${options.name}" is not activated in this project.`);
    return;
  }

  const extDir = getExtensionDir(options.name, version);
  const manifest = loadManifest(extDir);

  if (!manifest.config?.schema || Object.keys(manifest.config.schema).length === 0) {
    clack.log.info(`Extension "${options.name}" has no configurable fields.`);
    return;
  }

  const schema = manifest.config.schema;
  const currentMappings = getExtensionConfigMappings(options.name);
  const vaultKeys = listKeys();

  for (const [field, fieldSchema] of Object.entries(schema)) {
    const ok = await configureField(options.name, field, fieldSchema, currentMappings, vaultKeys);
    if (!ok) {
      clack.log.info('Cancelled.');
      return;
    }
  }

  clack.log.success(`Configuration for "${options.name}" saved.`);
}

function buildSourceOptions(
  fieldSchema: ConfigSchemaField,
  vaultKeys: string[],
): Array<{ value: string; label: string; hint?: string }> {
  const options: Array<{ value: string; label: string; hint?: string }> = [];

  if (vaultKeys.length > 0 && fieldSchema.secret) {
    options.push({
      value: 'vault',
      label: 'Use vault variable',
      hint: 'Reference an encrypted vault entry',
    });
  }

  options.push({
    value: 'direct',
    label: 'Enter value directly',
  });

  options.push({
    value: 'skip',
    label: 'Skip this field',
  });

  return options;
}

async function buildMapping(
  source: string,
  field: string,
  fieldSchema: ConfigSchemaField,
  vaultKeys: string[],
): Promise<ConfigMapping | undefined> {
  if (source === 'vault') {
    const key = await clack.select({
      message: `Select vault variable for "${field}":`,
      options: vaultKeys.map((k) => ({ value: k, label: k })),
    });

    if (isCancel(key)) {
      return undefined;
    }

    return { source: 'vault', value: String(key) };
  }

  const value = fieldSchema.secret
    ? await clack.password({ message: `Enter value for "${field}":` })
    : await clack.text({
      message: `Enter value for "${field}":`,
      defaultValue: fieldSchema.default !== undefined ? String(fieldSchema.default) : undefined,
    });

  if (isCancel(value)) {
    return undefined;
  }

  return { source: 'direct', value: String(value) };
}
