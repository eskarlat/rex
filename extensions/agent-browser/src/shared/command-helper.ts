import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';

import { toOutput, errorOutput } from './formatters.js';
import type { CommandResult, CommandContext } from './types.js';

const execFileAsync = promisify(execFile);

/**
 * Resolve the agent-browser CLI binary by locating the package entry point.
 * Works regardless of whether node_modules is present or bundled.
 */
export function getBinPath(): string {
  const require = createRequire(import.meta.url);
  const pkgEntry = require.resolve('agent-browser');
  return resolve(dirname(pkgEntry), '..', 'cli.js');
}

/** Build common CLI flags from extension config */
export function getConfigFlags(config: Record<string, unknown>): string[] {
  const flags: string[] = ['--json'];

  const session = config['session'];
  if (typeof session === 'string' && session && session !== 'default') {
    flags.push('--session', session);
  }

  const profile = config['profile'];
  if (typeof profile === 'string' && profile) {
    flags.push('--profile', profile);
  }

  return flags;
}

/** Execute an agent-browser CLI command and return structured output */
export async function browserCommand<T extends Record<string, unknown>>(
  context: CommandContext<T>,
  args: string[],
): Promise<CommandResult> {
  try {
    const bin = getBinPath();
    const configFlags = getConfigFlags(context.config);
    const { stdout } = await execFileAsync(bin, [...configFlags, ...args], {
      timeout: getTimeout(context.config),
    });
    return toOutput(parseOutput(stdout));
  } catch (err) {
    return errorOutput(err);
  }
}

/** Parse agent-browser stdout — try JSON first, fall back to raw string */
function parseOutput(stdout: string): unknown {
  const trimmed = stdout.trim();
  if (!trimmed) return { success: true };
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return trimmed;
  }
}

/** Get timeout from config or default to 25000ms */
function getTimeout(config: Record<string, unknown>): number {
  const timeout = config['timeout'];
  return typeof timeout === 'number' && timeout > 0 ? timeout : 25_000;
}
