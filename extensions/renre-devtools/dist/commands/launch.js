import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/commands/launch.ts
import { join as join2 } from "node:path";
import puppeteer from "puppeteer";

// src/shared/state.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
function getStorageDir(projectPath) {
  return join(projectPath, ".renre-kit", "storage", "renre-devtools");
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

// src/commands/launch.ts
async function launch(context) {
  const existing = readState(context.projectPath);
  if (existing) {
    return {
      output: [
        "## Browser Already Running",
        "",
        `- **PID**: ${String(existing.pid)}`,
        `- **Port**: ${String(existing.port)}`,
        `- **Launched**: ${existing.launchedAt}`,
        "",
        "Use `renre-devtools:close` to stop it first."
      ].join("\n"),
      exitCode: 1
    };
  }
  const headless = context.config.headless === true || context.args.headless === true;
  let port = 9222;
  if (typeof context.args.port === "number") {
    port = context.args.port;
  } else if (typeof context.config.port === "number") {
    port = context.config.port;
  }
  const browser = await puppeteer.launch({
    headless,
    args: [
      `--remote-debugging-port=${String(port)}`,
      "--no-first-run",
      "--no-default-browser-check"
    ]
  });
  const wsEndpoint = browser.wsEndpoint();
  const process = browser.process();
  const pid = process?.pid ?? 0;
  const logDir = getLogDir(context.projectPath);
  const networkLogPath = join2(logDir, "network.jsonl");
  const consoleLogPath = join2(logDir, "console.jsonl");
  writeState(context.projectPath, {
    wsEndpoint,
    pid,
    port,
    launchedAt: (/* @__PURE__ */ new Date()).toISOString(),
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
      "Ready for commands. Use `renre-devtools:navigate --url <url>` to get started."
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
