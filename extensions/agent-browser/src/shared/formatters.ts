import type { CommandResult } from './types.js';

/** Convert data to a JSON-formatted CommandResult */
export function toOutput(data: unknown): CommandResult {
  return {
    output: JSON.stringify(typeof data === 'string' ? { result: data } : data, undefined, 2),
    exitCode: 0,
  };
}

/** Convert an error to a CommandResult with exitCode 1 */
export function errorOutput(err: unknown): CommandResult {
  const message = err instanceof Error ? err.message : String(err);
  return {
    output: message,
    exitCode: 1,
  };
}
