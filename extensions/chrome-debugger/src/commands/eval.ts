import { readFileSync } from 'node:fs';

import { withBrowser } from '../shared/connection.js';
import { markdownCodeBlock } from '../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

export default async function evalCommand(context: ExecutionContext): Promise<CommandResult> {
  let code = typeof context.args.code === 'string' ? context.args.code : '';

  if (typeof context.args.file === 'string') {
    code = readFileSync(context.args.file, 'utf-8');
  }

  if (code.length === 0) {
    return { output: 'Error: --code <js> or --file <path> is required', exitCode: 1 };
  }

  return withBrowser(context.projectPath, async (_browser, page) => {
    const result = await page.evaluate(code);

    let formatted: string;
    if (typeof result === 'string') {
      formatted = result;
    } else if (result === undefined) {
      formatted = 'undefined';
    } else {
      formatted = JSON.stringify(result, null, 2);
    }

    return {
      output: ['## Eval Result', '', markdownCodeBlock(formatted, 'json')].join('\n'),
      exitCode: 0,
    };
  });
}
