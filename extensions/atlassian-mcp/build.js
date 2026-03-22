import { readFileSync, rmSync } from 'node:fs';

import { buildExtension, buildPanel, archiveDist } from '@renre-kit/extension-sdk/node';

rmSync('dist', { recursive: true, force: true });

const manifest = JSON.parse(readFileSync('manifest.json', 'utf-8'));

// Bundle Node.js entry points (hooks, commands, MCP server)
await buildExtension({
  entryPoints: [
    { in: 'src/index.ts', out: 'index' },
    { in: 'src/commands/status.ts', out: 'commands/status' },
    { in: 'src/server.ts', out: 'server' },
  ],
  outdir: 'dist',
  external: [],
  splitting: true,
});

// Bundle UI panels
await buildPanel({
  entryPoints: [
    { in: 'src/ui/panel.tsx', out: 'panel' },
    { in: 'src/ui/my-tasks-widget.tsx', out: 'my-tasks-widget' },
    { in: 'src/ui/comments-widget.tsx', out: 'comments-widget' },
    { in: 'src/ui/confluence-updates-widget.tsx', out: 'confluence-updates-widget' },
  ],
  outdir: 'dist',
});

await archiveDist('dist', manifest.version);
