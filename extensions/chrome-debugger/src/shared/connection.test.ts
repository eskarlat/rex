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

import {
  connectBrowser,
  disconnectCachedBrowser,
  getActivePage,
  getPageByIndex,
  withBrowser,
} from './connection.js';

const mockDisconnect = vi.fn();
const mockPages = vi.fn();
const mockOn = vi.fn();

function makeBrowser(connected = true): Browser {
  return {
    pages: mockPages,
    disconnect: mockDisconnect,
    on: mockOn,
    connected,
  } as unknown as Browser;
}

beforeEach(() => {
  // Reset cached connection before clearing mocks so disconnect mock is callable
  disconnectCachedBrowser();
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

  it('reuses cached connection on subsequent calls', async () => {
    const browser = makeBrowser();
    mockConnect.mockResolvedValue(browser);

    const first = await connectBrowser('/tmp/test');
    const second = await connectBrowser('/tmp/test');

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
  });

  it('reconnects when cached browser is disconnected', async () => {
    const browser1 = makeBrowser(true);
    const browser2 = makeBrowser(true);
    mockConnect.mockResolvedValueOnce(browser1).mockResolvedValueOnce(browser2);

    await connectBrowser('/tmp/test');

    // Simulate disconnection
    Object.defineProperty(browser1, 'connected', { value: false });

    const result = await connectBrowser('/tmp/test');
    expect(mockConnect).toHaveBeenCalledTimes(2);
    expect(result).toBe(browser2);
  });

  it('reconnects when endpoint changes', async () => {
    const browser1 = makeBrowser();
    const browser2 = makeBrowser();
    mockConnect.mockResolvedValueOnce(browser1).mockResolvedValueOnce(browser2);

    await connectBrowser('/tmp/test');

    mockEnsure.mockReturnValue({ wsEndpoint: 'ws://localhost:9333' });
    const result = await connectBrowser('/tmp/test');

    expect(mockConnect).toHaveBeenCalledTimes(2);
    expect(result).toBe(browser2);
  });

  it('registers disconnected listener to clear cache', async () => {
    const browser = makeBrowser();
    mockConnect.mockResolvedValue(browser);

    await connectBrowser('/tmp/test');
    expect(mockOn).toHaveBeenCalledWith('disconnected', expect.any(Function));
  });
});

describe('disconnectCachedBrowser', () => {
  it('disconnects and clears cached browser', async () => {
    const browser = makeBrowser();
    mockConnect.mockResolvedValue(browser);

    await connectBrowser('/tmp/test');
    disconnectCachedBrowser();

    expect(mockDisconnect).toHaveBeenCalled();

    // Next call should reconnect
    mockConnect.mockResolvedValue(makeBrowser());
    await connectBrowser('/tmp/test');
    expect(mockConnect).toHaveBeenCalledTimes(2);
  });

  it('does nothing when no cached browser exists', () => {
    expect(() => disconnectCachedBrowser()).not.toThrow();
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
  it('calls fn with browser and page without disconnecting', async () => {
    const page = { url: () => 'test' } as unknown as Page;
    const browser = makeBrowser();
    mockConnect.mockResolvedValue(browser);
    mockPages.mockResolvedValue([page]);

    const fn = vi.fn().mockResolvedValue('result');
    const result = await withBrowser('/tmp/test', fn);

    expect(result).toBe('result');
    expect(fn).toHaveBeenCalledWith(browser, page);
    // Should NOT disconnect — connection is cached for reuse
    expect(mockDisconnect).not.toHaveBeenCalled();
  });

  it('does not disconnect on error (connection stays cached)', async () => {
    const page = { url: () => 'test' } as unknown as Page;
    const browser = makeBrowser();
    mockConnect.mockResolvedValue(browser);
    mockPages.mockResolvedValue([page]);

    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    await expect(withBrowser('/tmp/test', fn)).rejects.toThrow('fail');
    expect(mockDisconnect).not.toHaveBeenCalled();
  });
});
