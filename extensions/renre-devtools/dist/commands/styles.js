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

// src/commands/styles.ts
var KEY_PROPERTIES = [
  "display",
  "position",
  "width",
  "height",
  "margin",
  "padding",
  "border",
  "background",
  "color",
  "font-size",
  "font-family",
  "font-weight",
  "line-height",
  "text-align",
  "flex-direction",
  "justify-content",
  "align-items",
  "gap",
  "grid-template-columns",
  "overflow",
  "opacity",
  "z-index",
  "box-shadow",
  "border-radius",
  "transition",
  "transform"
];
async function styles(context) {
  const selector = context.args.selector;
  if (typeof selector !== "string" || selector.length === 0) {
    return { output: "Error: --selector is required", exitCode: 1 };
  }
  const all = context.args.all === true;
  return withBrowser(context.projectPath, async (_browser, page) => {
    const computed = await page.evaluate(
      (sel, keyProps, showAll) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const cs = getComputedStyle(el);
        const result = [];
        if (showAll) {
          for (let i = 0; i < cs.length; i++) {
            const prop = cs[i];
            result.push({ property: prop, value: cs.getPropertyValue(prop) });
          }
        } else {
          for (const prop of keyProps) {
            const val = cs.getPropertyValue(prop);
            if (val && val !== "none" && val !== "normal" && val !== "auto") {
              result.push({ property: prop, value: val });
            }
          }
        }
        return result;
      },
      selector,
      KEY_PROPERTIES,
      all
    );
    if (!computed) {
      return {
        output: `No element found for selector: \`${selector}\``,
        exitCode: 1
      };
    }
    const rows = computed.map((s) => [s.property, s.value]);
    const table = markdownTable(["Property", "Value"], rows);
    return {
      output: [
        `## Computed Styles: \`${selector}\`${all ? " (all)" : ""}`,
        "",
        table
      ].join("\n"),
      exitCode: 0
    };
  });
}
export {
  styles as default
};
