import puppeteer from 'puppeteer';
import { join } from 'node:path';
import { readState, writeState, getLogDir } from '../shared/state.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

export default async function launch(context: ExecutionContext): Promise<CommandResult> {
  const existing = readState(context.projectPath);
  if (existing) {
    return {
      output: [
        '## Browser Already Running',
        '',
        `- **PID**: ${String(existing.pid)}`,
        `- **Port**: ${String(existing.port)}`,
        `- **Launched**: ${existing.launchedAt}`,
        '',
        'Use `renre-devtools:close` to stop it first.',
      ].join('\n'),
      exitCode: 1,
    };
  }

  const headless = context.config.headless === true || context.args.headless === true;
  const port =
    typeof context.args.port === 'number'
      ? context.args.port
      : typeof context.config.port === 'number'
        ? context.config.port
        : 9222;

  const browser = await puppeteer.launch({
    headless,
    args: [
      `--remote-debugging-port=${String(port)}`,
      '--no-first-run',
      '--no-default-browser-check',
    ],
  });

  const wsEndpoint = browser.wsEndpoint();
  const process = browser.process();
  const pid = process?.pid ?? 0;

  const logDir = getLogDir(context.projectPath);
  const networkLogPath = join(logDir, 'network.jsonl');
  const consoleLogPath = join(logDir, 'console.jsonl');

  writeState(context.projectPath, {
    wsEndpoint,
    pid,
    port,
    launchedAt: new Date().toISOString(),
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
  browser.on('targetcreated', async (target) => {
    if (target.type() === 'page') {
      const newPage = await target.page();
      if (newPage) {
        await setupPageMonitoring(newPage, networkLogPath, consoleLogPath);
      }
    }
  });

  // Disconnect (don't close) so the browser stays alive
  browser.disconnect();

  return {
    output: [
      '## Browser Launched',
      '',
      `- **Mode**: ${headless ? 'headless' : 'headed (visible)'}`,
      `- **Port**: ${String(port)}`,
      `- **PID**: ${String(pid)}`,
      `- **WebSocket**: \`${wsEndpoint}\``,
      '',
      'Ready for commands. Use `renre-devtools:navigate --url <url>` to get started.',
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
  const { dirname } = await import('node:path');

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
