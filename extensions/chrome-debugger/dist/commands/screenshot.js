import { createRequire } from 'module'; const require = createRequire(import.meta.url);
import {
  withBrowser
} from "../chunks/chunk-EEGYRSU4.js";
import "../chunks/chunk-AT5YMNYW.js";
import "../chunks/chunk-YGOXEHOS.js";
import "../chunks/chunk-A7XEC37O.js";
import "../chunks/chunk-ICGADTKU.js";
import "../chunks/chunk-WWTA3VPD.js";
import "../chunks/chunk-FOU2EXQ2.js";
import "../chunks/chunk-LOYEZFXG.js";
import "../chunks/chunk-AWU4Q6CL.js";
import "../chunks/chunk-BF5SUUWU.js";
import {
  getScreenshotDir
} from "../chunks/chunk-L2PPAVNR.js";
import "../chunks/chunk-C3C6F2UY.js";

// src/commands/screenshot.ts
import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { basename, dirname, join } from "node:path";
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
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
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
  const metaPath = join(screenshotDir, "screenshots.jsonl");
  const meta = {
    filename: basename(filePath),
    path: filePath,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    url: page.url(),
    selector,
    fullPage
  };
  if (!existsSync(screenshotDir)) {
    mkdirSync(screenshotDir, { recursive: true });
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
    const filePath = output ?? join(screenshotDir, `screenshot-${String(Date.now())}.png`);
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
