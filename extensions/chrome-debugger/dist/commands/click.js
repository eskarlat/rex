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
