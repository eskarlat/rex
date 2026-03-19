import { buildPanel } from '@renre-kit/extension-sdk/node';

await Promise.all([
  buildPanel('src/ui/panel.tsx', 'dist/panel.js'),
  buildPanel('src/ui/settings-panel.tsx', 'dist/settings-panel.js'),
  buildPanel('src/ui/analytics-panel.tsx', 'dist/analytics-panel.js'),
  buildPanel('src/ui/status-widget.tsx', 'dist/status-widget.js'),
]);
