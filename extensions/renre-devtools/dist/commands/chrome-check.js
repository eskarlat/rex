import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/commands/chrome-check.ts
import { existsSync } from "node:fs";
import { platform } from "node:os";
import puppeteer from "puppeteer";
var SYSTEM_CHROME_PATHS = {
  linux: ["/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium"],
  darwin: ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"],
  win32: [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
  ]
};
function chromeCheck(_context) {
  try {
    const bundledPath = puppeteer.executablePath();
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
