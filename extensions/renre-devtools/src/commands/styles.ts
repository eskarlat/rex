import { withBrowser } from '../shared/connection.js';
import { markdownTable } from '../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

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

export default async function styles(context: ExecutionContext): Promise<CommandResult> {
  const selector = context.args.selector;
  if (typeof selector !== 'string' || selector.length === 0) {
    return { output: 'Error: --selector is required', exitCode: 1 };
  }

  const all = context.args.all === true;

  return withBrowser(context.projectPath, async (_browser, page) => {
    const computed = await page.evaluate(
      (sel, keyProps, showAll) => {
        const el = document.querySelector(sel);
        if (!el) return null;

        const cs = getComputedStyle(el);
        const result: Array<{ property: string; value: string }> = [];

        if (showAll) {
          for (let i = 0; i < cs.length; i++) {
            const prop = cs[i]!;
            result.push({ property: prop, value: cs.getPropertyValue(prop) });
          }
        } else {
          for (const prop of keyProps) {
            const val = cs.getPropertyValue(prop);
            if (val && val !== 'none' && val !== 'normal' && val !== 'auto') {
              result.push({ property: prop, value: val });
            }
          }
        }

        return result;
      },
      selector,
      KEY_PROPERTIES,
      all
    );

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
}
