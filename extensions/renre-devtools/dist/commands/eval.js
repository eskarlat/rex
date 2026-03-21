import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/commands/eval.ts
import { readFileSync as readFileSync2 } from "node:fs";

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

// src/shared/formatters.ts
function markdownCodeBlock(content, lang = "") {
  return `\`\`\`${lang}
${content}
\`\`\``;
}

// src/commands/eval.ts
async function evalCommand(context) {
  let code = typeof context.args.code === "string" ? context.args.code : "";
  if (typeof context.args.file === "string") {
    code = readFileSync2(context.args.file, "utf-8");
  }
  if (code.length === 0) {
    return { output: "Error: --code <js> or --file <path> is required", exitCode: 1 };
  }
  return withBrowser(context.projectPath, async (_browser, page) => {
    const result = await page.evaluate(code);
    let formatted;
    if (typeof result === "string") {
      formatted = result;
    } else if (result === void 0) {
      formatted = "undefined";
    } else {
      formatted = JSON.stringify(result, null, 2);
    }
    return {
      output: ["## Eval Result", "", markdownCodeBlock(formatted, "json")].join("\n"),
      exitCode: 0
    };
  });
}
export {
  evalCommand as default
};
