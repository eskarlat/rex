import { buildExtension, buildPanel } from '@renre-kit/extension-sdk/node';

// Bundle Node.js entry points (hooks, commands, MCP server)
await buildExtension({
  entryPoints: [
    { in: 'src/index.ts', out: 'index' },
    { in: 'src/commands/status.ts', out: 'commands/status' },
    { in: 'src/server.ts', out: 'server' },
  ],
  outdir: 'dist',
});

// Bundle UI panels
await buildPanel({
  entryPoints: [
    { in: 'src/ui/panel.tsx', out: 'panel' },
    { in: 'src/ui/status-widget.tsx', out: 'status-widget' },
  ],
  outdir: 'dist',
});
