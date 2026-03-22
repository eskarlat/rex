import { z } from 'zod';

import { withBrowser } from '../shared/connection.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

export const argsSchema = z.object({
  selector: z.string({ required_error: '--selector is required' }).min(1, '--selector is required'),
});

export default async function click(context: ExecutionContext): Promise<CommandResult> {
  const { selector } = context.args as z.infer<typeof argsSchema>;

  return withBrowser(context.projectPath, async (_browser, page) => {
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
}
