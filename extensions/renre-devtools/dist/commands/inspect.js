import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/shared/connection.ts
import puppeteer from "puppeteer";

// src/shared/state.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
function getStorageDir(projectPath) {
  return join(projectPath, ".renre-kit", "storage", "renre-devtools");
}
function getStatePath(projectPath) {
  return join(getStorageDir(projectPath), "state.json");
}
function readState(projectPath) {
  const statePath = getStatePath(projectPath);
  if (!existsSync(statePath)) return null;
  const raw = readFileSync(statePath, "utf-8");
  return JSON.parse(raw);
}
function writeState(projectPath, state) {
  const dir = getStorageDir(projectPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(getStatePath(projectPath), JSON.stringify(state, null, 2));
}
function ensureBrowserRunning(projectPath) {
  const state = readState(projectPath);
  if (!state) {
    throw new Error(
      "No browser is running. Start one with: renre-kit renre-devtools:launch"
    );
  }
  return state;
}

// src/shared/connection.ts
async function connectBrowser(projectPath) {
  const state = ensureBrowserRunning(projectPath);
  return puppeteer.connect({ browserWSEndpoint: state.wsEndpoint });
}
async function getActivePage(browser) {
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  if (!page) {
    throw new Error("No open tabs found in browser");
  }
  return page;
}

// src/shared/formatters.ts
function markdownTable(headers, rows) {
  const separator = headers.map(() => "---");
  const lines = [
    `| ${headers.join(" | ")} |`,
    `| ${separator.join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`)
  ];
  return lines.join("\n");
}
function markdownCodeBlock(content, lang = "") {
  return `\`\`\`${lang}
${content}
\`\`\``;
}
function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

