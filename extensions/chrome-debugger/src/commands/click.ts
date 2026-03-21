import { withBrowser } from '../shared/connection.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

export default async function click(context: ExecutionContext): Promise<CommandResult> {
  const selector = context.args.selector;
  if (typeof selector !== 'string' || selector.length === 0) {
    return { output: 'Error: --selector is required', exitCode: 1 };
  }

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
