import { join } from 'node:path';

import puppeteer from 'puppeteer';
import { defineCommand, z } from '@renre-kit/extension-sdk/node';

import { probeCdpVersion, probeCdpTargets } from '../shared/cdp-probe.js';
import {
  readState,
  writeState,
  getLogDir,
  readGlobalSession,
  writeGlobalSession,
  isProcessAlive,
} from '../shared/state.js';
import type { BrowserState, GlobalBrowserSession } from '../shared/types.js';

function checkExistingBrowser(projectPath: string): string | null {
  const local = readState(projectPath);
  if (local && isProcessAlive(local.pid)) {
    return `A managed browser is already running (PID: ${String(local.pid)}). Use \`chrome-debugger:close\` first.`;
  }
  const global = readGlobalSession();
  if (global && isProcessAlive(global.pid)) {
    return `A managed browser is already running (PID: ${String(global.pid)}, project: ${global.projectPath}). Use \`chrome-debugger:close\` first.`;
  }
  return null;
}

function formatTabSummary(targets: { title: string; url: string }[]): string[] {
  const lines = targets.slice(0, 5).map((t, i) => `  ${String(i)}. ${t.title || '(untitled)'} — ${t.url}`);
  if (targets.length > 5) lines.push(`  ... and ${String(targets.length - 5)} more`);
  return lines;
}

function resolvePort(args: Record<string, unknown>, config: Record<string, unknown>): number {
  if (typeof args.port === 'number') return args.port;
  if (typeof config.port === 'number') return config.port;
  return 9222;
}

export default defineCommand({
  args: {
    port: z.number().default(9222),
  },
  handler: async (ctx) => {
    const conflict = checkExistingBrowser(ctx.projectPath);
    if (conflict) {
      return { output: `## Already Connected\n\n${conflict}`, exitCode: 1 };
    }

    const port = resolvePort(ctx.args, ctx.config);
    const versionInfo = await probeCdpVersion(port);
    if (!versionInfo) {
      return {
        output: `## No Browser Found\n\nNo browser detected on CDP port ${String(port)}.\nMake sure Chrome is running with \`--remote-debugging-port=${String(port)}\`.`,
        exitCode: 1,
      };
    }

    const wsUrl = versionInfo.webSocketDebuggerUrl;
    const browser = await puppeteer.connect({ browserWSEndpoint: wsUrl });
    const tabCount = (await browser.pages()).length;
    void browser.disconnect();

    const targets = await probeCdpTargets(port);
    const pageTargets = (targets ?? []).filter((t) => t.type === 'page');

    const logDir = getLogDir(ctx.projectPath);
    const now = new Date().toISOString();

    const state: BrowserState = {
      wsEndpoint: wsUrl, pid: 0, port,
      launchedAt: now,
      networkLogPath: join(logDir, 'network.jsonl'),
      consoleLogPath: join(logDir, 'console.jsonl'),
    };
    writeState(ctx.projectPath, state);

    const session: GlobalBrowserSession = {
      ...state, projectPath: ctx.projectPath,
      lastSeenAt: now, headless: false,
    };
    writeGlobalSession(session);

    const tabLines = formatTabSummary(pageTargets);

    return {
      output: [
        '## Connected to External Browser',
        '',
        `- **Browser**: ${versionInfo.Browser}`,
        `- **Port**: ${String(port)}`,
        `- **WebSocket**: \`${wsUrl}\``,
        `- **Tabs**: ${String(tabCount)}`,
        '',
        ...(tabLines.length > 0 ? ['**Open tabs:**', ...tabLines, ''] : []),
        'All chrome-debugger commands are now available.',
        'Use `chrome-debugger:close` to disconnect (this will NOT close the external browser).',
      ].join('\n'),
      exitCode: 0,
    };
  },
});
