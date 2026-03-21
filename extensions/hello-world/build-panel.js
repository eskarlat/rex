import { buildPanel } from '@renre-kit/extension-sdk/node';

await buildPanel({
  entryPoints: [
    { in: 'src/ui/panel.tsx', out: 'panel' },
    { in: 'src/ui/settings-panel.tsx', out: 'settings-panel' },
    { in: 'src/ui/analytics-panel.tsx', out: 'analytics-panel' },
    { in: 'src/ui/status-widget.tsx', out: 'status-widget' },
  ],
  outdir: 'dist',
});
