import { defineCommand } from '@renre-kit/extension-sdk/node';

import {
  readState,
  readGlobalSession,
  deleteState,
  deleteGlobalSession,
  isProcessAlive,
} from '../shared/state.js';

interface CdpTabInfo {
  title: string;
  url: string;
  type: string;
}

/**
 * Fetches open tabs via the Chrome DevTools Protocol HTTP endpoint.
 * This avoids a full WebSocket connection (puppeteer.connect) which
 * causes the browser window to blink/flash on every poll.
 */
async function fetchTabsViaHttp(port: number): Promise<CdpTabInfo[]> {
  const response = await fetch(`http://127.0.0.1:${String(port)}/json`);
  if (!response.ok) {
    throw new Error(`CDP HTTP request failed: ${String(response.status)}`);
  }
  const targets = (await response.json()) as CdpTabInfo[];
  return targets.filter((t) => t.type === 'page');
}

export default defineCommand({
  handler: async (ctx) => {
    // Try per-project state first
    const localState = readState(ctx.projectPath);
    const globalSession = readGlobalSession();

    const state = localState ?? globalSession;
    if (!state) {
      return {
        output: JSON.stringify({ running: false }),
        exitCode: 0,
      };
    }

    // Check if PID is still alive
    if (!isProcessAlive(state.pid)) {
      if (localState) deleteState(ctx.projectPath);
      if (globalSession) deleteGlobalSession();
      return {
        output: JSON.stringify({ running: false, staleSessionCleaned: true }),
        exitCode: 0,
      };
    }

    // Use the lightweight CDP HTTP endpoint instead of puppeteer.connect()
    // to avoid browser window blinking on every status poll
    try {
      const pages = await fetchTabsViaHttp(state.port);
      const tabs = pages.map((page, index) => ({
        index,
        title: page.title,
        url: page.url,
      }));

      const result = {
        running: true,
        pid: state.pid,
        port: state.port,
        launchedAt: state.launchedAt,
        tabCount: tabs.length,
        tabs,
        ...(globalSession ? { projectPath: globalSession.projectPath, headless: globalSession.headless } : {}),
      };

      return {
        output: JSON.stringify(result),
        exitCode: 0,
      };
    } catch {
      // Process alive but can't connect — stale
      if (localState) deleteState(ctx.projectPath);
      if (globalSession) deleteGlobalSession();
      return {
        output: JSON.stringify({ running: false, staleSessionCleaned: true }),
        exitCode: 0,
      };
    }
  },
});
