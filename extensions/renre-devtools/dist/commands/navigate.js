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

// src/commands/navigate.ts
async function navigate(context) {
  const url = context.args.url;
  if (typeof url !== "string" || url.length === 0) {
    return { output: "Error: --url is required", exitCode: 1 };
  }
  return withBrowser(context.projectPath, async (_browser, page) => {
    const waitUntil = context.args.wait === "load" ? "load" : "domcontentloaded";
    const response = await page.goto(url, { waitUntil });
    const status = response?.status() ?? 0;
    const title = await page.title();
    const finalUrl = page.url();
    return {
      output: [
        "## Navigated",
        "",
        `- **URL**: ${finalUrl}`,
        `- **Title**: ${title}`,
        `- **Status**: ${String(status)}`
      ].join("\n"),
      exitCode: 0
    };
  });
}
export {
  navigate as default
};
