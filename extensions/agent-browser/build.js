import { readFileSync, rmSync } from 'node:fs';
import { buildExtension, buildPanel, archiveDist } from '@renre-kit/extension-sdk/node';

rmSync('dist', { recursive: true, force: true });

const manifest = JSON.parse(readFileSync('manifest.json', 'utf-8'));

// Bundle Node.js entry points (lifecycle hooks + 34 commands)
await buildExtension({
  entryPoints: [
    // Lifecycle
    { in: 'src/index.ts', out: 'index' },

    // Core Navigation (6)
    { in: 'src/commands/open.ts', out: 'commands/open' },
    { in: 'src/commands/close.ts', out: 'commands/close' },
    { in: 'src/commands/status.ts', out: 'commands/status' },
    { in: 'src/commands/back.ts', out: 'commands/back' },
    { in: 'src/commands/forward.ts', out: 'commands/forward' },
    { in: 'src/commands/reload.ts', out: 'commands/reload' },

    // Interaction (7)
    { in: 'src/commands/click.ts', out: 'commands/click' },
    { in: 'src/commands/type.ts', out: 'commands/type' },
    { in: 'src/commands/fill.ts', out: 'commands/fill' },
    { in: 'src/commands/select.ts', out: 'commands/select' },
    { in: 'src/commands/hover.ts', out: 'commands/hover' },
    { in: 'src/commands/scroll.ts', out: 'commands/scroll' },
    { in: 'src/commands/wait.ts', out: 'commands/wait' },

    // Capture & Extraction (7)
    { in: 'src/commands/screenshot.ts', out: 'commands/screenshot' },
    { in: 'src/commands/snapshot.ts', out: 'commands/snapshot' },
    { in: 'src/commands/eval.ts', out: 'commands/eval' },
    { in: 'src/commands/get-text.ts', out: 'commands/get-text' },
    { in: 'src/commands/get-html.ts', out: 'commands/get-html' },
    { in: 'src/commands/get-url.ts', out: 'commands/get-url' },
    { in: 'src/commands/pdf.ts', out: 'commands/pdf' },

    // Find Elements (3)
    { in: 'src/commands/find-role.ts', out: 'commands/find-role' },
    { in: 'src/commands/find-text.ts', out: 'commands/find-text' },
    { in: 'src/commands/find-label.ts', out: 'commands/find-label' },

    // Tabs, Cookies & Storage (5)
    { in: 'src/commands/tabs.ts', out: 'commands/tabs' },
    { in: 'src/commands/cookies-get.ts', out: 'commands/cookies-get' },
    { in: 'src/commands/cookies-set.ts', out: 'commands/cookies-set' },
    { in: 'src/commands/cookies-clear.ts', out: 'commands/cookies-clear' },
    { in: 'src/commands/storage.ts', out: 'commands/storage' },

    // Debug & Inspect (8)
    { in: 'src/commands/console.ts', out: 'commands/console' },
    { in: 'src/commands/errors.ts', out: 'commands/errors' },
    { in: 'src/commands/network.ts', out: 'commands/network' },
    { in: 'src/commands/highlight.ts', out: 'commands/highlight' },
    { in: 'src/commands/trace-start.ts', out: 'commands/trace-start' },
    { in: 'src/commands/trace-stop.ts', out: 'commands/trace-stop' },
    { in: 'src/commands/diff-snapshot.ts', out: 'commands/diff-snapshot' },
    { in: 'src/commands/diff-screenshot.ts', out: 'commands/diff-screenshot' },

    // Batch (1)
    { in: 'src/commands/batch.ts', out: 'commands/batch' },
  ],
  outdir: 'dist',
  external: ['agent-browser'],
  splitting: true,
});

// Bundle UI panel
await buildPanel({
  entryPoints: [{ in: 'src/ui/panel.tsx', out: 'panel' }],
  outdir: 'dist',
});

await archiveDist('dist', manifest.version);
