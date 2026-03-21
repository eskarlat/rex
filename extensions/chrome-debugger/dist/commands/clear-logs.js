import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/commands/clear-logs.ts
import { existsSync, writeFileSync } from "node:fs";
import { join as join2 } from "node:path";

// src/shared/state.ts
import { join } from "node:path";
function getStorageDir(projectPath) {
  return join(projectPath, ".renre-kit", "storage", "chrome-debugger");
}
function getLogDir(projectPath) {
  return getStorageDir(projectPath);
}

// src/commands/clear-logs.ts
function clearLogs(context) {
  const logDir = getLogDir(context.projectPath);
  let cleared = 0;
  for (const file of ["network.jsonl", "console.jsonl"]) {
    const logPath = join2(logDir, file);
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
