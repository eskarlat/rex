import { buildExtension, buildPanel } from '@renre-kit/extension-sdk/node';

// Bundle Node.js entry points (hooks, commands)
await buildExtension({
  entryPoints: [
    { in: 'src/index.ts', out: 'index' },
    { in: 'src/commands/greet.ts', out: 'commands/greet' },
    { in: 'src/commands/info.ts', out: 'commands/info' },
  ],
  outdir: 'dist',
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
