// @vitest-environment node
import { mkdirSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('esbuild', () => ({
  build: vi.fn().mockResolvedValue(undefined),
}));

const { buildExtension, archiveDist } = await import('./build-extension.js');

describe('buildExtension', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls esbuild.build with correct default options', async () => {
    const { build } = await import('esbuild');
    await buildExtension({
      entryPoints: [{ in: 'src/index.ts', out: 'index' }],
      outdir: 'dist',
    });

    expect(build).toHaveBeenCalledWith(
      expect.objectContaining({
        entryPoints: [{ in: 'src/index.ts', out: 'index' }],
        bundle: true,
        format: 'esm',
        platform: 'node',
        target: 'node20',
        outdir: 'dist',
        external: [],
        splitting: false,
        chunkNames: 'chunks/[name]-[hash]',
        banner: {
          js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
        },
      }),
    );
  });

  it('supports multiple entry points', async () => {
    const { build } = await import('esbuild');
    await buildExtension({
      entryPoints: [
        { in: 'src/index.ts', out: 'index' },
        { in: 'src/server.ts', out: 'server' },
        { in: 'src/commands/status.ts', out: 'commands/status' },
      ],
      outdir: 'dist',
    });

    expect(build).toHaveBeenCalledWith(
      expect.objectContaining({
        entryPoints: [
          { in: 'src/index.ts', out: 'index' },
          { in: 'src/server.ts', out: 'server' },
          { in: 'src/commands/status.ts', out: 'commands/status' },
        ],
      }),
    );
  });

  it('passes external packages when specified', async () => {
    const { build } = await import('esbuild');
    await buildExtension({
      entryPoints: [{ in: 'src/index.ts', out: 'index' }],
      outdir: 'dist',
      external: ['better-sqlite3', 'sharp'],
    });

    expect(build).toHaveBeenCalledWith(
      expect.objectContaining({
        external: ['better-sqlite3', 'sharp'],
      }),
    );
  });

  it('enables minification when requested', async () => {
    const { build } = await import('esbuild');
    await buildExtension({
      entryPoints: [{ in: 'src/index.ts', out: 'index' }],
      outdir: 'dist',
      minify: true,
    });

    expect(build).toHaveBeenCalledWith(
      expect.objectContaining({
        minify: true,
      }),
    );
  });

  it('does not include minify key when not requested', async () => {
    const { build } = await import('esbuild');
    await buildExtension({
      entryPoints: [{ in: 'src/index.ts', out: 'index' }],
      outdir: 'dist',
    });

    const call = vi.mocked(build).mock.calls[0];
    const opts = call?.[0] as Record<string, unknown>;
    expect(opts).not.toHaveProperty('minify');
  });

  it('includes createRequire banner for Node.js CJS compatibility', async () => {
    const { build } = await import('esbuild');
    await buildExtension({
      entryPoints: [{ in: 'src/index.ts', out: 'index' }],
      outdir: 'dist',
    });

    expect(build).toHaveBeenCalledWith(
      expect.objectContaining({
        banner: {
          js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
        },
      }),
    );
  });

  it('defaults external to empty array when not provided', async () => {
    const { build } = await import('esbuild');
    await buildExtension({
      entryPoints: [{ in: 'src/index.ts', out: 'index' }],
      outdir: 'dist',
    });

    expect(build).toHaveBeenCalledWith(
      expect.objectContaining({
        external: [],
      }),
    );
  });

  it('enables code splitting when requested', async () => {
    const { build } = await import('esbuild');
    await buildExtension({
      entryPoints: [{ in: 'src/index.ts', out: 'index' }],
      outdir: 'dist',
      splitting: true,
    });

    expect(build).toHaveBeenCalledWith(
      expect.objectContaining({
        splitting: true,
        chunkNames: 'chunks/[name]-[hash]',
      }),
    );
  });
});

describe('archiveDist', () => {
  function makeTmpDir(): string {
    const dir = join(tmpdir(), `archiveDist-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(dir, { recursive: true });
    return dir;
  }

  it('creates versioned archive and removes raw files', async () => {
    const dir = makeTmpDir();
    try {
      writeFileSync(join(dir, 'index.js'), 'export default 1;');
      mkdirSync(join(dir, 'commands'));
      writeFileSync(join(dir, 'commands', 'foo.js'), 'export default 2;');

      await archiveDist(dir, '1.0.0');

      const entries = readdirSync(dir);
      expect(entries).toEqual(['extension-1.0.0.zip']);
      expect(existsSync(join(dir, 'extension-1.0.0.zip'))).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('throws when outdir does not exist', async () => {
    await expect(archiveDist('/tmp/nonexistent-dir-' + Date.now(), '1.0.0')).rejects.toThrow(
      'Output directory does not exist',
    );
  });

  it('replaces an existing archive', async () => {
    const dir = makeTmpDir();
    try {
      writeFileSync(join(dir, 'extension-2.0.0.zip'), 'stale');
      writeFileSync(join(dir, 'index.js'), 'export default 1;');

      await archiveDist(dir, '2.0.0');

      const entries = readdirSync(dir);
      expect(entries).toEqual(['extension-2.0.0.zip']);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
