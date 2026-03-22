import { existsSync } from 'node:fs';
import { homedir, platform } from 'node:os';
import { join } from 'node:path';

import puppeteer from 'puppeteer';
import { defineCommand } from '@renre-kit/extension-sdk/node';

import { probeCdpVersion } from '../shared/cdp-probe.js';

function getWindowsChromePaths(): string[] {
  const localAppData = process.env.LOCALAPPDATA ?? join(homedir(), 'AppData', 'Local');
  return [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
}

const SYSTEM_CHROME_PATHS: Record<string, string[]> = {
  linux: [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/usr/local/bin/google-chrome',
    '/usr/local/bin/chromium',
    '/snap/bin/chromium',
  ],
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  ],
  win32: getWindowsChromePaths(),
};

function resolvePort(args: Record<string, unknown>, config: Record<string, unknown>): number {
  if (typeof args.port === 'number') return args.port;
  if (typeof config.port === 'number') return config.port;
  return 9222;
}

export default defineCommand({
  handler: async (ctx) => {
    const port = resolvePort(ctx.args, ctx.config);

    // 0. Check if a browser is already running on the CDP port
    const versionInfo = await probeCdpVersion(port);
    if (versionInfo) {
      return {
        output: JSON.stringify({
          found: true,
          source: 'cdp',
          cdpRunning: true,
          port,
          browser: versionInfo.Browser,
          wsUrl: versionInfo.webSocketDebuggerUrl,
        }),
        exitCode: 0,
      };
    }

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
  },
});
