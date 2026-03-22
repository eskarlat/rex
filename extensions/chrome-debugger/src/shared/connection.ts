import puppeteer from 'puppeteer';
import type { Browser, Page } from 'puppeteer';

import { setupBrowserMonitoring } from './monitoring.js';
import { ensureBrowserRunning } from './state.js';

const browserCache = new Map<string, Browser>();

export async function connectBrowser(projectPath: string): Promise<Browser> {
  const state = ensureBrowserRunning(projectPath);
  const endpoint = state.wsEndpoint;

  const cached = browserCache.get(endpoint);
  if (cached?.connected) {
    return cached;
  }

  // Stale entry — remove it
  if (cached) {
    browserCache.delete(endpoint);
  }

  const browser = await puppeteer.connect({ browserWSEndpoint: endpoint });
  browserCache.set(endpoint, browser);

  browser.on('disconnected', () => {
    if (browserCache.get(endpoint) === browser) {
      browserCache.delete(endpoint);
    }
  });

  // Best-effort: attach network/console monitoring so requests are logged to disk.
  // This may fail in unit-test environments where the browser is a mock.
  try {
    await setupBrowserMonitoring(browser, state.networkLogPath, state.consoleLogPath);
  } catch {
    // Monitoring is non-critical — connection still works without it
  }

  return browser;
}

export function disconnectCachedBrowser(): void {
  for (const [endpoint, browser] of browserCache) {
    browserCache.delete(endpoint);
    void browser.disconnect();
  }
}

export async function getActivePage(browser: Browser): Promise<Page> {
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  if (!page) {
    throw new Error('No open tabs found in browser');
  }
  return page;
}

export async function getPageByIndex(browser: Browser, index: number): Promise<Page> {
  const pages = await browser.pages();
  const page = pages[index];
  if (!page) {
    throw new Error(`Tab index ${String(index)} out of range (${String(pages.length)} tabs open)`);
  }
  return page;
}

export async function withBrowser<T>(
  projectPath: string,
  fn: (browser: Browser, page: Page) => Promise<T>
): Promise<T> {
  const browser = await connectBrowser(projectPath);
  const page = await getActivePage(browser);
  return fn(browser, page);
}
