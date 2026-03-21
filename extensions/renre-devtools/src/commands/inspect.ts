import { connectBrowser, getActivePage } from '../shared/connection.js';
import { ensureBrowserRunning, readState, writeState } from '../shared/state.js';
import { markdownCodeBlock, markdownTable, truncate } from '../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

export default async function inspect(context: ExecutionContext): Promise<CommandResult> {
  const timeout = typeof context.args.timeout === 'number' ? context.args.timeout : 30000;

  ensureBrowserRunning(context.projectPath);
  const browser = await connectBrowser(context.projectPath);

  try {
    const page = await getActivePage(browser);
    const client = await page.createCDPSession();

    // Enable required domains
    await client.send('DOM.enable');
    await client.send('Overlay.enable');
    await client.send('CSS.enable');

    // Activate the element picker — browser shows blue highlight on hover
    await client.send('Overlay.setInspectMode', {
      mode: 'searchForNode',
      highlightConfig: {
        showInfo: true,
        showStyles: true,
        showAccessibilityInfo: true,
        contentColor: { r: 111, g: 168, b: 220, a: 0.66 },
        paddingColor: { r: 147, g: 196, b: 125, a: 0.55 },
        borderColor: { r: 255, g: 229, b: 153, a: 0.66 },
        marginColor: { r: 246, g: 178, b: 107, a: 0.66 },
      },
    });

    // Wait for user to click an element
    const backendNodeId = await new Promise<number>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timed out waiting for element selection (${String(timeout)}ms)`));
      }, timeout);

      client.on('Overlay.inspectNodeRequested', (params: { backendNodeId: number }) => {
        clearTimeout(timer);
        resolve(params.backendNodeId);
      });
    });

    // Disable inspect mode
    await client.send('Overlay.setInspectMode', {
      mode: 'none',
      highlightConfig: {},
    });

    // Get full node details
    const { node } = (await client.send('DOM.describeNode', {
      backendNodeId,
      depth: 0,
    })) as {
      node: {
        nodeId: number;
        backendNodeId: number;
        nodeName: string;
        localName: string;
        nodeValue: string;
        attributes?: string[];
        childNodeCount?: number;
      };
    };

    // Generate a unique CSS selector for this element
    const { object } = (await client.send('DOM.resolveNode', { backendNodeId })) as {
      object: { objectId: string };
    };

    const selectorResult = await client.send('Runtime.callFunctionOn', {
      objectId: object.objectId,
      functionDeclaration: `function() {
        function getSelector(el) {
          if (el.id) return '#' + CSS.escape(el.id);

          const parts = [];
          let current = el;
          while (current && current !== document.documentElement) {
            let selector = current.tagName.toLowerCase();

            if (current.id) {
              parts.unshift('#' + CSS.escape(current.id));
              break;
            }

            if (current.className && typeof current.className === 'string') {
              const classes = current.className.trim().split(/\\s+/).filter(c => c.length > 0);
              if (classes.length > 0) {
                selector += '.' + classes.map(c => CSS.escape(c)).join('.');
              }
            }

            // Add nth-child if needed for uniqueness
            const parent = current.parentElement;
            if (parent) {
              const siblings = Array.from(parent.children).filter(s => s.tagName === current.tagName);
              if (siblings.length > 1) {
                const index = siblings.indexOf(current) + 1;
                selector += ':nth-child(' + index + ')';
              }
            }

            parts.unshift(selector);
            current = current.parentElement;
          }

          return parts.join(' > ');
        }
        return getSelector(this);
      }`,
      returnByValue: true,
    });

    const cssSelector = (selectorResult as { result: { value: string } }).result.value;

    // Get outer HTML
    const { outerHTML } = (await client.send('DOM.getOuterHTML', { backendNodeId })) as {
      outerHTML: string;
    };

    // Get computed styles
    const { nodeId } = (await client.send('DOM.pushNodesByBackendIdsToFrontend', {
      backendNodeIds: [backendNodeId],
    })) as { nodeIds: number[] } & { nodeId?: number };

    const resolvedNodeId = nodeId ?? node.nodeId;

    let styleRows: string[][] = [];
    try {
      const { computedStyle } = (await client.send('CSS.getComputedStyleForNode', {
        nodeId: resolvedNodeId,
      })) as { computedStyle: Array<{ name: string; value: string }> };

      const keyProps = [
        'display', 'position', 'width', 'height', 'margin', 'padding',
        'color', 'background-color', 'font-size', 'font-weight',
        'border', 'border-radius', 'flex-direction', 'gap',
      ];

      styleRows = computedStyle
        .filter((s) => keyProps.includes(s.name) && s.value !== '' && s.value !== 'none')
        .map((s) => [s.name, s.value]);
    } catch {
      // CSS domain may not have the node yet
    }

    // Get box model
    let boxModel = '';
    try {
      const { model } = (await client.send('DOM.getBoxModel', { backendNodeId })) as {
        model: { width: number; height: number; content: number[]; padding: number[]; border: number[]; margin: number[] };
      };
      boxModel = `${String(model.width)} x ${String(model.height)}px`;
    } catch {
      // May not be available for all elements
    }

    // Get text content
    const textResult = await client.send('Runtime.callFunctionOn', {
      objectId: object.objectId,
      functionDeclaration: `function() { return (this.textContent || '').trim().slice(0, 200); }`,
      returnByValue: true,
    });
    const textContent = (textResult as { result: { value: string } }).result.value;

    // Get accessibility info
    let a11yInfo = '';
    try {
      const { nodes } = (await client.send('Accessibility.getPartialAXTree', {
        backendNodeId,
        fetchRelatives: false,
      })) as { nodes: Array<{ role?: { value: string }; name?: { value: string }; properties?: Array<{ name: string; value: { value: unknown } }> }> };

      const axNode = nodes[0];
      if (axNode) {
        const role = axNode.role?.value ?? 'unknown';
        const name = axNode.name?.value ?? '';
        a11yInfo = name ? `${role} "${name}"` : role;
      }
    } catch {
      // Accessibility domain may not be available
    }

    // Parse attributes
    const attrs: Array<{ name: string; value: string }> = [];
    if (node.attributes) {
      for (let i = 0; i < node.attributes.length; i += 2) {
        const attrName = node.attributes[i];
        const attrValue = node.attributes[i + 1];
        if (attrName !== undefined && attrValue !== undefined) {
          attrs.push({ name: attrName, value: attrValue });
        }
      }
    }

    // Save selected element info to state for `devtools:selected` to use
    const state = readState(context.projectPath);
    if (state) {
      const extendedState = {
        ...state,
        selectedElement: {
          backendNodeId,
          selector: cssSelector,
          tag: node.localName,
          timestamp: new Date().toISOString(),
        },
      };
      writeState(context.projectPath, extendedState as typeof state);
    }

    // Build markdown output
    const lines: string[] = [
      '## Inspected Element',
      '',
      `- **Tag**: \`<${node.localName}>\``,
      `- **Selector**: \`${cssSelector}\``,
    ];

    if (boxModel) lines.push(`- **Size**: ${boxModel}`);
    if (a11yInfo) lines.push(`- **Accessibility**: ${a11yInfo}`);
    if (textContent) lines.push(`- **Text**: ${truncate(textContent, 100)}`);

    if (attrs.length > 0) {
      lines.push('', '### Attributes', '');
      const attrRows = attrs.map((a) => [a.name, truncate(a.value, 60)]);
      lines.push(markdownTable(['Attribute', 'Value'], attrRows));
    }

    if (styleRows.length > 0) {
      lines.push('', '### Key Styles', '');
      lines.push(markdownTable(['Property', 'Value'], styleRows));
    }

    const trimmedHTML = outerHTML.length > 500
      ? outerHTML.slice(0, 500) + '\n<!-- truncated -->'
      : outerHTML;
    lines.push('', '### HTML', '', markdownCodeBlock(trimmedHTML, 'html'));

    lines.push(
      '',
      '### Next Steps',
      '',
      `Use the selector \`${cssSelector}\` with other commands:`,
      `- \`renre-devtools:styles --selector "${cssSelector}"\``,
      `- \`renre-devtools:click --selector "${cssSelector}"\``,
      `- \`renre-devtools:dom --selector "${cssSelector}"\``,
      `- \`renre-devtools:screenshot --selector "${cssSelector}"\``,
    );

    return { output: lines.join('\n'), exitCode: 0 };
  } finally {
    browser.disconnect();
  }
}
