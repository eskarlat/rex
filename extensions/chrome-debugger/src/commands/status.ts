import { defineCommand } from '@renre-kit/extension-sdk/node';

import type { CdpTarget } from '../shared/cdp-probe.js';
import { probeCdpTargets } from '../shared/cdp-probe.js';
import {
  readState,
  readGlobalSession,
  deleteState,
  deleteGlobalSession,
  isProcessAlive,
} from '../shared/state.js';

function resolvePort(args: Record<string, unknown>, config: Record<string, unknown>): number {
  if (typeof args.port === 'number') return args.port;
  if (typeof config.port === 'number') return config.port;
  return 9222;
}

function targetsToTabs(targets: CdpTarget[]): { index: number; title: string; url: string }[] {
  return targets
    .filter((t) => t.type === 'page')
    .map((page, index) => ({ index, title: page.title, url: page.url }));
}

function cleanupStaleState(projectPath: string): void {
  const localState = readState(projectPath);
  const globalSession = readGlobalSession();
  if (localState) deleteState(projectPath);
  if (globalSession) deleteGlobalSession();
}

function jsonResult(data: Record<string, unknown>): { output: string; exitCode: number } {
  return { output: JSON.stringify(data), exitCode: 0 };
}

export default defineCommand({
  handler: async (ctx) => {
    const localState = readState(ctx.projectPath);
    const globalSession = readGlobalSession();
    const port = resolvePort(ctx.args, ctx.config);
    const state = localState ?? globalSession;

    if (state && isProcessAlive(state.pid)) {
      const targets = await probeCdpTargets(state.port);
      if (targets) {
        const tabs = targetsToTabs(targets);
        return jsonResult({
          running: true,
          pid: state.pid,
          port: state.port,
          launchedAt: state.launchedAt,
          tabCount: tabs.length,
          tabs,
          ...(globalSession ? { projectPath: globalSession.projectPath, headless: globalSession.headless } : {}),
        });
      }
      // Process alive but CDP unreachable — stale
      cleanupStaleState(ctx.projectPath);
    } else if (state) {
      cleanupStaleState(ctx.projectPath);
    }

    // No managed browser — probe for an externally-running browser on the CDP port
    const targets = await probeCdpTargets(port);
    if (targets) {
      const tabs = targetsToTabs(targets);
      return jsonResult({ running: true, external: true, port, tabCount: tabs.length, tabs });
    }

    return jsonResult({ running: false });
  },
});
