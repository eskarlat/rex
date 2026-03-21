import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/commands/chrome-install.ts
import puppeteer from "puppeteer";
async function chromeInstall(_context) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const path = browser.process()?.spawnfile ?? "unknown";
    await browser.close();
    return {
      output: JSON.stringify({
        installed: true,
        path
      }),
      exitCode: 0
    };
  } catch (error) {
    return {
      output: JSON.stringify({
        installed: false,
        error: error instanceof Error ? error.message : String(error)
      }),
      exitCode: 1
    };
  }
}
export {
  chromeInstall as default
};
