import { createRequire } from 'module'; const require = createRequire(import.meta.url);
import {
  getScreenshotDir
} from "../chunks/chunk-L2PPAVNR.js";
import "../chunks/chunk-C3C6F2UY.js";

// src/commands/screenshot-list.ts
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
function screenshotList(context) {
  const screenshotDir = getScreenshotDir(context.projectPath);
  const metaPath = join(screenshotDir, "screenshots.jsonl");
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
