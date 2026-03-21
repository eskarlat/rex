import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/commands/console.ts
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
function formatTimestamp(iso) {
  return new Date(iso).toLocaleTimeString();
}

// src/commands/console.ts
function emptyResponse(format) {
  if (format === "json") {
    return { output: JSON.stringify({ entries: [], total: 0 }), exitCode: 0 };
  }
  return { output: "No console messages captured yet.", exitCode: 0 };
}
function parseArgs(context) {
  return {
    levelFilter: typeof context.args.level === "string" ? context.args.level : null,
    limit: typeof context.args.limit === "number" ? context.args.limit : 50,
    offset: typeof context.args.offset === "number" ? context.args.offset : 0,
    format: context.args.format === "json" ? "json" : "markdown"
  };
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
    e.level.toUpperCase(),
    truncate(e.text, 80)
  ]);
  const table = markdownTable(["Time", "Level", "Message"], rows);
  return {
    output: [`## Console Messages (${String(entries.length)})`, "", table].join("\n"),
    exitCode: 0
  };
}
function consoleCommand(context) {
  const state = ensureBrowserRunning(context.projectPath);
  const { levelFilter, limit, offset, format } = parseArgs(context);
  if (!existsSync2(state.consoleLogPath)) {
    return emptyResponse(format);
  }
  const raw = readFileSync2(state.consoleLogPath, "utf-8").trim();
  if (raw.length === 0) {
    return emptyResponse(format);
  }
  const allLines = raw.split("\n");
  let entries = allLines.slice(offset).map((line) => JSON.parse(line));
  if (levelFilter) {
    entries = entries.filter((e) => e.level === levelFilter);
  }
  entries = entries.slice(-limit);
  return format === "json" ? formatAsJson(entries, allLines.length) : formatAsMarkdown(entries);
}
export {
  consoleCommand as default
};
