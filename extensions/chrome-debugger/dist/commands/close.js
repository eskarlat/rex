import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/commands/close.ts
import { existsSync as existsSync2, unlinkSync as unlinkSync2 } from "node:fs";
import { join as join2 } from "node:path";

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
function deleteGlobalSession() {
  const sessionPath = getGlobalSessionPath();
  if (existsSync(sessionPath)) {
    unlinkSync(sessionPath);
  }
}
function winSystemRoot() {
  return process.env.SystemRoot ?? "C:\\Windows";
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

// src/shared/connection.ts
import puppeteer from "puppeteer";
async function connectBrowser(projectPath) {
  const state = ensureBrowserRunning(projectPath);
  return puppeteer.connect({ browserWSEndpoint: state.wsEndpoint });
}

// src/commands/close.ts
async function close(context) {
  const state = readState(context.projectPath);
  if (!state) {
    return {
      output: "No browser is running.",
      exitCode: 1
    };
  }
  try {
    const browser = await connectBrowser(context.projectPath);
    await browser.close();
  } catch {
    killProcessTree(state.pid);
  }
  const logDir = getLogDir(context.projectPath);
  for (const file of ["network.jsonl", "console.jsonl"]) {
    const logPath = join2(logDir, file);
    if (existsSync2(logPath)) {
      unlinkSync2(logPath);
    }
  }
  deleteState(context.projectPath);
  deleteGlobalSession();
  return {
    output: [
      "## Browser Closed",
      "",
      `- **PID**: ${String(state.pid)} (terminated)`,
      "- **Logs**: cleaned up"
    ].join("\n"),
    exitCode: 0
  };
}
export {
  close as default
};
