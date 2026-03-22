import { defineCommand } from '@renre-kit/extension-sdk/node';

import { withBrowser } from '../shared/connection.js';
import { getComputedStyles } from '../shared/browser-scripts.js';
import { markdownTable } from '../shared/formatters.js';

const KEY_PROPERTIES = [
  'display',
  'position',
  'width',
  'height',
  'margin',
  'padding',
  'border',
  'background',
  'color',
  'font-size',
  'font-family',
  'font-weight',
  'line-height',
  'text-align',
  'flex-direction',
  'justify-content',
  'align-items',
  'gap',
  'grid-template-columns',
  'overflow',
  'opacity',
  'z-index',
  'box-shadow',
  'border-radius',
  'transition',
  'transform',
];

export default defineCommand({
  handler: async (ctx) => {
    const selector = ctx.args.selector;
    if (typeof selector !== 'string' || selector.length === 0) {
      return { output: 'Error: --selector is required', exitCode: 1 };
    }

    const all = ctx.args.all === true;

    return withBrowser(ctx.projectPath, async (_browser, page) => {
      const computed = await page.evaluate(getComputedStyles, selector, KEY_PROPERTIES, all);

      if (!computed) {
        return {
          output: `No element found for selector: \`${selector}\``,
          exitCode: 1,
        };
      }

      const rows = computed.map((s) => [s.property, s.value]);
      const table = markdownTable(['Property', 'Value'], rows);

      return {
        output: [
          `## Computed Styles: \`${selector}\`${all ? ' (all)' : ''}`,
          '',
          table,
        ].join('\n'),
        exitCode: 0,
      };
    });
  },
});
