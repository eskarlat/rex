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
async function getPageByIndex(browser, index) {
  const pages = await browser.pages();
  const page = pages[index];
  if (!page) {
    throw new Error(`Tab index ${String(index)} out of range (${String(pages.length)} tabs open)`);
  }
  return page;
}

// src/commands/tab.ts
async function tab(context) {
  const index = Number(context.args.index ?? context.args._positional?.[0]);
  if (Number.isNaN(index)) {
    return { output: "Error: --index <number> is required", exitCode: 1 };
  }
  ensureBrowserRunning(context.projectPath);
  const browser = await connectBrowser(context.projectPath);
  try {
    const page = await getPageByIndex(browser, index);
    await page.bringToFront();
    const title = await page.title();
    return {
      output: [
        "## Switched Tab",
        "",
        `- **Index**: ${String(index)}`,
        `- **Title**: ${title}`,
        `- **URL**: ${page.url()}`
      ].join("\n"),
      exitCode: 0
    };
  } finally {
    void browser.disconnect();
  }
}
export {
  tab as default
};
