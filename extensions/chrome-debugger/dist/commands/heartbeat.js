import { createRequire } from 'module'; const require = createRequire(import.meta.url);
import {
  readGlobalSession,
  writeGlobalSession
} from "../chunks/chunk-L2PPAVNR.js";
import "../chunks/chunk-C3C6F2UY.js";

// src/commands/heartbeat.ts
function heartbeat(_context) {
  const session = readGlobalSession();
  if (!session) {
    return {
      output: JSON.stringify({ updated: false, reason: "no-session" }),
      exitCode: 0
    };
  }
  session.lastSeenAt = (/* @__PURE__ */ new Date()).toISOString();
  writeGlobalSession(session);
  return {
    output: JSON.stringify({ updated: true, lastSeenAt: session.lastSeenAt }),
    exitCode: 0
  };
}
export {
  heartbeat as default
};
