import { defineCommand } from '@renre-kit/extension-sdk/node';

import { readGlobalSession, writeGlobalSession } from '../shared/state.js';

export default defineCommand({
  handler: () => {
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
  },
});
