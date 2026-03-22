import { readFileSync, rmSync } from 'node:fs';

import { buildExtension, buildPanel, archiveDist } from '@renre-kit/extension-sdk/node';

rmSync('dist', { recursive: true, force: true });

const manifest = JSON.parse(readFileSync('manifest.json', 'utf-8'));

await buildExtension({
  entryPoints: [
    { in: 'src/index.ts', out: 'index' },
    { in: 'src/commands/tree.ts', out: 'commands/tree' },
    { in: 'src/commands/read.ts', out: 'commands/read' },
    { in: 'src/commands/write.ts', out: 'commands/write' },
    { in: 'src/commands/create.ts', out: 'commands/create' },
    { in: 'src/commands/delete.ts', out: 'commands/delete' },
    { in: 'src/commands/rename.ts', out: 'commands/rename' },
  ],
  outdir: 'dist',
  external: [],
  splitting: true,
});

await buildPanel({
  entryPoints: [{ in: 'src/ui/editor-panel.tsx', out: 'editor-panel' }],
  outdir: 'dist',
});

await archiveDist('dist', manifest.version);
