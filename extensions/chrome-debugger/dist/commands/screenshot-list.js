import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/commands/screenshot-list.ts
import { existsSync, readFileSync } from "node:fs";
import { join as join2 } from "node:path";

// src/shared/state.ts
import { join } from "node:path";
function getStorageDir(projectPath) {
  return join(projectPath, ".renre-kit", "storage", "chrome-debugger");
}
function getScreenshotDir(projectPath) {
  return join(getStorageDir(projectPath), "screenshots");
}

// src/commands/screenshot-list.ts
function screenshotList(context) {
  const screenshotDir = getScreenshotDir(context.projectPath);
  const metaPath = join2(screenshotDir, "screenshots.jsonl");
  if (!existsSync(metaPath)) {
    return {
      output: JSON.stringify({ screenshots: [] }),
      exitCode: 0
    };
  }
  const raw = readFileSync(metaPath, "utf-8").trim();
  if (raw.length === 0) {
    return {
      output: JSON.stringify({ screenshots: [] }),
      exitCode: 0
    };
  }
  const screenshots = raw.split("\n").map((line) => JSON.parse(line)).filter((meta) => existsSync(meta.path));
  return {
    output: JSON.stringify({ screenshots }),
    exitCode: 0
  };
}
export {
  screenshotList as default
};
