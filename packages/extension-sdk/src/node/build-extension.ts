import { createWriteStream, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { pipeline } from 'node:stream/promises';

import yazl from 'yazl';

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

function collectFiles(dir: string, base: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, base));
    } else {
      results.push(relative(base, fullPath));
    }
  }
  return results;
}

/**
 * Package the contents of `outdir` into `extension-{version}.zip`,
 * then remove the raw files. Call this after all build steps (buildExtension,
 * buildPanel) have written to the same outdir.
 *
 * The CLI extracts this archive during extension installation so command
 * handlers and UI panels resolve at their expected paths.
 *
 * @example
 * await buildExtension({ ..., outdir: 'dist' });
 * await buildPanel({ ..., outdir: 'dist' });
 * await archiveDist('dist', '1.0.0');
 * // produces dist/extension-1.0.0.zip
 */
export async function archiveDist(outdir: string, version: string): Promise<void> {
  const dir = resolve(outdir);
  if (!existsSync(dir)) {
    throw new Error(`Output directory does not exist: ${dir}`);
  }

  const zipName = `extension-${version}.zip`;
  const zipPath = join(dir, zipName);

  if (existsSync(zipPath)) {
    rmSync(zipPath);
  }

  const files = collectFiles(dir, dir);
  const zip = new yazl.ZipFile();

  for (const file of files) {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);
    // ZIP spec requires forward slashes — normalize for Windows
    const zipEntryName = sep === '\\' ? file.replaceAll('\\', '/') : file;
    zip.addFile(fullPath, zipEntryName, { mtime: stat.mtime, mode: stat.mode });
  }

  zip.end();

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  await pipeline(zip.outputStream, createWriteStream(zipPath));

  // Remove everything except the archive
  for (const entry of readdirSync(dir)) {
    if (entry !== zipName) {
      rmSync(join(dir, entry), { recursive: true, force: true });
    }
  }
}
