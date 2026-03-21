import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/commands/screenshot-delete.ts
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join as join2 } from "node:path";

// src/shared/state.ts
import { join } from "node:path";
function getStorageDir(projectPath) {
  return join(projectPath, ".renre-kit", "storage", "renre-devtools");
}
function getScreenshotDir(projectPath) {
  return join(getStorageDir(projectPath), "screenshots");
}

// src/commands/screenshot-delete.ts
function screenshotDelete(context) {
  const filePath = typeof context.args.path === "string" ? context.args.path : null;
  if (!filePath) {
    return {
      output: JSON.stringify({ error: "Missing --path argument" }),
      exitCode: 1
    };
  }
  if (existsSync(filePath)) {
    unlinkSync(filePath);
  }
  const screenshotDir = getScreenshotDir(context.projectPath);
  const metaPath = join2(screenshotDir, "screenshots.jsonl");
  if (existsSync(metaPath)) {
    const raw = readFileSync(metaPath, "utf-8").trim();
    if (raw.length > 0) {
      const entries = raw.split("\n").map((line) => JSON.parse(line)).filter((meta) => meta.path !== filePath);
      writeFileSync(
        metaPath,
        entries.map((e) => JSON.stringify(e)).join("\n") + (entries.length > 0 ? "\n" : "")
      );
    }
  }
  return {
    output: JSON.stringify({ deleted: true, path: filePath }),
    exitCode: 0
  };
}
export {
  screenshotDelete as default
};
