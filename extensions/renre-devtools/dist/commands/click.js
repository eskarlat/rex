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

// src/commands/click.ts
async function click(context) {
  const selector = context.args.selector;
  if (typeof selector !== "string" || selector.length === 0) {
    return { output: "Error: --selector is required", exitCode: 1 };
  }
  return withBrowser(context.projectPath, async (_browser, page) => {
    const exists = await page.$(selector);
    if (!exists) {
      return {
        output: `No element found for selector: \`${selector}\``,
        exitCode: 1
      };
    }
    await page.click(selector);
    const title = await page.title();
    const url = page.url();
    return {
      output: [
        `## Clicked: \`${selector}\``,
        "",
        `- **Current URL**: ${url}`,
        `- **Page Title**: ${title}`
      ].join("\n"),
      exitCode: 0
    };
  });
}
export {
  click as default
};
