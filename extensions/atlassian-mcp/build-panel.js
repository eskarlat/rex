import { buildPanel } from '@renre-kit/extension-sdk/node';

await Promise.all([
  buildPanel('src/ui/panel.tsx', 'dist/panel.js'),
  buildPanel('src/ui/my-tasks-widget.tsx', 'dist/my-tasks-widget.js'),
  buildPanel('src/ui/comments-widget.tsx', 'dist/comments-widget.js'),
  buildPanel('src/ui/confluence-updates-widget.tsx', 'dist/confluence-updates-widget.js'),
]);
