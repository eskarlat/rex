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
async function withBrowser(projectPath, fn) {
  const browser = await connectBrowser(projectPath);
  try {
    const page = await getActivePage(browser);
    return await fn(browser, page);
  } finally {
    void browser.disconnect();
  }
}

// src/shared/browser-scripts.ts
function serializeNode(node, currentDepth, truncateText) {
  if (currentDepth <= 0) return "...";
  const tag = node.tagName.toLowerCase();
  const attrs = Array.from(node.attributes).map((a) => `${a.name}="${a.value}"`).join(" ");
  const open = attrs ? `<${tag} ${attrs}>` : `<${tag}>`;
  if (node.children.length === 0) {
    let text = node.textContent?.trim() ?? "";
    if (truncateText !== void 0) text = text.slice(0, truncateText);
    return text ? `${open}${text}</${tag}>` : `${open}</${tag}>`;
  }
  const children = Array.from(node.children).map((child) => serializeNode(child, currentDepth - 1, truncateText)).join("\n");
  return `${open}
${children}
</${tag}>`;
}
function serializeSubtree(sel, maxDepth) {
  const el = document.querySelector(sel);
  if (!el) return `No element found for selector: ${sel}`;
  return serializeNode(el, maxDepth);
}
function serializeFullPage(maxDepth) {
  return serializeNode(document.documentElement, maxDepth, 100);
}

// src/shared/formatters.ts
function markdownCodeBlock(content, lang = "") {
  return `\`\`\`${lang}
${content}
\`\`\``;
}

// src/commands/dom.ts
async function dom(context) {
  const selector = typeof context.args.selector === "string" ? context.args.selector : null;
  const depth = typeof context.args.depth === "number" ? context.args.depth : 5;
  return withBrowser(context.projectPath, async (_browser, page) => {
    const html = selector ? await page.evaluate(serializeSubtree, selector, depth) : await page.evaluate(serializeFullPage, depth);
    const title = selector ? `DOM: \`${selector}\`` : "DOM Tree";
    return {
      output: [`## ${title}`, "", markdownCodeBlock(html, "html")].join("\n"),
      exitCode: 0
    };
  });
}
export {
  dom as default
};
