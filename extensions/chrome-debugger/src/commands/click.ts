import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { withBrowser } from '../shared/connection.js';

export default defineCommand({
  args: {
    selector: z.string({ required_error: '--selector is required' }).min(1, '--selector is required'),
  },
  handler: async (ctx) => {
    const { selector } = ctx.args;

    return withBrowser(ctx.projectPath, async (_browser, page) => {
      const exists = await page.$(selector);
      if (!exists) {
        return {
          output: `No element found for selector: \`${selector}\``,
          exitCode: 1,
        };
      }

      await page.click(selector);

      const title = await page.title();
      const url = page.url();

      return {
        output: [
          `## Clicked: \`${selector}\``,
          '',
          `- **Current URL**: ${url}`,
          `- **Page Title**: ${title}`,
        ].join('\n'),
        exitCode: 0,
      };
    });
  },
});
