import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/commands/network.ts
import { existsSync as existsSync2, readFileSync as readFileSync2 } from "node:fs";

// src/shared/state.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
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
function ensureBrowserRunning(projectPath) {
  const state = readState(projectPath);
  if (!state) {
    throw new Error(
      "No browser is running. Start one with: renre-kit renre-devtools:launch"
    );
  }
  return state;
}

// src/shared/formatters.ts
function markdownTable(headers, rows) {
  const separator = headers.map(() => "---");
  const lines = [
    `| ${headers.join(" | ")} |`,
    `| ${separator.join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`)
  ];
  return lines.join("\n");
}
function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const unit = units[i] ?? "GB";
  return `${(bytes / 1024 ** i).toFixed(1)} ${unit}`;
}
function formatDuration(ms) {
  if (ms < 1e3) return `${Math.round(ms)}ms`;
  return `${(ms / 1e3).toFixed(2)}s`;
}
function formatTimestamp(iso) {
  return new Date(iso).toLocaleTimeString();
}

// src/commands/network.ts
function network(context) {
  const state = ensureBrowserRunning(context.projectPath);
  const filter = typeof context.args.filter === "string" ? context.args.filter : null;
  const method = typeof context.args.method === "string" ? context.args.method.toUpperCase() : null;
  const limit = typeof context.args.limit === "number" ? context.args.limit : 50;
  if (!existsSync2(state.networkLogPath)) {
    return { output: "No network requests captured yet.", exitCode: 0 };
  }
  const raw = readFileSync2(state.networkLogPath, "utf-8").trim();
  if (raw.length === 0) {
    return { output: "No network requests captured yet.", exitCode: 0 };
  }
  let entries = raw.split("\n").map((line) => JSON.parse(line));
  if (filter) {
    const pattern = filter.toLowerCase();
    entries = entries.filter((e) => e.url.toLowerCase().includes(pattern));
  }
  if (method) {
    entries = entries.filter((e) => e.method === method);
  }
  entries = entries.slice(-limit);
  const rows = entries.map((e) => [
    formatTimestamp(e.timestamp),
    e.method,
    String(e.status),
    e.type,
    truncate(e.url, 60),
    formatBytes(e.size),
    formatDuration(e.duration)
  ]);
  const table = markdownTable(
    ["Time", "Method", "Status", "Type", "URL", "Size", "Duration"],
    rows
  );
  return {
    output: [`## Network Requests (${String(entries.length)})`, "", table].join("\n"),
    exitCode: 0
  };
}
export {
  network as default
};
