import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/commands/network.ts
import { existsSync as existsSync2, readFileSync as readFileSync2 } from "node:fs";

// src/shared/state.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
function getStorageDir(projectPath) {
  return join(projectPath, ".renre-kit", "storage", "chrome-debugger");
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
      "No browser is running. Start one with: renre-kit chrome-debugger:launch"
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
function emptyResponse(format) {
  if (format === "json") {
    return { output: JSON.stringify({ entries: [], total: 0 }), exitCode: 0 };
  }
  return { output: "No network requests captured yet.", exitCode: 0 };
}
function parseArgs(context) {
  return {
    filter: typeof context.args.filter === "string" ? context.args.filter : null,
    method: typeof context.args.method === "string" ? context.args.method.toUpperCase() : null,
    limit: typeof context.args.limit === "number" ? context.args.limit : 50,
    offset: typeof context.args.offset === "number" ? context.args.offset : 0,
    format: context.args.format === "json" ? "json" : "markdown"
  };
}
function applyFilters(entries, filter, method) {
  let result = entries;
  if (filter) {
    const pattern = filter.toLowerCase();
    result = result.filter((e) => e.url.toLowerCase().includes(pattern));
  }
  if (method) {
    result = result.filter((e) => e.method === method);
  }
  return result;
}
function formatAsJson(entries, total) {
  return {
    output: JSON.stringify({ entries, total }),
    exitCode: 0
  };
}
function formatAsMarkdown(entries) {
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
function network(context) {
  const state = ensureBrowserRunning(context.projectPath);
  const { filter, method, limit, offset, format } = parseArgs(context);
  if (!existsSync2(state.networkLogPath)) {
    return emptyResponse(format);
  }
  const raw = readFileSync2(state.networkLogPath, "utf-8").trim();
  if (raw.length === 0) {
    return emptyResponse(format);
  }
  const allLines = raw.split("\n");
  const parsed = allLines.slice(offset).map((line) => JSON.parse(line));
  const filtered = applyFilters(parsed, filter, method);
  const entries = filtered.slice(-limit);
  return format === "json" ? formatAsJson(entries, allLines.length) : formatAsMarkdown(entries);
}
export {
  network as default
};
