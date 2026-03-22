import { appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import type { Page, Browser } from 'puppeteer';

/**
 * Track which pages already have monitoring attached (by page target ID)
 * so we don't double-attach listeners on the same page.
 */
const monitoredPages = new WeakSet<Page>();

export async function setupPageMonitoring(
  page: Page,
  networkLogPath: string,
  consoleLogPath: string
): Promise<void> {
  if (monitoredPages.has(page)) return;
  monitoredPages.add(page);

  const dir = dirname(networkLogPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const client = await page.createCDPSession();

  await client.send('Network.enable');
  const pendingRequests = new Map<
    string,
    { method: string; url: string; type: string; startTime: number }
  >();

  client.on('Network.requestWillBeSent', (params) => {
    pendingRequests.set(params.requestId, {
      method: params.request.method,
      url: params.request.url,
      type: params.type ?? 'Other',
      startTime: params.timestamp,
    });
  });

  client.on('Network.responseReceived', (params) => {
    const req = pendingRequests.get(params.requestId);
    if (!req) return;
    pendingRequests.delete(params.requestId);

    const entry = JSON.stringify({
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      status: params.response.status,
      type: req.type,
      size: params.response.headers['content-length']
        ? Number(params.response.headers['content-length'])
        : 0,
      duration: Math.round((params.timestamp - req.startTime) * 1000),
    });
    appendFileSync(networkLogPath, entry + '\n');
  });

  await client.send('Runtime.enable');
  client.on('Runtime.consoleAPICalled', (params) => {
    const text = params.args
      .map((arg) => {
        if (arg.value !== undefined) return String(arg.value);
        if (arg.description) return arg.description;
        return arg.type;
      })
      .join(' ');

    const entry = JSON.stringify({
      timestamp: new Date().toISOString(),
      level: params.type,
      text,
    });
    appendFileSync(consoleLogPath, entry + '\n');
  });
}

/**
 * Attach monitoring to all current pages and future pages in the browser.
 */
export async function setupBrowserMonitoring(
  browser: Browser,
  networkLogPath: string,
  consoleLogPath: string
): Promise<void> {
  // Monitor all existing pages
  const pages = await browser.pages();
  for (const page of pages) {
    await setupPageMonitoring(page, networkLogPath, consoleLogPath);
  }

  // Monitor new pages (tabs) as they open
  browser.on('targetcreated', (target) => {
    const targetType: string = target.type();
    if (targetType === 'page') {
      void target.page().then((newPage) => {
        if (newPage) {
          void setupPageMonitoring(newPage, networkLogPath, consoleLogPath);
        }
      });
    }
  });
}
