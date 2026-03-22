import { createRequire } from 'module'; const require = createRequire(import.meta.url);
import {
  markdownTable,
  truncate
} from "../chunks/chunk-RMALWN2J.js";
import {
  connectBrowser
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

// src/commands/tabs.ts
async function tabs(context) {
  ensureBrowserRunning(context.projectPath);
  const browser = await connectBrowser(context.projectPath);
  try {
    const pages = await browser.pages();
    const rows = [];
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const title = await page.title();
      rows.push([String(i), truncate(title, 40), truncate(page.url(), 60)]);
    }
    const table = markdownTable(["Index", "Title", "URL"], rows);
    return {
      output: [`## Open Tabs (${String(pages.length)})`, "", table].join("\n"),
      exitCode: 0
    };
  } finally {
    void browser.disconnect();
  }
}
export {
  tabs as default
};
