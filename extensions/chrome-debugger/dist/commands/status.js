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
import {
  deleteGlobalSession,
  deleteState,
  isProcessAlive,
  readGlobalSession,
  readState
} from "../chunks/chunk-L2PPAVNR.js";
import "../chunks/chunk-C3C6F2UY.js";

// src/commands/status.ts
async function status(context) {
  const localState = readState(context.projectPath);
  const globalSession = readGlobalSession();
  const state = localState ?? globalSession;
  if (!state) {
    return {
      output: JSON.stringify({ running: false }),
      exitCode: 0
    };
  }
  if (!isProcessAlive(state.pid)) {
    if (localState) deleteState(context.projectPath);
    if (globalSession) deleteGlobalSession();
    return {
      output: JSON.stringify({ running: false, staleSessionCleaned: true }),
      exitCode: 0
    };
  }
  try {
    const browser = await puppeteer_default.connect({ browserWSEndpoint: state.wsEndpoint });
    const pages = await browser.pages();
    const tabs = await Promise.all(
      pages.map(async (page, index) => ({
        index,
        title: await page.title(),
        url: page.url()
      }))
    );
    void browser.disconnect();
    const result = {
      running: true,
      pid: state.pid,
      port: state.port,
      launchedAt: state.launchedAt,
      tabCount: tabs.length,
      tabs,
      ...globalSession ? { projectPath: globalSession.projectPath, headless: globalSession.headless } : {}
    };
    return {
      output: JSON.stringify(result),
      exitCode: 0
    };
  } catch {
    if (localState) deleteState(context.projectPath);
    if (globalSession) deleteGlobalSession();
    return {
      output: JSON.stringify({ running: false, staleSessionCleaned: true }),
      exitCode: 0
    };
  }
}
export {
  status as default
};
