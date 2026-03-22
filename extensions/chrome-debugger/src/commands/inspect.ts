import type { CDPSession } from 'puppeteer';

import { connectBrowser, getActivePage } from '../shared/connection.js';
import { markdownCodeBlock, markdownTable, truncate } from '../shared/formatters.js';
import { ensureBrowserRunning, readState, writeState } from '../shared/state.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

interface NodeDescription {
  nodeId: number;
  backendNodeId: number;
  nodeName: string;
  localName: string;
  nodeValue: string;
  attributes?: string[];
  childNodeCount?: number;
}

async function waitForElementPick(client: CDPSession, timeout: number): Promise<number> {
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

  const backendNodeId = await new Promise<number>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timed out waiting for element selection (${String(timeout)}ms)`));
    }, timeout);

    client.on('Overlay.inspectNodeRequested', (params: { backendNodeId: number }) => {
      clearTimeout(timer);
      resolve(params.backendNodeId);
    });
  });

  await client.send('Overlay.setInspectMode', { mode: 'none', highlightConfig: {} });
  return backendNodeId;
}

async function generateSelector(client: CDPSession, objectId: string): Promise<string> {
  const selectorResult = await client.send('Runtime.callFunctionOn', {
    objectId,
    functionDeclaration: `function() {
      function getSelector(el) {
        if (el.id) return '#' + CSS.escape(el.id);
        const parts = [];
        let current = el;
        while (current && current !== document.documentElement) {
          let selector = current.tagName.toLowerCase();
          if (current.id) { parts.unshift('#' + CSS.escape(current.id)); break; }
          if (current.className && typeof current.className === 'string') {
            const classes = current.className.trim().split(/\\s+/).filter(c => c.length > 0);
            if (classes.length > 0) selector += '.' + classes.map(c => CSS.escape(c)).join('.');
          }
          const parent = current.parentElement;
          if (parent) {
            const siblings = Array.from(parent.children).filter(s => s.tagName === current.tagName);
            if (siblings.length > 1) selector += ':nth-child(' + (siblings.indexOf(current) + 1) + ')';
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
  return (selectorResult as { result: { value: string } }).result.value;
}

async function getComputedStyles(
  client: CDPSession,
  nodeId: number
): Promise<string[][]> {
  try {
    const { computedStyle } = (await client.send('CSS.getComputedStyleForNode', {
      nodeId,
    })) as { computedStyle: Array<{ name: string; value: string }> };

    const keyProps = [
      'display', 'position', 'width', 'height', 'margin', 'padding',
      'color', 'background-color', 'font-size', 'font-weight',
      'border', 'border-radius', 'flex-direction', 'gap',
    ];

    return computedStyle
      .filter((s) => keyProps.includes(s.name) && s.value !== '' && s.value !== 'none')
      .map((s) => [s.name, s.value]);
  } catch {
    return [];
  }
}

async function getBoxModelSize(client: CDPSession, backendNodeId: number): Promise<string> {
  try {
    const { model } = (await client.send('DOM.getBoxModel', { backendNodeId })) as {
      model: { width: number; height: number };
    };
    return `${String(model.width)} x ${String(model.height)}px`;
  } catch {
    return '';
  }
}

async function getA11yInfo(client: CDPSession, backendNodeId: number): Promise<string> {
  try {
    const { nodes } = (await client.send('Accessibility.getPartialAXTree', {
      backendNodeId,
      fetchRelatives: false,
    })) as { nodes: Array<{ role?: { value: string }; name?: { value: string } }> };

    const axNode = nodes[0];
    if (axNode) {
      const role = axNode.role?.value ?? 'unknown';
      const name = axNode.name?.value ?? '';
      return name ? `${role} "${name}"` : role;
    }
  } catch {
    // Accessibility domain may not be available
  }
  return '';
}

function parseAttributes(rawAttrs: string[] | undefined): Array<{ name: string; value: string }> {
  const attrs: Array<{ name: string; value: string }> = [];
  if (!rawAttrs) return attrs;

  for (let i = 0; i < rawAttrs.length; i += 2) {
    const attrName = rawAttrs[i];
    const attrValue = rawAttrs[i + 1];
    if (attrName != null && attrValue != null) {
      attrs.push({ name: attrName, value: attrValue });
    }
  }
  return attrs;
}

function buildOutput(
  node: NodeDescription,
  cssSelector: string,
  outerHTML: string,
  boxModel: string,
  a11yInfo: string,
  textContent: string,
  attrs: Array<{ name: string; value: string }>,
  styleRows: string[][]
): string {
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
    lines.push(markdownTable(['Attribute', 'Value'], attrs.map((a) => [a.name, truncate(a.value, 60)])));
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
    '', '### Next Steps', '',
    `Use the selector \`${cssSelector}\` with other commands:`,
    `- \`chrome-debugger:styles --selector "${cssSelector}"\``,
    `- \`chrome-debugger:click --selector "${cssSelector}"\``,
    `- \`chrome-debugger:dom --selector "${cssSelector}"\``,
    `- \`chrome-debugger:screenshot --selector "${cssSelector}"\``,
  );

  return lines.join('\n');
}

export default async function inspect(context: ExecutionContext): Promise<CommandResult> {
  const timeout = typeof context.args.timeout === 'number' ? context.args.timeout : 30000;

  ensureBrowserRunning(context.projectPath);
  const browser = await connectBrowser(context.projectPath);

  const page = await getActivePage(browser);
  const client = await page.createCDPSession();

  await client.send('DOM.enable');
  await client.send('Overlay.enable');
  await client.send('CSS.enable');

  const backendNodeId = await waitForElementPick(client, timeout);

  const { node } = (await client.send('DOM.describeNode', {
    backendNodeId, depth: 0,
  })) as { node: NodeDescription };

  const { object } = (await client.send('DOM.resolveNode', { backendNodeId })) as {
    object: { objectId: string };
  };

  const cssSelector = await generateSelector(client, object.objectId);

  const { outerHTML } = (await client.send('DOM.getOuterHTML', { backendNodeId })) as {
    outerHTML: string;
  };

  const { nodeId } = (await client.send('DOM.pushNodesByBackendIdsToFrontend', {
    backendNodeIds: [backendNodeId],
  })) as { nodeIds: number[]; nodeId?: number };

  const resolvedNodeId = nodeId ?? node.nodeId;
  const styleRows = await getComputedStyles(client, resolvedNodeId);
  const boxModel = await getBoxModelSize(client, backendNodeId);

  const textResult = await client.send('Runtime.callFunctionOn', {
    objectId: object.objectId,
    functionDeclaration: `function() { return (this.textContent || '').trim().slice(0, 200); }`,
    returnByValue: true,
  });
  const textContent = (textResult as { result: { value: string } }).result.value;

  const a11yInfo = await getA11yInfo(client, backendNodeId);
  const attrs = parseAttributes(node.attributes);

  // Save selected element to state
  const state = readState(context.projectPath);
  if (state) {
    writeState(context.projectPath, {
      ...state,
      selectedElement: {
        backendNodeId,
        selector: cssSelector,
        tag: node.localName,
        timestamp: new Date().toISOString(),
      },
    } as typeof state);
  }

  const output = buildOutput(node, cssSelector, outerHTML, boxModel, a11yInfo, textContent, attrs, styleRows);
  return { output, exitCode: 0 };
}
