import { readState, deleteState, getLogDir } from '../shared/state.js';
import { connectBrowser } from '../shared/connection.js';
import { existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

export default async function close(context: ExecutionContext): Promise<CommandResult> {
  const state = readState(context.projectPath);
  if (!state) {
    return {
      output: 'No browser is running.',
      exitCode: 1,
    };
  }

  try {
    const browser = await connectBrowser(context.projectPath);
    await browser.close();
  } catch {
    // Browser may already be gone — kill by PID as fallback
    try {
      process.kill(state.pid);
    } catch {
      // Already dead, that's fine
    }
  }

  // Clean up log files
  const logDir = getLogDir(context.projectPath);
  for (const file of ['network.jsonl', 'console.jsonl']) {
    const logPath = join(logDir, file);
    if (existsSync(logPath)) {
      unlinkSync(logPath);
    }
  }

  deleteState(context.projectPath);

  return {
    output: [
      '## Browser Closed',
      '',
      `- **PID**: ${String(state.pid)} (terminated)`,
      '- **Logs**: cleaned up',
    ].join('\n'),
    exitCode: 0,
  };
}
