import { buildPanel } from '@renre-kit/extension-sdk/node';

await buildPanel({
  entryPoints: [
    { in: 'src/ui/panel.tsx', out: 'panel' },
    { in: 'src/ui/browser-widget.tsx', out: 'browser-widget' },
  ],
  outdir: 'dist',
});
