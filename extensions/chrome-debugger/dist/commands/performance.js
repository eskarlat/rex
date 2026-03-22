import { createRequire } from 'module'; const require = createRequire(import.meta.url);
import {
  getNavigationTiming,
  getWebVitals
} from "../chunks/chunk-V26XA6TS.js";
import {
  formatDuration,
  markdownTable
} from "../chunks/chunk-RMALWN2J.js";
import {
  withBrowser
} from "../chunks/chunk-EEGYRSU4.js";
import "../chunks/chunk-AT5YMNYW.js";
import "../chunks/chunk-YGOXEHOS.js";
import "../chunks/chunk-A7XEC37O.js";
import "../chunks/chunk-ICGADTKU.js";
import "../chunks/chunk-WWTA3VPD.js";
import "../chunks/chunk-FOU2EXQ2.js";
import "../chunks/chunk-LOYEZFXG.js";
import "../chunks/chunk-AWU4Q6CL.js";
import "../chunks/chunk-BF5SUUWU.js";
import "../chunks/chunk-L2PPAVNR.js";
import "../chunks/chunk-C3C6F2UY.js";

// src/commands/performance.ts
async function performance(context) {
  return withBrowser(context.projectPath, async (_browser, page) => {
    const client = await page.createCDPSession();
    const { metrics } = await client.send("Performance.getMetrics");
    const timing = await page.evaluate(getNavigationTiming);
    const vitals = await page.evaluate(getWebVitals);
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
