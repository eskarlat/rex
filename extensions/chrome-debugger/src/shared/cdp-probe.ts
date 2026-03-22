/**
 * Lightweight CDP HTTP endpoint probing.
 * Uses the Chrome DevTools Protocol HTTP API to detect externally-running
 * browsers without requiring Puppeteer or WebSocket connections.
 */

export interface CdpTarget {
  description: string;
  devtoolsFrontendUrl: string;
  id: string;
  title: string;
  type: string;
  url: string;
  webSocketDebuggerUrl: string;
}

export interface CdpVersionInfo {
  'Browser': string;
  'Protocol-Version': string;
  'User-Agent': string;
  'V8-Version': string;
  'WebKit-Version': string;
  'webSocketDebuggerUrl': string;
}

/**
 * Probe the CDP HTTP endpoint to discover open tabs/targets.
 * Returns null if the endpoint is unreachable.
 */
export async function probeCdpTargets(port: number): Promise<CdpTarget[] | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`http://127.0.0.1:${String(port)}/json`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) return null;
    return (await response.json()) as CdpTarget[];
  } catch {
    return null;
  }
}

/**
 * Probe the CDP /json/version endpoint to get the browser WebSocket URL.
 * This URL can be used with puppeteer.connect() to attach to the browser.
 * Returns null if the endpoint is unreachable.
 */
export async function probeCdpVersion(port: number): Promise<CdpVersionInfo | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`http://127.0.0.1:${String(port)}/json/version`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) return null;
    return (await response.json()) as CdpVersionInfo;
  } catch {
    return null;
  }
}
