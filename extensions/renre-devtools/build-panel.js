import { buildPanel } from '@renre-kit/extension-sdk/node';

await Promise.all([
  buildPanel('src/ui/panel.tsx', 'dist/panel.js'),
  buildPanel('src/ui/browser-widget.tsx', 'dist/browser-widget.js'),
]);
