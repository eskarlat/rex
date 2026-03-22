import { createRequire } from 'module'; const require = createRequire(import.meta.url);
import {
  getStorageEntries
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

// src/commands/storage.ts
async function storage(context) {
  const storageType = typeof context.args.type === "string" ? context.args.type : "local";
  return withBrowser(context.projectPath, async (_browser, page) => {
    const entries = await page.evaluate(getStorageEntries, storageType);
    const label = storageType === "session" ? "sessionStorage" : "localStorage";
    if (entries.length === 0) {
      return { output: `${label} is empty.`, exitCode: 0 };
    }
    const rows = entries.map((e) => [truncate(e.key, 40), truncate(e.value, 60)]);
    const table = markdownTable(["Key", "Value"], rows);
    return {
      output: [`## ${label} (${String(entries.length)} entries)`, "", table].join("\n"),
      exitCode: 0
    };
  });
}
export {
  storage as default
};
