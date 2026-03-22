import { readFileSync } from 'node:fs';

import { defineCommand } from '@renre-kit/extension-sdk/node';

import { withBrowser } from '../shared/connection.js';
import { markdownCodeBlock } from '../shared/formatters.js';

export default defineCommand({
  handler: async (ctx) => {
    let code = typeof ctx.args.code === 'string' ? ctx.args.code : '';

    if (typeof ctx.args.file === 'string') {
      code = readFileSync(ctx.args.file, 'utf-8');
    }

    if (code.length === 0) {
      return { output: 'Error: --code <js> or --file <path> is required', exitCode: 1 };
    }

    return withBrowser(ctx.projectPath, async (_browser, page) => {
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
  },
});
