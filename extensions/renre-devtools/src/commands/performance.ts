import { withBrowser } from '../shared/connection.js';
import { markdownTable, formatDuration } from '../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

export default async function performance(context: ExecutionContext): Promise<CommandResult> {
  return withBrowser(context.projectPath, async (_browser, page) => {
    const client = await page.createCDPSession();

    // Get Performance.getMetrics from CDP
    const { metrics } = (await client.send('Performance.getMetrics')) as {
      metrics: Array<{ name: string; value: number }>;
    };

    // Get Navigation Timing from the page
    const timing = await page.evaluate(/* istanbul ignore next -- browser-context */ () => {
      const nav = globalThis.performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming | undefined;
      if (!nav) return null;
      return {
        dns: nav.domainLookupEnd - nav.domainLookupStart,
        tcp: nav.connectEnd - nav.connectStart,
        ttfb: nav.responseStart - nav.requestStart,
        download: nav.responseEnd - nav.responseStart,
        domInteractive: nav.domInteractive - nav.fetchStart,
        domComplete: nav.domComplete - nav.fetchStart,
        loadEvent: nav.loadEventEnd - nav.fetchStart,
      };
    });

    // Get Core Web Vitals via PerformanceObserver (LCP, CLS)
    const vitals = await page.evaluate(/* istanbul ignore next -- browser-context */ () => {
      const entries = globalThis.performance.getEntriesByType('paint');
      const fcp = entries.find((e) => e.name === 'first-contentful-paint');
      return {
        fcp: fcp?.startTime ?? null,
      };
    });

    const lines: string[] = ['## Performance Metrics', ''];

    // Core Web Vitals section
    if (vitals.fcp !== null || timing) {
      const vitalRows: string[][] = [];
      if (vitals.fcp !== null) {
        vitalRows.push(['First Contentful Paint (FCP)', formatDuration(vitals.fcp)]);
      }
      if (timing) {
        vitalRows.push(['Time to First Byte (TTFB)', formatDuration(timing.ttfb)]);
        vitalRows.push(['DOM Interactive', formatDuration(timing.domInteractive)]);
        vitalRows.push(['DOM Complete', formatDuration(timing.domComplete)]);
        vitalRows.push(['Load Event', formatDuration(timing.loadEvent)]);
      }
      lines.push('### Web Vitals', '');
      lines.push(markdownTable(['Metric', 'Value'], vitalRows));
      lines.push('');
    }

    // Navigation Timing breakdown
    if (timing) {
      lines.push('### Navigation Timing', '');
      const timingRows = [
        ['DNS Lookup', formatDuration(timing.dns)],
        ['TCP Connect', formatDuration(timing.tcp)],
        ['TTFB', formatDuration(timing.ttfb)],
        ['Download', formatDuration(timing.download)],
      ];
      lines.push(markdownTable(['Phase', 'Duration'], timingRows));
      lines.push('');
    }

    // CDP Metrics
    if (metrics.length > 0) {
      const keyMetrics = [
        'JSHeapUsedSize',
        'JSHeapTotalSize',
        'Documents',
        'Nodes',
        'LayoutCount',
        'RecalcStyleCount',
        'JSEventListeners',
      ];
      const cdpRows = metrics
        .filter((m) => keyMetrics.includes(m.name))
        .map((m) => {
          const value = m.name.includes('Heap')
            ? `${(m.value / 1024 / 1024).toFixed(1)} MB`
            : String(Math.round(m.value));
          return [m.name, value];
        });

      if (cdpRows.length > 0) {
        lines.push('### Runtime Metrics', '');
        lines.push(markdownTable(['Metric', 'Value'], cdpRows));
      }
    }

    return {
      output: lines.join('\n'),
      exitCode: 0,
    };
  });
}
