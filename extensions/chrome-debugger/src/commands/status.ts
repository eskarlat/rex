import puppeteer from 'puppeteer';

import {
  readState,
  readGlobalSession,
  deleteState,
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
    if (localState) deleteState(context.projectPath);
    if (globalSession) deleteGlobalSession();
    return {
      output: JSON.stringify({ running: false, staleSessionCleaned: true }),
      exitCode: 0,
    };
  }

  // Try to connect and get tab info
  try {
    const browser = await puppeteer.connect({ browserWSEndpoint: state.wsEndpoint });
    const pages = await browser.pages();
    const tabs = await Promise.all(
      pages.map(async (page, index) => ({
        index,
        title: await page.title(),
        url: page.url(),
      }))
    );
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
    if (localState) deleteState(context.projectPath);
    if (globalSession) deleteGlobalSession();
    return {
      output: JSON.stringify({ running: false, staleSessionCleaned: true }),
      exitCode: 0,
    };
  }
}
