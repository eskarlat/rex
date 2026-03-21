import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/commands/status.ts
import puppeteer from "puppeteer";

// src/shared/state.ts
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";
function getStorageDir(projectPath) {
  return join(projectPath, ".renre-kit", "storage", "renre-devtools");
}
function getStatePath(projectPath) {
  return join(getStorageDir(projectPath), "state.json");
}
function readState(projectPath) {
  const statePath = getStatePath(projectPath);
  if (!existsSync(statePath)) return null;
  const raw = readFileSync(statePath, "utf-8");
  return JSON.parse(raw);
}
function deleteState(projectPath) {
  const statePath = getStatePath(projectPath);
  if (existsSync(statePath)) {
    unlinkSync(statePath);
  }
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

// src/commands/status.ts
async function status(context) {
  const localState = readState(context.projectPath);
  const globalSession = readGlobalSession();
  const state = localState ?? globalSession;
  if (!state) {
    return {
      output: JSON.stringify({ running: false }),
      exitCode: 0
    };
  }
  if (!isProcessAlive(state.pid)) {
    if (localState) deleteState(context.projectPath);
    if (globalSession) deleteGlobalSession();
    return {
      output: JSON.stringify({ running: false, staleSessionCleaned: true }),
      exitCode: 0
    };
  }
  try {
    const browser = await puppeteer.connect({ browserWSEndpoint: state.wsEndpoint });
    const pages = await browser.pages();
    const tabs = await Promise.all(
      pages.map(async (page, index) => ({
        index,
        title: await page.title(),
        url: page.url()
      }))
    );
    void browser.disconnect();
    const result = {
      running: true,
      pid: state.pid,
      port: state.port,
      launchedAt: state.launchedAt,
      tabCount: tabs.length,
      tabs,
      ...globalSession ? { projectPath: globalSession.projectPath, headless: globalSession.headless } : {}
    };
    return {
      output: JSON.stringify(result),
      exitCode: 0
    };
  } catch {
    if (localState) deleteState(context.projectPath);
    if (globalSession) deleteGlobalSession();
    return {
      output: JSON.stringify({ running: false, staleSessionCleaned: true }),
      exitCode: 0
    };
  }
}
export {
  status as default
};
