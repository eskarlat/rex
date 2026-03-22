import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { withBrowser } from '../shared/connection.js';

export default defineCommand({
  args: {
    selector: z.string({ required_error: '--selector is required' }).min(1, '--selector is required'),
    text: z.string({ required_error: '--text is required' }),
    clear: z.boolean().default(false),
  },
  handler: async (ctx) => {
    const { selector, text, clear } = ctx.args;

    return withBrowser(ctx.projectPath, async (_browser, page) => {
      const exists = await page.$(selector);
      if (!exists) {
        return {
          output: `No element found for selector: \`${selector}\``,
          exitCode: 1,
        };
      }

      if (clear) {
        await page.evaluate((sel) => {
          const el = document.querySelector(sel) as HTMLInputElement;
          if (el) el.value = '';
        }, selector);
      }

      await page.type(selector, text);

      return {
        output: [
          `## Typed into: \`${selector}\``,
          '',
          `- **Text**: "${text}"`,
          `- **Cleared first**: ${clear ? 'yes' : 'no'}`,
        ].join('\n'),
        exitCode: 0,
      };
    });
  },
});
