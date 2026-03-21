import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/commands/screenshot-delete.ts
import { existsSync, readFileSync, realpathSync, unlinkSync, writeFileSync } from "node:fs";
import { join as join2, resolve } from "node:path";

// src/shared/state.ts
import { join } from "node:path";
function getStorageDir(projectPath) {
  return join(projectPath, ".renre-kit", "storage", "chrome-debugger");
}
function getScreenshotDir(projectPath) {
  return join(getStorageDir(projectPath), "screenshots");
}

// src/commands/screenshot-delete.ts
function isInsideDir(filePath, dir) {
  const resolved = resolve(filePath);
  const resolvedDir = resolve(dir);
  return resolved.startsWith(resolvedDir + "/") || resolved.startsWith(resolvedDir + "\\");
}
function screenshotDelete(context) {
  const filePath = typeof context.args.path === "string" ? context.args.path : null;
  if (!filePath) {
    return {
      output: JSON.stringify({ error: "Missing --path argument" }),
      exitCode: 1
    };
  }
  const screenshotDir = getScreenshotDir(context.projectPath);
  if (!isInsideDir(filePath, screenshotDir)) {
    return {
      output: JSON.stringify({ error: "Path must be inside the screenshot directory" }),
      exitCode: 1
    };
  }
  if (existsSync(filePath)) {
    const realPath = realpathSync(filePath);
    if (!isInsideDir(realPath, screenshotDir)) {
      return {
        output: JSON.stringify({ error: "Path must be inside the screenshot directory" }),
        exitCode: 1
      };
    }
    unlinkSync(filePath);
  }
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
