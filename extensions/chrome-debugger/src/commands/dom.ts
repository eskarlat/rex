import { withBrowser } from '../shared/connection.js';
import { serializeSubtree, serializeFullPage } from '../shared/browser-scripts.js';
import { markdownCodeBlock } from '../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

export default async function dom(context: ExecutionContext): Promise<CommandResult> {
  const selector = typeof context.args.selector === 'string' ? context.args.selector : null;
  const depth = typeof context.args.depth === 'number' ? context.args.depth : 5;

  return withBrowser(context.projectPath, async (_browser, page) => {
    const html = selector
      ? await page.evaluate(serializeSubtree, selector, depth)
      : await page.evaluate(serializeFullPage, depth);

    const title = selector ? `DOM: \`${selector}\`` : 'DOM Tree';
    return {
      output: [`## ${title}`, '', markdownCodeBlock(html, 'html')].join('\n'),
      exitCode: 0,
    };
  });
}
