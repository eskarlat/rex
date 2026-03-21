import { withBrowser } from '../shared/connection.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

export default async function typeCommand(context: ExecutionContext): Promise<CommandResult> {
  const selector = context.args.selector;
  const text = context.args.text;

  if (typeof selector !== 'string' || selector.length === 0) {
    return { output: 'Error: --selector is required', exitCode: 1 };
  }
  if (typeof text !== 'string') {
    return { output: 'Error: --text is required', exitCode: 1 };
  }

  const clear = context.args.clear === true;

  return withBrowser(context.projectPath, async (_browser, page) => {
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
}
