import { createRequire } from 'module'; const require = createRequire(import.meta.url);
import {
  serializeFullPage,
  serializeSubtree
} from "../chunks/chunk-V26XA6TS.js";
import {
  markdownCodeBlock
} from "../chunks/chunk-RMALWN2J.js";
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

// src/commands/dom.ts
async function dom(context) {
  const selector = typeof context.args.selector === "string" ? context.args.selector : null;
  const depth = typeof context.args.depth === "number" ? context.args.depth : 5;
  return withBrowser(context.projectPath, async (_browser, page) => {
    const html = selector ? await page.evaluate(serializeSubtree, selector, depth) : await page.evaluate(serializeFullPage, depth);
    const title = selector ? `DOM: \`${selector}\`` : "DOM Tree";
    return {
      output: [`## ${title}`, "", markdownCodeBlock(html, "html")].join("\n"),
      exitCode: 0
    };
  });
}
export {
  dom as default
};
