import { existsSync } from 'node:fs';
import { platform } from 'node:os';

import puppeteer from 'puppeteer';

import type { ExecutionContext, CommandResult } from '../shared/types.js';

const SYSTEM_CHROME_PATHS: Record<string, string[]> = {
  linux: ['/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium'],
  darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'],
  win32: [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ],
};

export default function chromeCheck(_context: ExecutionContext): CommandResult {
  // 1. Check Puppeteer bundled Chromium
  try {
    const bundledPath = puppeteer.executablePath();
    if (existsSync(bundledPath)) {
      return {
        output: JSON.stringify({
          found: true,
          path: bundledPath,
          source: 'puppeteer',
        }),
        exitCode: 0,
      };
    }
  } catch {
    // executablePath() can throw if no browser is installed
  }

  // 2. Check system Chrome
  const os = platform();
  const paths = SYSTEM_CHROME_PATHS[os] ?? [];
  for (const chromePath of paths) {
    if (existsSync(chromePath)) {
      return {
        output: JSON.stringify({
          found: true,
          path: chromePath,
          source: 'system',
        }),
        exitCode: 0,
      };
    }
  }

  // 3. Not found
  return {
    output: JSON.stringify({
      found: false,
      canInstall: true,
    }),
    exitCode: 0,
  };
}
