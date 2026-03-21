import { buildPanel } from '@renre-kit/extension-sdk/node';

await buildPanel({
  entryPoints: [
    { in: 'src/ui/panel.tsx', out: 'panel' },
    { in: 'src/ui/status-widget.tsx', out: 'status-widget' },
  ],
  outdir: 'dist',
});
