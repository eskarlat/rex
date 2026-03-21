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
function queryElements(sel) {
  const els = document.querySelectorAll(sel);
  return Array.from(els).map((el, i) => ({
    index: i,
    tag: el.tagName.toLowerCase(),
    id: el.id || "",
    classes: Array.from(el.classList).join(" "),
    text: (el.textContent?.trim() ?? "").slice(0, 80),
    attrs: Array.from(el.attributes).filter((a) => !["id", "class"].includes(a.name)).map((a) => `${a.name}="${a.value}"`).join(", ")
  }));
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
function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

// src/commands/select.ts
async function select(context) {
  const selector = context.args.selector;
  if (typeof selector !== "string" || selector.length === 0) {
    return { output: "Error: --selector is required", exitCode: 1 };
  }
  return withBrowser(context.projectPath, async (_browser, page) => {
    const elements = await page.evaluate(queryElements, selector);
    if (elements.length === 0) {
      return {
        output: `No elements found for selector: \`${selector}\``,
        exitCode: 0
      };
    }
    const rows = elements.map((el) => [
      String(el.index),
      el.tag,
      el.id,
      truncate(el.classes, 30),
      truncate(el.text, 40)
    ]);
    const table = markdownTable(["#", "Tag", "ID", "Classes", "Text"], rows);
    return {
      output: [
        `## Select: \`${selector}\` (${String(elements.length)} found)`,
        "",
        table
      ].join("\n"),
      exitCode: 0
    };
  });
}
export {
  select as default
};
