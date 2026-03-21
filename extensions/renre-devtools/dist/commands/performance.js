import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/shared/connection.ts
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

// src/shared/connection.ts
async function connectBrowser(projectPath) {
  const state = ensureBrowserRunning(projectPath);
  return puppeteer.connect({ browserWSEndpoint: state.wsEndpoint });
}
async function getActivePage(browser) {
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  if (!page) {
    throw new Error("No open tabs found in browser");
  }
  return page;
}
async function withBrowser(projectPath, fn) {
  const browser = await connectBrowser(projectPath);
  try {
    const page = await getActivePage(browser);
    return await fn(browser, page);
  } finally {
    void browser.disconnect();
  }
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
function formatDuration(ms) {
  if (ms < 1e3) return `${Math.round(ms)}ms`;
  return `${(ms / 1e3).toFixed(2)}s`;
}

// src/commands/performance.ts
async function performance(context) {
  return withBrowser(context.projectPath, async (_browser, page) => {
    const client = await page.createCDPSession();
    const { metrics } = await client.send("Performance.getMetrics");
    const timing = await page.evaluate(() => {
      const nav = globalThis.performance.getEntriesByType(
        "navigation"
      )[0];
      if (!nav) return null;
      return {
        dns: nav.domainLookupEnd - nav.domainLookupStart,
        tcp: nav.connectEnd - nav.connectStart,
        ttfb: nav.responseStart - nav.requestStart,
        download: nav.responseEnd - nav.responseStart,
        domInteractive: nav.domInteractive - nav.fetchStart,
        domComplete: nav.domComplete - nav.fetchStart,
        loadEvent: nav.loadEventEnd - nav.fetchStart
      };
    });
    const vitals = await page.evaluate(() => {
      const entries = globalThis.performance.getEntriesByType("paint");
      const fcp = entries.find((e) => e.name === "first-contentful-paint");
      return {
        fcp: fcp?.startTime ?? null
      };
    });
    const lines = ["## Performance Metrics", ""];
    if (vitals.fcp !== null || timing) {
      const vitalRows = [];
      if (vitals.fcp !== null) {
        vitalRows.push(["First Contentful Paint (FCP)", formatDuration(vitals.fcp)]);
      }
      if (timing) {
        vitalRows.push(["Time to First Byte (TTFB)", formatDuration(timing.ttfb)]);
        vitalRows.push(["DOM Interactive", formatDuration(timing.domInteractive)]);
        vitalRows.push(["DOM Complete", formatDuration(timing.domComplete)]);
        vitalRows.push(["Load Event", formatDuration(timing.loadEvent)]);
      }
      lines.push("### Web Vitals", "");
      lines.push(markdownTable(["Metric", "Value"], vitalRows));
      lines.push("");
    }
    if (timing) {
      lines.push("### Navigation Timing", "");
      const timingRows = [
        ["DNS Lookup", formatDuration(timing.dns)],
        ["TCP Connect", formatDuration(timing.tcp)],
        ["TTFB", formatDuration(timing.ttfb)],
        ["Download", formatDuration(timing.download)]
      ];
      lines.push(markdownTable(["Phase", "Duration"], timingRows));
      lines.push("");
    }
    if (metrics.length > 0) {
      const keyMetrics = [
        "JSHeapUsedSize",
        "JSHeapTotalSize",
        "Documents",
        "Nodes",
        "LayoutCount",
        "RecalcStyleCount",
        "JSEventListeners"
      ];
      const cdpRows = metrics.filter((m) => keyMetrics.includes(m.name)).map((m) => {
        const value = m.name.includes("Heap") ? `${(m.value / 1024 / 1024).toFixed(1)} MB` : String(Math.round(m.value));
        return [m.name, value];
      });
      if (cdpRows.length > 0) {
        lines.push("### Runtime Metrics", "");
        lines.push(markdownTable(["Metric", "Value"], cdpRows));
      }
    }
    return {
      output: lines.join("\n"),
      exitCode: 0
    };
  });
}
export {
  performance as default
};
