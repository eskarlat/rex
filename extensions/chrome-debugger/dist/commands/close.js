import { createRequire } from 'module'; const require = createRequire(import.meta.url);
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
  deleteGlobalSession,
  deleteState,
  getLogDir,
  killProcessTree,
  readState
} from "../chunks/chunk-L2PPAVNR.js";
import "../chunks/chunk-C3C6F2UY.js";

// src/commands/close.ts
import { existsSync, unlinkSync } from "node:fs";
import { join } from "node:path";
async function close(context) {
  const state = readState(context.projectPath);
  if (!state) {
    return {
      output: "No browser is running.",
      exitCode: 1
    };
  }
  try {
    const browser = await connectBrowser(context.projectPath);
    await browser.close();
  } catch {
    killProcessTree(state.pid);
  }
  const logDir = getLogDir(context.projectPath);
  for (const file of ["network.jsonl", "console.jsonl"]) {
    const logPath = join(logDir, file);
    if (existsSync(logPath)) {
      unlinkSync(logPath);
    }
  }
  deleteState(context.projectPath);
  deleteGlobalSession();
  return {
    output: [
      "## Browser Closed",
      "",
      `- **PID**: ${String(state.pid)} (terminated)`,
      "- **Logs**: cleaned up"
    ].join("\n"),
    exitCode: 0
  };
}
export {
  close as default
};
