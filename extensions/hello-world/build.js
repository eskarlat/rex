import { readFileSync, rmSync } from 'node:fs';

import { buildExtension, buildPanel, archiveDist } from '@renre-kit/extension-sdk/node';

rmSync('dist', { recursive: true, force: true });

const manifest = JSON.parse(readFileSync('manifest.json', 'utf-8'));

// Bundle Node.js entry points (hooks, commands)
await buildExtension({
  entryPoints: [
    { in: 'src/index.ts', out: 'index' },
    { in: 'src/commands/greet.ts', out: 'commands/greet' },
    { in: 'src/commands/info.ts', out: 'commands/info' },
  ],
  outdir: 'dist',
  external: [],
  splitting: true,
});

// Bundle UI panels
await buildPanel({
  entryPoints: [
    { in: 'src/ui/panel.tsx', out: 'panel' },
    { in: 'src/ui/settings-panel.tsx', out: 'settings-panel' },
    { in: 'src/ui/analytics-panel.tsx', out: 'analytics-panel' },
    { in: 'src/ui/status-widget.tsx', out: 'status-widget' },
  ],
  outdir: 'dist',
});

await archiveDist('dist', manifest.version);
