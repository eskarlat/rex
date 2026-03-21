import { ExtensionError, ErrorCode } from '../core/errors/extension-error.js';

const CONFIG_VAR_PATTERN = /\${config\.([^}]+)}/g;

function resolveNestedValue(config: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = config;

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      throw new ExtensionError(
        '',
        ErrorCode.INTERPOLATION_FAILED,
        `Cannot resolve config path "${path}": intermediate value at "${part}" is not an object`,
      );
    }

    const obj = current as Record<string, unknown>;
    if (!(part in obj)) {
      throw new ExtensionError('', ErrorCode.INTERPOLATION_FAILED, `Missing config key: "${path}"`);
    }

    current = obj[part];
  }

  if (current === undefined) {
    throw new ExtensionError('', ErrorCode.INTERPOLATION_FAILED, `Missing config key: "${path}"`);
  }

  return current;
}

export function interpolate(template: string, config: Record<string, unknown>): string {
  return template.replace(CONFIG_VAR_PATTERN, (_match, path: string) => {
    const value = resolveNestedValue(config, path);
    return String(value);
  });
}
