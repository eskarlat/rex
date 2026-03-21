import { join } from 'node:path';
import { withBrowser } from '../shared/connection.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

export default async function screenshot(context: ExecutionContext): Promise<CommandResult> {
  const selector = typeof context.args.selector === 'string' ? context.args.selector : null;
  const fullPage = context.args['full-page'] === true || context.args.fullPage === true;
  const output = typeof context.args.output === 'string' ? context.args.output : null;
  const encoded = context.args.encoded === true;

  return withBrowser(context.projectPath, async (_browser, page) => {
    const defaultName = `screenshot-${Date.now()}.png`;
    const filePath = output ?? join(context.projectPath, defaultName);

    if (selector) {
      const element = await page.$(selector);
      if (!element) {
        return {
          output: `No element found for selector: \`${selector}\``,
          exitCode: 1,
        };
      }

      if (encoded) {
        const base64 = await element.screenshot({ encoding: 'base64' });
        return {
          output: [
            `## Screenshot: \`${selector}\``,
            '',
            `\`data:image/png;base64,${base64}\``,
          ].join('\n'),
          exitCode: 0,
        };
      }

      await element.screenshot({ path: filePath });
    } else {
      if (encoded) {
        const base64 = await page.screenshot({ encoding: 'base64', fullPage });
        return {
          output: ['## Screenshot (full page)', '', `\`data:image/png;base64,${base64}\``].join(
            '\n'
          ),
          exitCode: 0,
        };
      }

      await page.screenshot({ path: filePath, fullPage });
    }

    return {
      output: [
        '## Screenshot Saved',
        '',
        `- **Path**: \`${filePath}\``,
        `- **Selector**: ${selector ?? 'full page'}`,
        `- **Full page**: ${fullPage ? 'yes' : 'no'}`,
      ].join('\n'),
      exitCode: 0,
    };
  });
}
