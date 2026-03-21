import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Browser, Page } from 'puppeteer';

const { mockConnect, mockEnsure } = vi.hoisted(() => ({
  mockConnect: vi.fn(),
  mockEnsure: vi.fn(),
}));

vi.mock('puppeteer', () => ({
  default: { connect: mockConnect },
}));

vi.mock('./state.js', () => ({
  ensureBrowserRunning: mockEnsure,
}));

import { connectBrowser, getActivePage, getPageByIndex, withBrowser } from './connection.js';

const mockDisconnect = vi.fn();
const mockPages = vi.fn();

function makeBrowser(): Browser {
  return { pages: mockPages, disconnect: mockDisconnect } as unknown as Browser;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockEnsure.mockReturnValue({ wsEndpoint: 'ws://localhost:9222' });
});

describe('connectBrowser', () => {
  it('connects using state wsEndpoint', async () => {
    const browser = makeBrowser();
    mockConnect.mockResolvedValue(browser);
    const result = await connectBrowser('/tmp/test');
    expect(mockConnect).toHaveBeenCalledWith({ browserWSEndpoint: 'ws://localhost:9222' });
    expect(result).toBe(browser);
  });
});

describe('getActivePage', () => {
  it('returns the last page', async () => {
    const page1 = { url: () => 'a' } as unknown as Page;
    const page2 = { url: () => 'b' } as unknown as Page;
    const browser = makeBrowser();
    mockPages.mockResolvedValue([page1, page2]);
    const result = await getActivePage(browser);
    expect(result).toBe(page2);
  });

  it('throws when no pages', async () => {
    const browser = makeBrowser();
    mockPages.mockResolvedValue([]);
    await expect(getActivePage(browser)).rejects.toThrow('No open tabs');
  });
});

describe('getPageByIndex', () => {
  it('returns page at index', async () => {
    const page = { url: () => 'x' } as unknown as Page;
    const browser = makeBrowser();
    mockPages.mockResolvedValue([page]);
    const result = await getPageByIndex(browser, 0);
    expect(result).toBe(page);
  });

  it('throws for out-of-range index', async () => {
    const browser = makeBrowser();
    mockPages.mockResolvedValue([]);
    await expect(getPageByIndex(browser, 5)).rejects.toThrow('out of range');
  });
});

describe('withBrowser', () => {
  it('calls fn with browser and page, then disconnects', async () => {
    const page = { url: () => 'test' } as unknown as Page;
    const browser = makeBrowser();
    mockConnect.mockResolvedValue(browser);
    mockPages.mockResolvedValue([page]);

    const fn = vi.fn().mockResolvedValue('result');
    const result = await withBrowser('/tmp/test', fn);

    expect(result).toBe('result');
    expect(fn).toHaveBeenCalledWith(browser, page);
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('disconnects even on error', async () => {
    const page = { url: () => 'test' } as unknown as Page;
    const browser = makeBrowser();
    mockConnect.mockResolvedValue(browser);
    mockPages.mockResolvedValue([page]);

    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    await expect(withBrowser('/tmp/test', fn)).rejects.toThrow('fail');
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
