import { createRequire } from 'module'; const require = createRequire(import.meta.url);
import {
  puppeteer_default
} from "../chunks/chunk-AT5YMNYW.js";
import "../chunks/chunk-YGOXEHOS.js";
import "../chunks/chunk-A7XEC37O.js";
import "../chunks/chunk-ICGADTKU.js";
import "../chunks/chunk-WWTA3VPD.js";
import "../chunks/chunk-FOU2EXQ2.js";
import "../chunks/chunk-LOYEZFXG.js";
import "../chunks/chunk-AWU4Q6CL.js";
import "../chunks/chunk-BF5SUUWU.js";
import "../chunks/chunk-C3C6F2UY.js";

// src/commands/chrome-check.ts
import { existsSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";
function getWindowsChromePaths() {
  const localAppData = process.env.LOCALAPPDATA ?? join(homedir(), "AppData", "Local");
  return [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    join(localAppData, "Google", "Chrome", "Application", "chrome.exe"),
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
  ];
}
var SYSTEM_CHROME_PATHS = {
  linux: [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/usr/local/bin/google-chrome",
    "/usr/local/bin/chromium",
    "/snap/bin/chromium"
  ],
  darwin: [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
  ],
  win32: getWindowsChromePaths()
};
function chromeCheck(_context) {
  try {
    const bundledPath = puppeteer_default.executablePath();
    if (existsSync(bundledPath)) {
      return {
        output: JSON.stringify({
          found: true,
          path: bundledPath,
          source: "puppeteer"
        }),
        exitCode: 0
      };
    }
  } catch {
  }
  const os = platform();
  const paths = SYSTEM_CHROME_PATHS[os] ?? [];
  for (const chromePath of paths) {
    if (existsSync(chromePath)) {
      return {
        output: JSON.stringify({
          found: true,
          path: chromePath,
          source: "system"
        }),
        exitCode: 0
      };
    }
  }
  return {
    output: JSON.stringify({
      found: false,
      canInstall: true
    }),
    exitCode: 0
  };
}
export {
  chromeCheck as default
};
