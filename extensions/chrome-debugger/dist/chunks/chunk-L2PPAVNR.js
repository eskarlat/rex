import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/shared/state.ts
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";
function getStorageDir(projectPath) {
  return join(projectPath, ".renre-kit", "storage", "chrome-debugger");
}
function getStatePath(projectPath) {
  return join(getStorageDir(projectPath), "state.json");
}
function getLogDir(projectPath) {
  return getStorageDir(projectPath);
}
function getScreenshotDir(projectPath) {
  return join(getStorageDir(projectPath), "screenshots");
}
function readState(projectPath) {
  const statePath = getStatePath(projectPath);
  if (!existsSync(statePath)) return null;
  const raw = readFileSync(statePath, "utf-8");
  return JSON.parse(raw);
}
function writeState(projectPath, state) {
  const dir = getStorageDir(projectPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(getStatePath(projectPath), JSON.stringify(state, null, 2));
}
function deleteState(projectPath) {
  const statePath = getStatePath(projectPath);
  if (existsSync(statePath)) {
    unlinkSync(statePath);
  }
}
function ensureBrowserRunning(projectPath) {
  const state = readState(projectPath);
  if (!state) {
    throw new Error(
      "No browser is running. Start one with: renre-kit chrome-debugger:launch"
    );
  }
  return state;
}
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
function deleteGlobalSession() {
  const sessionPath = getGlobalSessionPath();
  if (existsSync(sessionPath)) {
    unlinkSync(sessionPath);
  }
}
function winSystemRoot() {
  return process.env.SystemRoot ?? "C:\\Windows";
}
function isProcessAlive(pid) {
  if (platform() === "win32") {
    const tasklist = join(winSystemRoot(), "System32", "tasklist.exe");
    const result = spawnSync(tasklist, ["/FI", `PID eq ${String(pid)}`, "/NH"], {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"]
    });
    return result.status === 0 && result.stdout.includes(String(pid));
  }
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
function killProcessTree(pid) {
  if (platform() === "win32") {
    const taskkill = join(winSystemRoot(), "System32", "taskkill.exe");
    spawnSync(taskkill, ["/PID", String(pid), "/T", "/F"], {
      stdio: ["pipe", "pipe", "pipe"]
    });
    return;
  }
  try {
    process.kill(-pid, "SIGTERM");
  } catch {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
    }
  }
}

export {
  getLogDir,
  getScreenshotDir,
  readState,
  writeState,
  deleteState,
  ensureBrowserRunning,
  readGlobalSession,
  writeGlobalSession,
  deleteGlobalSession,
  isProcessAlive,
  killProcessTree
};
