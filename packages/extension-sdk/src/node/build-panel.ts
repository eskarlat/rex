import type { Plugin, BuildOptions } from 'esbuild';

import type { BuildPanelOptions } from './types.js';

const reactGlobalPlugin: Plugin = {
  name: 'react-global',
  setup(b) {
    b.onResolve({ filter: /^react(\/jsx-runtime)?$/ }, (args) => ({
      path: args.path,
      namespace: 'react-global',
    }));
    b.onLoad({ filter: /.*/, namespace: 'react-global' }, (args) => {
      if (args.path === 'react/jsx-runtime') {
        return {
          contents: 'export const { jsx, jsxs, Fragment } = window.__RENRE_JSX_RUNTIME__;',
          loader: 'js',
        };
      }
      return {
        contents: [
          'const R = window.__RENRE_REACT__;',
          'export default R;',
          'export const {',
          '  useState, useEffect, useCallback, useMemo, useRef, useContext, useReducer, useId,',
          '  useLayoutEffect, useInsertionEffect, useImperativeHandle, useDebugValue,',
          '  useSyncExternalStore, useTransition, useDeferredValue,',
          '  createContext, createElement, createRef, forwardRef, memo, lazy,',
          '  Fragment, Suspense, StrictMode, Component, Children,',
          '  cloneElement, isValidElement, startTransition,',
          '} = R;',
        ].join('\n'),
        loader: 'js',
      };
    });
  },
};

/**
 * Build extension UI panels using esbuild.
 * Bundles panels as ESM modules with React resolved from dashboard globals.
 *
 * @example
 * // Multi-entry (recommended)
 * await buildPanel({
 *   entryPoints: [
 *     { in: 'src/ui/panel.tsx', out: 'panel' },
 *     { in: 'src/ui/status-widget.tsx', out: 'status-widget' },
 *   ],
 *   outdir: 'dist',
 * });
 *
 * @example
 * // Single-entry (legacy)
 * await buildPanel('src/ui/panel.tsx', 'dist/panel.js');
 */
export async function buildPanel(
  entryPointOrOptions: string | BuildPanelOptions,
  outfile?: string,
  options?: Partial<BuildOptions>,
): Promise<void> {
  const { build } = await import('esbuild');

  if (typeof entryPointOrOptions === 'string') {
    // Legacy single-entry signature: buildPanel('src/panel.tsx', 'dist/panel.js', opts?)
    await build({
      entryPoints: [entryPointOrOptions],
      bundle: true,
      format: 'esm',
      outfile,
      target: 'es2022',
      jsx: 'automatic',
      plugins: [reactGlobalPlugin],
      ...options,
    });
    return;
  }

  // Multi-entry signature: buildPanel({ entryPoints, outdir })
  const opts = entryPointOrOptions;
  const esbuildEntries = opts.entryPoints.map((e) => ({
    in: e.in,
    out: e.out,
  }));

  await build({
    entryPoints: esbuildEntries,
    bundle: true,
    format: 'esm',
    outdir: opts.outdir,
    target: 'es2022',
    jsx: 'automatic',
    plugins: [reactGlobalPlugin],
    ...(opts.minify ? { minify: true } : {}),
  });
}
