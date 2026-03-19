// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('esbuild', () => ({
  build: vi.fn().mockResolvedValue(undefined),
}));

const { buildPanel } = await import('./build-panel.js');

describe('buildPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls esbuild.build with correct default options', async () => {
    const { build } = await import('esbuild');
    await buildPanel('src/panel.tsx', 'dist/panel.js');

    expect(build).toHaveBeenCalledWith(
      expect.objectContaining({
        entryPoints: ['src/panel.tsx'],
        bundle: true,
        format: 'esm',
        outfile: 'dist/panel.js',
        target: 'es2022',
        jsx: 'automatic',
        plugins: expect.arrayContaining([
          expect.objectContaining({ name: 'react-global' }),
        ]),
      }),
    );
  });

  it('merges additional esbuild options', async () => {
    const { build } = await import('esbuild');
    await buildPanel('src/panel.tsx', 'dist/panel.js', { minify: true });

    expect(build).toHaveBeenCalledWith(
      expect.objectContaining({
        minify: true,
        entryPoints: ['src/panel.tsx'],
      }),
    );
  });

  it('registers react-global plugin that handles react import', async () => {
    const { build } = await import('esbuild');
    await buildPanel('src/panel.tsx', 'dist/panel.js');

    const call = vi.mocked(build).mock.calls[0];
    expect(call).toBeDefined();
    const opts = call?.[0];
    expect(opts).toBeDefined();

    const plugins = opts && 'plugins' in opts ? opts.plugins : undefined;
    expect(plugins).toBeDefined();
    const plugin = plugins?.[0];
    expect(plugin).toBeDefined();
    expect(plugin?.name).toBe('react-global');

    // Test the plugin setup by simulating esbuild callbacks
    const onResolveCalls: Array<{
      filter: RegExp;
      callback: (args: { path: string }) => unknown;
    }> = [];
    const onLoadCalls: Array<{
      filter: RegExp;
      namespace: string;
      callback: (args: { path: string }) => unknown;
    }> = [];

    const mockBuild = {
      onResolve: (opts: { filter: RegExp }, cb: (args: { path: string }) => unknown) => {
        onResolveCalls.push({ filter: opts.filter, callback: cb });
      },
      onLoad: (
        opts: { filter: RegExp; namespace: string },
        cb: (args: { path: string }) => unknown,
      ) => {
        onLoadCalls.push({ filter: opts.filter, namespace: opts.namespace, callback: cb });
      },
    };

    plugin?.setup(mockBuild as never);

    // Test onResolve
    expect(onResolveCalls).toHaveLength(1);
    const resolveResult = onResolveCalls[0]?.callback({ path: 'react' });
    expect(resolveResult).toEqual({ path: 'react', namespace: 'react-global' });

    // Test onLoad for react
    expect(onLoadCalls).toHaveLength(1);
    const loadResult = onLoadCalls[0]?.callback({ path: 'react' }) as {
      contents: string;
      loader: string;
    };
    expect(loadResult.loader).toBe('js');
    expect(loadResult.contents).toContain('window.__RENRE_REACT__');

    // Test onLoad for react/jsx-runtime
    const jsxResult = onLoadCalls[0]?.callback({ path: 'react/jsx-runtime' }) as {
      contents: string;
      loader: string;
    };
    expect(jsxResult.loader).toBe('js');
    expect(jsxResult.contents).toContain('window.__RENRE_JSX_RUNTIME__');
  });
});
