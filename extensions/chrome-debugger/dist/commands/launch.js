import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/commands/launch.ts
import { join as join2 } from "node:path";
import puppeteer from "puppeteer";

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
function writeState(projectPath, state) {
  const dir = getStorageDir(projectPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(getStatePath(projectPath), JSON.stringify(state, null, 2));
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

// src/commands/launch.ts
function checkExistingLocal(projectPath) {
  const existing = readState(projectPath);
  if (!existing) return null;
  return {
    output: [
      "## Browser Already Running",
      "",
      `- **PID**: ${String(existing.pid)}`,
      `- **Port**: ${String(existing.port)}`,
      `- **Launched**: ${existing.launchedAt}`,
      "",
      "Use `chrome-debugger:close` to stop it first."
    ].join("\n"),
    exitCode: 1
  };
}
function checkExistingGlobal() {
  const globalSession = readGlobalSession();
  if (!globalSession) return null;
  if (!isProcessAlive(globalSession.pid)) {
    deleteGlobalSession();
    return null;
  }
  return {
    output: [
      "## Browser Already Running (another project)",
      "",
      `- **PID**: ${String(globalSession.pid)}`,
      `- **Port**: ${String(globalSession.port)}`,
      `- **Project**: ${globalSession.projectPath}`,
      `- **Launched**: ${globalSession.launchedAt}`,
      "",
      "Only one browser instance is supported. Close it first from the originating project,",
      "or use `chrome-debugger:close` there."
    ].join("\n"),
    exitCode: 1
  };
}
function resolvePort(context) {
  if (typeof context.args.port === "number") return context.args.port;
  if (typeof context.config.port === "number") return context.config.port;
  return 9222;
}
async function launch(context) {
  const localCheck = checkExistingLocal(context.projectPath);
  if (localCheck) return localCheck;
  const globalCheck = checkExistingGlobal();
  if (globalCheck) return globalCheck;
  const headless = context.config.headless === true || context.args.headless === true;
  const port = resolvePort(context);
  const browser = await puppeteer.launch({
    headless,
    args: [
      `--remote-debugging-port=${String(port)}`,
      "--no-first-run",
      "--no-default-browser-check"
    ]
  });
  const wsEndpoint = browser.wsEndpoint();
  const browserProcess = browser.process();
  const pid = browserProcess?.pid ?? 0;
  const logDir = getLogDir(context.projectPath);
  const networkLogPath = join2(logDir, "network.jsonl");
  const consoleLogPath = join2(logDir, "console.jsonl");
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const browserState = {
    wsEndpoint,
    pid,
    port,
    launchedAt: now,
    networkLogPath,
    consoleLogPath
  };
  writeState(context.projectPath, browserState);
  writeGlobalSession({
    wsEndpoint,
    pid,
    port,
    projectPath: context.projectPath,
    launchedAt: now,
    lastSeenAt: now,
    headless,
    networkLogPath,
    consoleLogPath
  });
  const pages = await browser.pages();
  const page = pages[0];
  if (page) {
    await setupPageMonitoring(page, networkLogPath, consoleLogPath);
  }
  browser.on("targetcreated", (target) => {
    const targetType = target.type();
    if (targetType === "page") {
      void target.page().then((newPage) => {
        if (newPage) {
          void setupPageMonitoring(newPage, networkLogPath, consoleLogPath);
        }
      });
    }
  });
  void browser.disconnect();
  return {
    output: [
      "## Browser Launched",
      "",
      `- **Mode**: ${headless ? "headless" : "headed (visible)"}`,
      `- **Port**: ${String(port)}`,
      `- **PID**: ${String(pid)}`,
      `- **WebSocket**: \`${wsEndpoint}\``,
      "",
      "Ready for commands. Use `chrome-debugger:navigate --url <url>` to get started."
    ].join("\n"),
    exitCode: 0
  };
}
async function setupPageMonitoring(page, networkLogPath, consoleLogPath) {
  const { appendFileSync, existsSync: existsSync2, mkdirSync: mkdirSync2 } = await import("node:fs");
  const nodePath = await import("node:path");
  const dir = nodePath.dirname(networkLogPath);
  if (!existsSync2(dir)) {
    mkdirSync2(dir, { recursive: true });
  }
  const client = await page.createCDPSession();
  await client.send("Network.enable");
  const pendingRequests = /* @__PURE__ */ new Map();
  client.on("Network.requestWillBeSent", (params) => {
    pendingRequests.set(params.requestId, {
      method: params.request.method,
      url: params.request.url,
      type: params.type ?? "Other",
      startTime: params.timestamp
    });
  });
  client.on("Network.responseReceived", (params) => {
    const req = pendingRequests.get(params.requestId);
    if (!req) return;
    pendingRequests.delete(params.requestId);
    const entry = JSON.stringify({
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      method: req.method,
      url: req.url,
      status: params.response.status,
      type: req.type,
      size: params.response.headers["content-length"] ? Number(params.response.headers["content-length"]) : 0,
      duration: Math.round((params.timestamp - req.startTime) * 1e3)
    });
    appendFileSync(networkLogPath, entry + "\n");
  });
  await client.send("Runtime.enable");
  client.on("Runtime.consoleAPICalled", (params) => {
    const text = params.args.map((arg) => {
      if (arg.value !== void 0) return String(arg.value);
      if (arg.description) return arg.description;
      return arg.type;
    }).join(" ");
    const entry = JSON.stringify({
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level: params.type,
      text
    });
    appendFileSync(consoleLogPath, entry + "\n");
  });
}
export {
  launch as default
};
