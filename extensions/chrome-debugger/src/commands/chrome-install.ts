import puppeteer from 'puppeteer';

import type { ExecutionContext, CommandResult } from '../shared/types.js';

export default async function chromeInstall(_context: ExecutionContext): Promise<CommandResult> {
  try {
    // Puppeteer downloads Chromium to its cache on launch if missing.
    // We launch headless and immediately close to trigger the download.
    const browser = await puppeteer.launch({ headless: true });
    const path = browser.process()?.spawnfile ?? 'unknown';
    await browser.close();

    return {
      output: JSON.stringify({
        installed: true,
        path,
      }),
      exitCode: 0,
    };
  } catch (error) {
    return {
      output: JSON.stringify({
        installed: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      exitCode: 1,
    };
  }
}
