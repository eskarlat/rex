import { buildExtension, buildPanel } from '@renre-kit/extension-sdk/node';

// Bundle Node.js entry points (hooks, commands)
await buildExtension({
  entryPoints: [
    { in: 'src/index.ts', out: 'index' },
    { in: 'src/commands/status.ts', out: 'commands/status' },
  ],
  outdir: 'dist',
});

// Bundle UI panels
await buildPanel({
  entryPoints: [
    { in: 'src/ui/panel.tsx', out: 'panel' },
    { in: 'src/ui/browser-widget.tsx', out: 'browser-widget' },
  ],
  outdir: 'dist',
});
