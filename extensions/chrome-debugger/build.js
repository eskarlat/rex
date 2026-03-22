import { readFileSync, rmSync } from 'node:fs';

import { buildExtension, buildPanel, archiveDist } from '@renre-kit/extension-sdk/node';

rmSync('dist', { recursive: true, force: true });

const manifest = JSON.parse(readFileSync('manifest.json', 'utf-8'));

await buildExtension({
  entryPoints: [
    { in: 'src/index.ts', out: 'index' },
    { in: 'src/commands/launch.ts', out: 'commands/launch' },
    { in: 'src/commands/close.ts', out: 'commands/close' },
    { in: 'src/commands/navigate.ts', out: 'commands/navigate' },
    { in: 'src/commands/tabs.ts', out: 'commands/tabs' },
    { in: 'src/commands/tab.ts', out: 'commands/tab' },
    { in: 'src/commands/dom.ts', out: 'commands/dom' },
    { in: 'src/commands/select.ts', out: 'commands/select' },
    { in: 'src/commands/click.ts', out: 'commands/click' },
    { in: 'src/commands/type.ts', out: 'commands/type' },
    { in: 'src/commands/eval.ts', out: 'commands/eval' },
    { in: 'src/commands/network.ts', out: 'commands/network' },
    { in: 'src/commands/console.ts', out: 'commands/console' },
    { in: 'src/commands/screenshot.ts', out: 'commands/screenshot' },
    { in: 'src/commands/cookies.ts', out: 'commands/cookies' },
    { in: 'src/commands/storage.ts', out: 'commands/storage' },
    { in: 'src/commands/styles.ts', out: 'commands/styles' },
    { in: 'src/commands/a11y.ts', out: 'commands/a11y' },
    { in: 'src/commands/performance.ts', out: 'commands/performance' },
    { in: 'src/commands/inspect.ts', out: 'commands/inspect' },
    { in: 'src/commands/selected.ts', out: 'commands/selected' },
    { in: 'src/commands/highlight.ts', out: 'commands/highlight' },
    { in: 'src/commands/status.ts', out: 'commands/status' },
    { in: 'src/commands/heartbeat.ts', out: 'commands/heartbeat' },
    { in: 'src/commands/chrome-check.ts', out: 'commands/chrome-check' },
    { in: 'src/commands/chrome-install.ts', out: 'commands/chrome-install' },
    { in: 'src/commands/screenshot-list.ts', out: 'commands/screenshot-list' },
    { in: 'src/commands/screenshot-read.ts', out: 'commands/screenshot-read' },
    { in: 'src/commands/screenshot-delete.ts', out: 'commands/screenshot-delete' },
    { in: 'src/commands/clear-logs.ts', out: 'commands/clear-logs' },
  ],
  outdir: 'dist',
  external: [],
  splitting: true,
});

await buildPanel({
  entryPoints: [
    { in: 'src/ui/panels/overview.tsx', out: 'panels/overview' },
    { in: 'src/ui/panels/screenshots.tsx', out: 'panels/screenshots' },
    { in: 'src/ui/panels/logs.tsx', out: 'panels/logs' },
  ],
  outdir: 'dist',
});

await archiveDist('dist', manifest.version);
