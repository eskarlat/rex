import puppeteer from 'puppeteer';

import {
  readState,
  readGlobalSession,
  deleteGlobalSession,
  isProcessAlive,
} from '../shared/state.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

export default async function status(context: ExecutionContext): Promise<CommandResult> {
  // Try per-project state first
  const localState = readState(context.projectPath);
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
    deleteGlobalSession();
    return {
      output: JSON.stringify({ running: false, staleSessionCleaned: true }),
      exitCode: 0,
    };
  }

  // Try to connect and get tab info
  try {
    const browser = await puppeteer.connect({ browserWSEndpoint: state.wsEndpoint });
    const pages = await browser.pages();
    const tabs = pages.map((page, index) => ({
      index,
      title: page.url(),
      url: page.url(),
    }));
    void browser.disconnect();

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
    deleteGlobalSession();
    return {
      output: JSON.stringify({ running: false, staleSessionCleaned: true }),
      exitCode: 0,
    };
  }
}
