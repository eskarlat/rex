import { createRequire } from 'module'; const require = createRequire(import.meta.url);
import {
  queryElements
} from "../chunks/chunk-V26XA6TS.js";
import {
  markdownTable,
  truncate
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

// src/commands/select.ts
async function select(context) {
  const selector = context.args.selector;
  if (typeof selector !== "string" || selector.length === 0) {
    return { output: "Error: --selector is required", exitCode: 1 };
  }
  return withBrowser(context.projectPath, async (_browser, page) => {
    const elements = await page.evaluate(queryElements, selector);
    if (elements.length === 0) {
      return {
        output: `No elements found for selector: \`${selector}\``,
        exitCode: 0
      };
    }
    const rows = elements.map((el) => [
      String(el.index),
      el.tag,
      el.id,
      truncate(el.classes, 30),
      truncate(el.text, 40)
    ]);
    const table = markdownTable(["#", "Tag", "ID", "Classes", "Text"], rows);
    return {
      output: [
        `## Select: \`${selector}\` (${String(elements.length)} found)`,
        "",
        table
      ].join("\n"),
      exitCode: 0
    };
  });
}
export {
  select as default
};
