import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/commands/screenshot.ts
import { appendFileSync, existsSync as existsSync2, mkdirSync as mkdirSync2 } from "node:fs";
import { dirname, join as join2 } from "node:path";

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
function getScreenshotDir(projectPath) {
  return join(getStorageDir(projectPath), "screenshots");
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

// src/commands/screenshot.ts
function parseArgs(context) {
  return {
    selector: typeof context.args.selector === "string" ? context.args.selector : null,
    fullPage: context.args["full-page"] === true || context.args.fullPage === true,
    output: typeof context.args.output === "string" ? context.args.output : null,
    encoded: context.args.encoded === true,
    dir: typeof context.args.dir === "string" ? context.args.dir : null
  };
}
function ensureDir(filePath) {
  const dir = dirname(filePath);
  if (!existsSync2(dir)) {
    mkdirSync2(dir, { recursive: true });
  }
}
async function captureEncoded(page, element, selector, fullPage) {
  const label = selector ? `Screenshot: \`${selector}\`` : "Screenshot (full page)";
  const base64 = element ? await element.screenshot({ encoding: "base64" }) : await page.screenshot({ encoding: "base64", fullPage });
  return {
    output: [`## ${label}`, "", `\`data:image/png;base64,${base64}\``].join("\n"),
    exitCode: 0
  };
}
function registerMeta(screenshotDir, filePath, page, selector, fullPage) {
  const metaPath = join2(screenshotDir, "screenshots.jsonl");
  const meta = {
    filename: filePath.slice(filePath.lastIndexOf("/") + 1),
    path: filePath,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    url: page.url(),
    selector,
    fullPage
  };
  if (!existsSync2(screenshotDir)) {
    mkdirSync2(screenshotDir, { recursive: true });
  }
  appendFileSync(metaPath, JSON.stringify(meta) + "\n");
}
async function screenshot(context) {
  const { selector, fullPage, output, encoded, dir } = parseArgs(context);
  return withBrowser(context.projectPath, async (_browser, page) => {
    const element = selector ? await page.$(selector) : null;
    if (selector && !element) {
      return { output: `No element found for selector: \`${selector}\``, exitCode: 1 };
    }
    if (encoded) {
      return captureEncoded(page, element, selector, fullPage);
    }
    const screenshotDir = dir ?? getScreenshotDir(context.projectPath);
    const filePath = output ?? join2(screenshotDir, `screenshot-${String(Date.now())}.png`);
    ensureDir(filePath);
    await (element ? element.screenshot({ path: filePath }) : page.screenshot({ path: filePath, fullPage }));
    registerMeta(screenshotDir, filePath, page, selector, fullPage);
    return {
      output: [
        "## Screenshot Saved",
        "",
        `- **Path**: \`${filePath}\``,
        `- **Selector**: ${selector ?? "full page"}`,
        `- **Full page**: ${fullPage ? "yes" : "no"}`
      ].join("\n"),
      exitCode: 0
    };
  });
}
export {
  screenshot as default
};
