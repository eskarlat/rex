import { join } from 'node:path';

import puppeteer from 'puppeteer';
import { defineCommand } from '@renre-kit/extension-sdk/node';

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
import type { CommandResult, BrowserState } from '../shared/types.js';

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

function resolvePort(args: Record<string, unknown>, config: Record<string, unknown>): number {
  if (typeof args.port === 'number') return args.port;
  if (typeof config.port === 'number') return config.port;
  return 9222;
}

export default defineCommand({
  handler: async (ctx) => {
    const localCheck = checkExistingLocal(ctx.projectPath);
    if (localCheck) return localCheck;

    const globalCheck = checkExistingGlobal();
    if (globalCheck) return globalCheck;

    const headless = ctx.config.headless === true || ctx.args.headless === true;
    const port = resolvePort(ctx.args, ctx.config);

    const executablePath = process.env['PUPPETEER_EXECUTABLE_PATH'] ?? undefined;

    const browser = await puppeteer.launch({
      headless,
      ...(executablePath ? { executablePath } : {}),
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

    const logDir = getLogDir(ctx.projectPath);
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

    writeState(ctx.projectPath, browserState);

    writeGlobalSession({
      wsEndpoint,
      pid,
      port,
      projectPath: ctx.projectPath,
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
  },
});
