import puppeteer from 'puppeteer';
import type { Browser, Page } from 'puppeteer';

import { ensureBrowserRunning } from './state.js';

export async function connectBrowser(projectPath: string): Promise<Browser> {
  const state = ensureBrowserRunning(projectPath);
  return puppeteer.connect({ browserWSEndpoint: state.wsEndpoint });
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
  try {
    const page = await getActivePage(browser);
    return await fn(browser, page);
  } finally {
    void browser.disconnect();
  }
}
