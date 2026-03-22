import { createRequire } from 'module'; const require = createRequire(import.meta.url);
import {
  connectBrowser,
  getPageByIndex
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
  ensureBrowserRunning
} from "../chunks/chunk-L2PPAVNR.js";
import "../chunks/chunk-C3C6F2UY.js";

// src/commands/tab.ts
async function tab(context) {
  const positional = Array.isArray(context.args._positional) ? context.args._positional : [];
  const index = Number(context.args.index ?? positional[0]);
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
