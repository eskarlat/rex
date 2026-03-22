import { createRequire } from 'module'; const require = createRequire(import.meta.url);
import {
  getScreenshotDir
} from "../chunks/chunk-L2PPAVNR.js";
import "../chunks/chunk-C3C6F2UY.js";

// src/commands/screenshot-read.ts
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
function isInsideDir(filePath, dir) {
  const resolved = resolve(filePath);
  const resolvedDir = resolve(dir);
  return resolved.startsWith(resolvedDir + "/") || resolved.startsWith(resolvedDir + "\\");
}
function screenshotRead(context) {
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
  if (!existsSync(filePath)) {
    return {
      output: JSON.stringify({ error: `File not found: ${filePath}` }),
      exitCode: 1
    };
  }
  const realPath = realpathSync(filePath);
  if (!isInsideDir(realPath, screenshotDir)) {
    return {
      output: JSON.stringify({ error: "Path must be inside the screenshot directory" }),
      exitCode: 1
    };
  }
  const buffer = readFileSync(filePath);
  const base64 = buffer.toString("base64");
  return {
    output: JSON.stringify({
      dataUrl: `data:image/png;base64,${base64}`
    }),
    exitCode: 0
  };
}
export {
  screenshotRead as default
};
