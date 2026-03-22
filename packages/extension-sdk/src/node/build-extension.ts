import type { BuildExtensionOptions } from './types.js';

/**
 * Build extension Node.js entry points using esbuild.
 * Bundles all dependencies into self-contained ESM files so extensions
 * work after installation without node_modules.
 *
 * @example
 * await buildExtension({
 *   entryPoints: [
 *     { in: 'src/index.ts', out: 'index' },
 *     { in: 'src/server.ts', out: 'server' },
 *     { in: 'src/commands/status.ts', out: 'commands/status' },
 *   ],
 *   outdir: 'dist',
 * });
 */
export async function buildExtension(options: BuildExtensionOptions): Promise<void> {
  const { build } = await import('esbuild');

  const esbuildEntries = options.entryPoints.map((e) => ({
    in: e.in,
    out: e.out,
  }));

  await build({
    entryPoints: esbuildEntries,
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node20',
    outdir: options.outdir,
    external: options.external ?? [],
    splitting: options.splitting ?? false,
    chunkNames: 'chunks/[name]-[hash]',
    banner: {
      js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
    },
    ...(options.minify ? { minify: true } : {}),
  });
}
