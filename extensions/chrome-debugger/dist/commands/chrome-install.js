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

// src/commands/chrome-install.ts
async function chromeInstall(_context) {
  try {
    const browser = await puppeteer_default.launch({ headless: true });
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
