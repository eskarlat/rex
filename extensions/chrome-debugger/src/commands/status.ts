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

function targetsToTabs(targets: CdpTarget[]): { index: number; title: string; url: string }[] {
  return targets
    .filter((t) => t.type === 'page')
    .map((page, index) => ({ index, title: page.title, url: page.url }));
}

function jsonResult(data: Record<string, unknown>): { output: string; exitCode: number } {
  return { output: JSON.stringify(data), exitCode: 0 };
}

function cleanupStaleSession(
  projectPath: string,
  localState: unknown,
  globalSession: unknown,
): { output: string; exitCode: number } {
  if (localState) deleteState(projectPath);
  if (globalSession) deleteGlobalSession();
  return jsonResult({ running: false, staleSessionCleaned: true });
}

function isSessionAlive(pid: number): boolean {
  // PID 0 means external browser connected via chrome-debugger:connect — skip OS check
  return pid === 0 || isProcessAlive(pid);
}

function buildActiveStatus(
  state: { pid: number; port: number; launchedAt: string },
  tabs: { index: number; title: string; url: string }[],
  globalSession: Record<string, unknown> | null,
  localState: unknown,
): Record<string, unknown> {
  return {
    running: true,
    ...(state.pid === 0 ? { external: true } : {}),
    pid: state.pid,
    port: state.port,
    launchedAt: state.launchedAt,
    tabCount: tabs.length,
    tabs,
    ...(globalSession && !localState
      ? { projectPath: globalSession.projectPath, headless: globalSession.headless }
      : {}),
  };
}

export default defineCommand({
  handler: async (ctx) => {
    const localState = readState(ctx.projectPath);
    const globalSession = readGlobalSession();
    const state = localState ?? globalSession;

    if (!state) {
      return jsonResult({ running: false });
    }

    if (!isSessionAlive(state.pid)) {
      return cleanupStaleSession(ctx.projectPath, localState, globalSession);
    }

    const targets = await probeCdpTargets(state.port);
    if (targets) {
      return jsonResult(buildActiveStatus(state, targetsToTabs(targets), globalSession, localState));
    }

    return cleanupStaleSession(ctx.projectPath, localState, globalSession);
  },
});
