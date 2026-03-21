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

// src/commands/type.ts
async function typeCommand(context) {
  const selector = context.args.selector;
  const text = context.args.text;
  if (typeof selector !== "string" || selector.length === 0) {
    return { output: "Error: --selector is required", exitCode: 1 };
  }
  if (typeof text !== "string") {
    return { output: "Error: --text is required", exitCode: 1 };
  }
  const clear = context.args.clear === true;
  return withBrowser(context.projectPath, async (_browser, page) => {
    const exists = await page.$(selector);
    if (!exists) {
      return {
        output: `No element found for selector: \`${selector}\``,
        exitCode: 1
      };
    }
    if (clear) {
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) el.value = "";
      }, selector);
    }
    await page.type(selector, text);
    return {
      output: [
        `## Typed into: \`${selector}\``,
        "",
        `- **Text**: "${text}"`,
        `- **Cleared first**: ${clear ? "yes" : "no"}`
      ].join("\n"),
      exitCode: 0
    };
  });
}
export {
  typeCommand as default
};
