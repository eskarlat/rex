import { buildPanel } from '@renre-kit/extension-sdk/node';

await buildPanel({
  entryPoints: [
    { in: 'src/ui/panel.tsx', out: 'panel' },
    { in: 'src/ui/my-tasks-widget.tsx', out: 'my-tasks-widget' },
    { in: 'src/ui/comments-widget.tsx', out: 'comments-widget' },
    { in: 'src/ui/confluence-updates-widget.tsx', out: 'confluence-updates-widget' },
  ],
  outdir: 'dist',
});
