import { jsonToMarkdown } from '@renre-kit/extension-sdk/node';

import type { CommandResult } from './types.js';

/** Convert API response data to a markdown-formatted CommandResult */
export function toOutput(data: unknown): CommandResult {
  return {
    output: jsonToMarkdown(data, { filterNoise: true }),
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
