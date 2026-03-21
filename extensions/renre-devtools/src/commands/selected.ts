import { connectBrowser, getActivePage } from '../shared/connection.js';
import { ensureBrowserRunning, readState } from '../shared/state.js';
import { markdownCodeBlock, markdownTable, truncate } from '../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

interface SelectedElement {
  backendNodeId: number;
  selector: string;
  tag: string;
  timestamp: string;
}

export default async function selected(context: ExecutionContext): Promise<CommandResult> {
  ensureBrowserRunning(context.projectPath);

  const state = readState(context.projectPath) as (ReturnType<typeof readState> & {
    selectedElement?: SelectedElement;
  }) | null;

  if (!state?.selectedElement) {
    return {
      output: [
        '## No Element Selected',
        '',
        'Use `renre-devtools:inspect` to pick an element from the browser,',
        'or use `renre-devtools:select --selector "..."` to query elements.',
      ].join('\n'),
      exitCode: 1,
    };
  }

  const { selectedElement } = state;
  const browser = await connectBrowser(context.projectPath);

  try {
    const page = await getActivePage(browser);

    // Use the saved selector to get current state of the element
    const info = await page.evaluate(/* istanbul ignore next -- browser-context */ (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;

      const rect = el.getBoundingClientRect();
      const cs = getComputedStyle(el);

      return {
        tag: el.tagName.toLowerCase(),
        id: el.id,
        classes: Array.from(el.classList).join(' '),
        text: (el.textContent ?? '').trim().slice(0, 200),
        html: el.outerHTML.slice(0, 500),
        attrs: Array.from(el.attributes).map((a) => ({
          name: a.name,
          value: a.value,
        })),
        rect: {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        },
        styles: {
          display: cs.display,
          position: cs.position,
          color: cs.color,
          backgroundColor: cs.backgroundColor,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
        },
        childCount: el.children.length,
        visible: rect.width > 0 && rect.height > 0,
      };
    }, selectedElement.selector);

    if (!info) {
      return {
        output: [
          '## Selected Element No Longer Found',
          '',
          `The element \`${selectedElement.selector}\` was selected at ${selectedElement.timestamp}`,
          'but can no longer be found on the page. The page may have changed.',
          '',
          'Use `renre-devtools:inspect` to pick a new element.',
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

    const trimmedHTML = info.html.length >= 500
      ? info.html + '\n<!-- truncated -->'
      : info.html;
    lines.push('', '### HTML', '', markdownCodeBlock(trimmedHTML, 'html'));

    lines.push(
      '',
      '### Actions',
      '',
      `- \`renre-devtools:click --selector "${selectedElement.selector}"\``,
      `- \`renre-devtools:type --selector "${selectedElement.selector}" --text "..."\``,
      `- \`renre-devtools:styles --selector "${selectedElement.selector}"\``,
      `- \`renre-devtools:highlight --selector "${selectedElement.selector}"\``,
      `- \`renre-devtools:dom --selector "${selectedElement.selector}" --depth 3\``,
    );

    return { output: lines.join('\n'), exitCode: 0 };
  } finally {
    void browser.disconnect();
  }
}
