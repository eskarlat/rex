import { buildPanel } from '@renre-kit/extension-sdk/node';

await Promise.all([
  buildPanel('src/ui/panel.tsx', 'dist/panel.js'),
  buildPanel('src/ui/status-widget.tsx', 'dist/status-widget.js'),
]);