// src/commands/inspect.ts
async function waitForElementPick(client, timeout) {
  await client.send("Overlay.setInspectMode", {
    mode: "searchForNode",
    highlightConfig: {
      showInfo: true,
      showStyles: true,
      showAccessibilityInfo: true,
      contentColor: { r: 111, g: 168, b: 220, a: 0.66 },
      paddingColor: { r: 147, g: 196, b: 125, a: 0.55 },
      borderColor: { r: 255, g: 229, b: 153, a: 0.66 },
      marginColor: { r: 246, g: 178, b: 107, a: 0.66 }
    }
  });
  const backendNodeId = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timed out waiting for element selection (${String(timeout)}ms)`));
    }, timeout);
    client.on("Overlay.inspectNodeRequested", (params) => {
      clearTimeout(timer);
      resolve(params.backendNodeId);
    });
  });
  await client.send("Overlay.setInspectMode", { mode: "none", highlightConfig: {} });
  return backendNodeId;
}
async function generateSelector(client, objectId) {
  const selectorResult = await client.send("Runtime.callFunctionOn", {
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
    returnByValue: true
  });
  return selectorResult.result.value;
}
async function getComputedStyles(client, nodeId) {
  try {
    const { computedStyle } = await client.send("CSS.getComputedStyleForNode", {
      nodeId
    });
    const keyProps = [
      "display",
      "position",
      "width",
      "height",
      "margin",
      "padding",
      "color",
      "background-color",
      "font-size",
      "font-weight",
      "border",
      "border-radius",
      "flex-direction",
      "gap"
    ];
    return computedStyle.filter((s) => keyProps.includes(s.name) && s.value !== "" && s.value !== "none").map((s) => [s.name, s.value]);
  } catch {
    return [];
  }
}
async function getBoxModelSize(client, backendNodeId) {
  try {
    const { model } = await client.send("DOM.getBoxModel", { backendNodeId });
    return `${String(model.width)} x ${String(model.height)}px`;
  } catch {
    return "";
  }
}
async function getA11yInfo(client, backendNodeId) {
  try {
    const { nodes } = await client.send("Accessibility.getPartialAXTree", {
      backendNodeId,
      fetchRelatives: false
    });
    const axNode = nodes[0];
    if (axNode) {
      const role = axNode.role?.value ?? "unknown";
      const name = axNode.name?.value ?? "";
      return name ? `${role} "${name}"` : role;
    }
  } catch {
  }
  return "";
}
function parseAttributes(rawAttrs) {
  const attrs = [];
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
function buildOutput(node, cssSelector, outerHTML, boxModel, a11yInfo, textContent, attrs, styleRows) {
  const lines = [
    "## Inspected Element",
    "",
    `- **Tag**: \`<${node.localName}>\``,
    `- **Selector**: \`${cssSelector}\``
  ];
  if (boxModel) lines.push(`- **Size**: ${boxModel}`);
  if (a11yInfo) lines.push(`- **Accessibility**: ${a11yInfo}`);
  if (textContent) lines.push(`- **Text**: ${truncate(textContent, 100)}`);
  if (attrs.length > 0) {
    lines.push("", "### Attributes", "");
    lines.push(markdownTable(["Attribute", "Value"], attrs.map((a) => [a.name, truncate(a.value, 60)])));
  }
  if (styleRows.length > 0) {
    lines.push("", "### Key Styles", "");
    lines.push(markdownTable(["Property", "Value"], styleRows));
  }
  const trimmedHTML = outerHTML.length > 500 ? outerHTML.slice(0, 500) + "\n<!-- truncated -->" : outerHTML;
  lines.push("", "### HTML", "", markdownCodeBlock(trimmedHTML, "html"));
  lines.push(
    "",
    "### Next Steps",
    "",
    `Use the selector \`${cssSelector}\` with other commands:`,
    `- \`renre-devtools:styles --selector "${cssSelector}"\``,
    `- \`renre-devtools:click --selector "${cssSelector}"\``,
    `- \`renre-devtools:dom --selector "${cssSelector}"\``,
    `- \`renre-devtools:screenshot --selector "${cssSelector}"\``
  );
  return lines.join("\n");
}
async function inspect(context) {
  const timeout = typeof context.args.timeout === "number" ? context.args.timeout : 3e4;
  ensureBrowserRunning(context.projectPath);
  const browser = await connectBrowser(context.projectPath);
  try {
    const page = await getActivePage(browser);
    const client = await page.createCDPSession();
    await client.send("DOM.enable");
    await client.send("Overlay.enable");
    await client.send("CSS.enable");
    const backendNodeId = await waitForElementPick(client, timeout);
    const { node } = await client.send("DOM.describeNode", {
      backendNodeId,
      depth: 0
    });
    const { object } = await client.send("DOM.resolveNode", { backendNodeId });
    const cssSelector = await generateSelector(client, object.objectId);
    const { outerHTML } = await client.send("DOM.getOuterHTML", { backendNodeId });
    const { nodeId } = await client.send("DOM.pushNodesByBackendIdsToFrontend", {
      backendNodeIds: [backendNodeId]
    });
    const resolvedNodeId = nodeId ?? node.nodeId;
    const styleRows = await getComputedStyles(client, resolvedNodeId);
    const boxModel = await getBoxModelSize(client, backendNodeId);
    const textResult = await client.send("Runtime.callFunctionOn", {
      objectId: object.objectId,
      functionDeclaration: `function() { return (this.textContent || '').trim().slice(0, 200); }`,
      returnByValue: true
    });
    const textContent = textResult.result.value;
    const a11yInfo = await getA11yInfo(client, backendNodeId);
    const attrs = parseAttributes(node.attributes);
    const state = readState(context.projectPath);
    if (state) {
      writeState(context.projectPath, {
        ...state,
        selectedElement: {
          backendNodeId,
          selector: cssSelector,
          tag: node.localName,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
    }
    const output = buildOutput(node, cssSelector, outerHTML, boxModel, a11yInfo, textContent, attrs, styleRows);
    return { output, exitCode: 0 };
  } finally {
    void browser.disconnect();
  }
}
export {
  inspect as default
};
