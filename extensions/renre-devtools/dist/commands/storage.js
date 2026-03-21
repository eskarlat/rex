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
    browser.disconnect();
  }
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

// src/commands/storage.ts
async function storage(context) {
  const storageType = typeof context.args.type === "string" ? context.args.type : "local";
  return withBrowser(context.projectPath, async (_browser, page) => {
    const entries = await page.evaluate((type) => {
      const store = type === "session" ? sessionStorage : localStorage;
      const result = [];
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i);
        if (key) {
          result.push({ key, value: store.getItem(key) ?? "" });
        }
      }
      return result;
    }, storageType);
    const label = storageType === "session" ? "sessionStorage" : "localStorage";
    if (entries.length === 0) {
      return { output: `${label} is empty.`, exitCode: 0 };
    }
    const rows = entries.map((e) => [truncate(e.key, 40), truncate(e.value, 60)]);
    const table = markdownTable(["Key", "Value"], rows);
    return {
      output: [`## ${label} (${String(entries.length)} entries)`, "", table].join("\n"),
      exitCode: 0
    };
  });
}
export {
  storage as default
};
