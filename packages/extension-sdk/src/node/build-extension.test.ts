// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('esbuild', () => ({
  build: vi.fn().mockResolvedValue(undefined),
}));

const { buildExtension } = await import('./build-extension.js');

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
