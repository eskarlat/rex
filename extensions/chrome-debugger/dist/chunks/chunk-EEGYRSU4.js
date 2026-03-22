import { createRequire } from 'module'; const require = createRequire(import.meta.url);
import {
  puppeteer_default
} from "./chunk-AT5YMNYW.js";
import {
  ensureBrowserRunning
} from "./chunk-L2PPAVNR.js";

// src/shared/connection.ts
async function connectBrowser(projectPath) {
  const state = ensureBrowserRunning(projectPath);
  return puppeteer_default.connect({ browserWSEndpoint: state.wsEndpoint });
}
async function getActivePage(browser) {
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  if (!page) {
    throw new Error("No open tabs found in browser");
  }
  return page;
}
async function getPageByIndex(browser, index) {
  const pages = await browser.pages();
  const page = pages[index];
  if (!page) {
    throw new Error(`Tab index ${String(index)} out of range (${String(pages.length)} tabs open)`);
  }
  return page;
}
async function withBrowser(projectPath, fn) {
  const browser = await connectBrowser(projectPath);
  try {
    const page = await getActivePage(browser);
    return await fn(browser, page);
  } finally {
    void browser.disconnect();
  }
}

export {
  connectBrowser,
  getActivePage,
  getPageByIndex,
  withBrowser
};
