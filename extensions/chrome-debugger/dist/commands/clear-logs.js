import { createRequire } from 'module'; const require = createRequire(import.meta.url);
import {
  getLogDir
} from "../chunks/chunk-L2PPAVNR.js";
import "../chunks/chunk-C3C6F2UY.js";

// src/commands/clear-logs.ts
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
function clearLogs(context) {
  const logDir = getLogDir(context.projectPath);
  let cleared = 0;
  for (const file of ["network.jsonl", "console.jsonl"]) {
    const logPath = join(logDir, file);
    if (existsSync(logPath)) {
      writeFileSync(logPath, "");
      cleared++;
    }
  }
  return {
    output: JSON.stringify({ cleared, files: ["network.jsonl", "console.jsonl"] }),
    exitCode: 0
  };
}
export {
  clearLogs as default
};
