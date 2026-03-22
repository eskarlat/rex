import { createRequire } from 'module'; const require = createRequire(import.meta.url);
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

// src/commands/eval.ts
import { readFileSync } from "node:fs";
async function evalCommand(context) {
  let code = typeof context.args.code === "string" ? context.args.code : "";
  if (typeof context.args.file === "string") {
    code = readFileSync(context.args.file, "utf-8");
  }
  if (code.length === 0) {
    return { output: "Error: --code <js> or --file <path> is required", exitCode: 1 };
  }
  return withBrowser(context.projectPath, async (_browser, page) => {
    const result = await page.evaluate(code);
    let formatted;
    if (typeof result === "string") {
      formatted = result;
    } else if (result === void 0) {
      formatted = "undefined";
    } else {
      formatted = JSON.stringify(result, null, 2);
    }
    return {
      output: ["## Eval Result", "", markdownCodeBlock(formatted, "json")].join("\n"),
      exitCode: 0
    };
  });
}
export {
  evalCommand as default
};
