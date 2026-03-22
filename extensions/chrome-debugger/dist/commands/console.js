import { createRequire } from 'module'; const require = createRequire(import.meta.url);
import {
  formatTimestamp,
  markdownTable,
  truncate
} from "../chunks/chunk-RMALWN2J.js";
import {
  ensureBrowserRunning
} from "../chunks/chunk-L2PPAVNR.js";
import "../chunks/chunk-C3C6F2UY.js";

// src/commands/console.ts
import { existsSync, readFileSync } from "node:fs";
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
  if (!existsSync(state.consoleLogPath)) {
    return emptyResponse(format);
  }
  const raw = readFileSync(state.consoleLogPath, "utf-8").trim();
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
