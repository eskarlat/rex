import { join } from 'node:path';

import puppeteer from 'puppeteer';

import {
  readState,
  writeState,
  deleteState,
  getLogDir,
  readGlobalSession,
  writeGlobalSession,
  isProcessAlive,
  deleteGlobalSession,
} from '../shared/state.js';
import type { ExecutionContext, CommandResult, BrowserState } from '../shared/types.js';

function checkExistingLocal(projectPath: string): CommandResult | null {
  const existing = readState(projectPath);
  if (!existing) return null;

  if (!isProcessAlive(existing.pid)) {
    deleteState(projectPath);
    deleteGlobalSession();
    return null;
  }

  return {
    output: [
      '## Browser Already Running',
      '',
      `- **PID**: ${String(existing.pid)}`,
      `- **Port**: ${String(existing.port)}`,
      `- **Launched**: ${existing.launchedAt}`,
      '',
      'Use `chrome-debugger:close` to stop it first.',
    ].join('\n'),
    exitCode: 1,
  };
}

function checkExistingGlobal(): CommandResult | null {
  const globalSession = readGlobalSession();
  if (!globalSession) return null;

  if (!isProcessAlive(globalSession.pid)) {
    deleteGlobalSession();
    return null;
  }

  return {
    output: [
      '## Browser Already Running (another project)',
      '',
      `- **PID**: ${String(globalSession.pid)}`,
      `- **Port**: ${String(globalSession.port)}`,
      `- **Project**: ${globalSession.projectPath}`,
      `- **Launched**: ${globalSession.launchedAt}`,
      '',
      'Only one browser instance is supported. Close it first from the originating project,',
      'or use `chrome-debugger:close` there.',
    ].join('\n'),
    exitCode: 1,
  };
}

function resolvePort(context: ExecutionContext): number {
  if (typeof context.args.port === 'number') return context.args.port;
  if (typeof context.config.port === 'number') return context.config.port;
  return 9222;
}

export default async function launch(context: ExecutionContext): Promise<CommandResult> {
  const localCheck = checkExistingLocal(context.projectPath);
  if (localCheck) return localCheck;

  const globalCheck = checkExistingGlobal();
  if (globalCheck) return globalCheck;

  const headless = context.config.headless === true || context.args.headless === true;
  const port = resolvePort(context);

  const browser = await puppeteer.launch({
    headless,
    ignoreDefaultArgs: ['--enable-automation'],
    args: [
      `--remote-debugging-port=${String(port)}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-infobars',
      '--no-sandbox',
    ],
  });

  const wsEndpoint = browser.wsEndpoint();
  const browserProcess = browser.process();
  const pid = browserProcess?.pid ?? 0;

  const logDir = getLogDir(context.projectPath);
  const networkLogPath = join(logDir, 'network.jsonl');
  const consoleLogPath = join(logDir, 'console.jsonl');
  const now = new Date().toISOString();

  const browserState: BrowserState = {
    wsEndpoint,
    pid,
    port,
    launchedAt: now,
    networkLogPath,
    consoleLogPath,
  };

  writeState(context.projectPath, browserState);

  writeGlobalSession({
    wsEndpoint,
    pid,
    port,
    projectPath: context.projectPath,
    launchedAt: now,
    lastSeenAt: now,
    headless,
    networkLogPath,
    consoleLogPath,
  });

  // Disconnect (don't close) so the browser stays alive.
  // Network/console monitoring is attached on reconnect (see connection.ts).
  void browser.disconnect();

  return {
    output: [
      '## Browser Launched',
      '',
      `- **Mode**: ${headless ? 'headless' : 'headed (visible)'}`,
      `- **Port**: ${String(port)}`,
      `- **PID**: ${String(pid)}`,
      `- **WebSocket**: \`${wsEndpoint}\``,
      '',
      'Ready for commands. Use `chrome-debugger:navigate --url <url>` to get started.',
    ].join('\n'),
    exitCode: 0,
  };
}

