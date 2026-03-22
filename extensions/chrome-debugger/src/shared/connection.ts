import puppeteer from 'puppeteer';
import type { Browser, Page } from 'puppeteer';

import { ensureBrowserRunning } from './state.js';

let cachedBrowser: Browser | null = null;
let cachedEndpoint: string | null = null;

function isConnected(browser: Browser): boolean {
  return browser.connected;
}

export async function connectBrowser(projectPath: string): Promise<Browser> {
  const state = ensureBrowserRunning(projectPath);

  if (cachedBrowser && cachedEndpoint === state.wsEndpoint && isConnected(cachedBrowser)) {
    return cachedBrowser;
  }

  // Endpoint changed or connection dropped — reconnect
  if (cachedBrowser) {
    try {
      cachedBrowser.disconnect();
    } catch {
      // Already disconnected
    }
  }

  const browser = await puppeteer.connect({ browserWSEndpoint: state.wsEndpoint });
  cachedBrowser = browser;
  cachedEndpoint = state.wsEndpoint;

  browser.on('disconnected', () => {
    if (cachedBrowser === browser) {
      cachedBrowser = null;
      cachedEndpoint = null;
    }
  });

  return browser;
}

export function disconnectCachedBrowser(): void {
  if (cachedBrowser) {
    try {
      cachedBrowser.disconnect();
    } catch {
      // Already disconnected
    }
    cachedBrowser = null;
    cachedEndpoint = null;
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
