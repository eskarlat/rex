import { defineCommand } from '@renre-kit/extension-sdk/node';

import { connectBrowser, getActivePage } from '../shared/connection.js';
import { getSelectedElementInfo } from '../shared/browser-scripts.js';
import { ensureBrowserRunning, readState } from '../shared/state.js';
import { markdownCodeBlock, markdownTable, truncate } from '../shared/formatters.js';

interface SelectedElement {
  backendNodeId: number;
  selector: string;
  tag: string;
  timestamp: string;
}

export default defineCommand({
  handler: async (ctx) => {
    ensureBrowserRunning(ctx.projectPath);

    const state = readState(ctx.projectPath) as (ReturnType<typeof readState> & {
      selectedElement?: SelectedElement;
    }) | null;

    if (!state?.selectedElement) {
      return {
        output: [
          '## No Element Selected',
          '',
          'Use `chrome-debugger:inspect` to pick an element from the browser,',
          'or use `chrome-debugger:select --selector "..."` to query elements.',
        ].join('\n'),
        exitCode: 1,
      };
    }

    const { selectedElement } = state;
    const browser = await connectBrowser(ctx.projectPath);

    const page = await getActivePage(browser);

    const info = await page.evaluate(getSelectedElementInfo, selectedElement.selector);

    if (!info) {
      return {
        output: [
          '## Selected Element No Longer Found',
          '',
          `The element \`${selectedElement.selector}\` was selected at ${selectedElement.timestamp}`,
          'but can no longer be found on the page. The page may have changed.',
          '',
          'Use `chrome-debugger:inspect` to pick a new element.',
        ].join('\n'),
        exitCode: 1,
      };
    }

    const lines: string[] = [
      '## Selected Element',
      '',
      `- **Selector**: \`${selectedElement.selector}\``,
      `- **Tag**: \`<${info.tag}>\``,
      `- **Size**: ${String(info.rect.width)} x ${String(info.rect.height)}px`,
      `- **Position**: (${String(info.rect.x)}, ${String(info.rect.y)})`,
      `- **Visible**: ${info.visible ? 'yes' : 'no'}`,
      `- **Children**: ${String(info.childCount)}`,
    ];

    if (info.id) lines.push(`- **ID**: ${info.id}`);
    if (info.classes) lines.push(`- **Classes**: ${info.classes}`);
    if (info.text) lines.push(`- **Text**: ${truncate(info.text, 100)}`);

    if (info.attrs.length > 0) {
      lines.push('', '### Attributes', '');
      const attrRows = info.attrs.map((a) => [a.name, truncate(a.value, 60)]);
      lines.push(markdownTable(['Attribute', 'Value'], attrRows));
    }

    lines.push('', '### Computed Styles', '');
    const styleRows = Object.entries(info.styles)
      .filter(([, v]) => v !== '' && v !== 'none')
      .map(([k, v]) => [k, v]);
    lines.push(markdownTable(['Property', 'Value'], styleRows));

    const MAX_HTML_LENGTH = 500;
    const trimmedHTML = info.html.length >= MAX_HTML_LENGTH
      ? info.html.slice(0, MAX_HTML_LENGTH) + '\n<!-- truncated -->'
      : info.html;
    lines.push('', '### HTML', '', markdownCodeBlock(trimmedHTML, 'html'));

    lines.push(
      '',
      '### Actions',
      '',
      `- \`chrome-debugger:click --selector "${selectedElement.selector}"\``,
      `- \`chrome-debugger:type --selector "${selectedElement.selector}" --text "..."\``,
      `- \`chrome-debugger:styles --selector "${selectedElement.selector}"\``,
      `- \`chrome-debugger:highlight --selector "${selectedElement.selector}"\``,
      `- \`chrome-debugger:dom --selector "${selectedElement.selector}" --depth 3\``,
    );

    return { output: lines.join('\n'), exitCode: 0 };
  },
});
