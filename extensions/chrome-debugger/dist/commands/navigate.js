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
import "../chunks/chunk-L2PPAVNR.js";
import "../chunks/chunk-C3C6F2UY.js";

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
