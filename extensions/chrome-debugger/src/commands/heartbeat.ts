import { readGlobalSession, writeGlobalSession } from '../shared/state.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

export default function heartbeat(_context: ExecutionContext): CommandResult {
  const session = readGlobalSession();
  if (!session) {
    return {
      output: JSON.stringify({ updated: false, reason: 'no-session' }),
      exitCode: 0,
    };
  }

  session.lastSeenAt = new Date().toISOString();
  writeGlobalSession(session);

  return {
    output: JSON.stringify({ updated: true, lastSeenAt: session.lastSeenAt }),
    exitCode: 0,
  };
}
