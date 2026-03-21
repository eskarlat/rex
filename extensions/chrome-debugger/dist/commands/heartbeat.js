import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/shared/state.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";
function getGlobalDir() {
  return process.env.RENRE_KIT_HOME ?? join(homedir(), ".renre-kit");
}
function getGlobalSessionPath() {
  return join(getGlobalDir(), "browser-session.json");
}
function readGlobalSession() {
  const sessionPath = getGlobalSessionPath();
  if (!existsSync(sessionPath)) return null;
  const raw = readFileSync(sessionPath, "utf-8");
  return JSON.parse(raw);
}
function writeGlobalSession(session) {
  const dir = getGlobalDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(getGlobalSessionPath(), JSON.stringify(session, null, 2));
}

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
