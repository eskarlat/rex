import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/shared/connection.ts
import puppeteer from "puppeteer";

// src/shared/state.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
function getStorageDir(projectPath) {
  return join(projectPath, ".renre-kit", "storage", "chrome-debugger");
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
function ensureBrowserRunning(projectPath) {
  const state = readState(projectPath);
  if (!state) {
    throw new Error(
      "No browser is running. Start one with: renre-kit chrome-debugger:launch"
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
async function withBrowser(projectPath, fn) {
  const browser = await connectBrowser(projectPath);
  try {
    const page = await getActivePage(browser);
    return await fn(browser, page);
  } finally {
    void browser.disconnect();
  }
}

// src/shared/formatters.ts
function markdownCodeBlock(content, lang = "") {
  return `\`\`\`${lang}
${content}
\`\`\``;
}

// src/commands/a11y.ts
async function a11y(context) {
  const selector = typeof context.args.selector === "string" ? context.args.selector : null;
  const depth = typeof context.args.depth === "number" ? context.args.depth : 5;
  return withBrowser(context.projectPath, async (_browser, page) => {
    const client = await page.createCDPSession();
    const params = {};
    if (selector) {
      const element = await page.$(selector);
      if (!element) {
        return {
          output: `No element found for selector: \`${selector}\``,
          exitCode: 1
        };
      }
      const { node } = await client.send("DOM.describeNode", {
        objectId: element.remoteObject().objectId
      });
      params.backendNodeId = node.backendNodeId;
      params.depth = depth;
    } else {
      params.depth = depth;
    }
    const { nodes } = await client.send("Accessibility.getFullAXTree", params);
    const lines = [];
    function renderNode(node, indent) {
      if (node.ignored) return;
      const role = node.role?.value ?? "unknown";
      const name = node.name?.value ?? "";
      const prefix = "  ".repeat(indent);
      const label = name ? `${role} "${name}"` : role;
      lines.push(`${prefix}- ${label}`);
      if (node.children) {
        for (const child of node.children) {
          renderNode(child, indent + 1);
        }
      }
    }
    for (const node of nodes.slice(0, 1)) {
      renderNode(node, 0);
    }
    const tree = lines.length > 0 ? lines.join("\n") : "Empty accessibility tree";
    const title = selector ? `Accessibility Tree: \`${selector}\`` : "Accessibility Tree";
    return {
      output: [`## ${title}`, "", markdownCodeBlock(tree)].join("\n"),
      exitCode: 0
    };
  });
}
export {
  a11y as default
};
