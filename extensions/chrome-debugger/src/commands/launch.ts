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

  // Set up persistent network and console logging on the initial page
  const pages = await browser.pages();
  const page = pages[0];
  if (page) {
    await setupPageMonitoring(page, networkLogPath, consoleLogPath);
  }

  // Monitor new pages (tabs) for network/console too
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

  // Disconnect (don't close) so the browser stays alive
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

async function setupPageMonitoring(
  page: import('puppeteer').Page,
  networkLogPath: string,
  consoleLogPath: string
): Promise<void> {
  const { appendFileSync, existsSync, mkdirSync } = await import('node:fs');
  const nodePath = await import('node:path');

  const dir = nodePath.dirname(networkLogPath);
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
