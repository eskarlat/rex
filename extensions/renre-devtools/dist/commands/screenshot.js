import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/commands/screenshot.ts
import { join as join2 } from "node:path";

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

// src/commands/screenshot.ts
async function screenshot(context) {
  const selector = typeof context.args.selector === "string" ? context.args.selector : null;
  const fullPage = context.args["full-page"] === true || context.args.fullPage === true;
  const output = typeof context.args.output === "string" ? context.args.output : null;
  const encoded = context.args.encoded === true;
  return withBrowser(context.projectPath, async (_browser, page) => {
    const defaultName = `screenshot-${Date.now()}.png`;
    const filePath = output ?? join2(context.projectPath, defaultName);
    if (selector) {
      const element = await page.$(selector);
      if (!element) {
        return {
          output: `No element found for selector: \`${selector}\``,
          exitCode: 1
        };
      }
      if (encoded) {
        const base64 = await element.screenshot({ encoding: "base64" });
        return {
          output: [
            `## Screenshot: \`${selector}\``,
            "",
            `\`data:image/png;base64,${base64}\``
          ].join("\n"),
          exitCode: 0
        };
      }
      await element.screenshot({ path: filePath });
    } else {
      if (encoded) {
        const base64 = await page.screenshot({ encoding: "base64", fullPage });
        return {
          output: ["## Screenshot (full page)", "", `\`data:image/png;base64,${base64}\``].join(
            "\n"
          ),
          exitCode: 0
        };
      }
      await page.screenshot({ path: filePath, fullPage });
    }
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
