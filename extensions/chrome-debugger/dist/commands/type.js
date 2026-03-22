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
