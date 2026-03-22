import { createRequire } from 'module'; const require = createRequire(import.meta.url);
import {
  getComputedStyles
} from "../chunks/chunk-V26XA6TS.js";
import {
  markdownTable
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
    const computed = await page.evaluate(getComputedStyles, selector, KEY_PROPERTIES, all);
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
