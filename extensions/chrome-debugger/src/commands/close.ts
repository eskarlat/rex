import { existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

import { defineCommand } from '@renre-kit/extension-sdk/node';

import { readState, deleteState, getLogDir, deleteGlobalSession, killProcessTree } from '../shared/state.js';
import { connectBrowser, disconnectCachedBrowser } from '../shared/connection.js';

export default defineCommand({
  handler: async (ctx) => {
    const state = readState(ctx.projectPath);
    if (!state) {
      return {
        output: 'No browser is running.',
        exitCode: 1,
      };
    }

    disconnectCachedBrowser();

    // If PID is 0, this is an external browser — just disconnect, don't kill
    const isExternal = state.pid === 0;

    if (!isExternal) {
      try {
        const browser = await connectBrowser(ctx.projectPath);
        await browser.close();
      } catch {
        // Browser may already be gone — kill process tree as fallback
        killProcessTree(state.pid);
      }

      disconnectCachedBrowser();
    }

    // Clean up log files
    const logDir = getLogDir(ctx.projectPath);
    for (const file of ['network.jsonl', 'console.jsonl']) {
      const logPath = join(logDir, file);
      if (existsSync(logPath)) {
        unlinkSync(logPath);
      }
    }

    deleteState(ctx.projectPath);
    deleteGlobalSession();

    return {
      output: [
        isExternal ? '## Disconnected from Browser' : '## Browser Closed',
        '',
        ...(isExternal
          ? ['- **Status**: disconnected (external browser still running)']
          : [`- **PID**: ${String(state.pid)} (terminated)`]),
        '- **Logs**: cleaned up',
      ].join('\n'),
      exitCode: 0,
    };
  },
});
