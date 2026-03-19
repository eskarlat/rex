import type { Plugin, BuildOptions } from 'esbuild';

const reactGlobalPlugin: Plugin = {
  name: 'react-global',
  setup(b) {
    b.onResolve({ filter: /^react(\/jsx-runtime)?$/ }, (args) => ({
      path: args.path,
      namespace: 'react-global',
    }));
    b.onLoad({ filter: /.*/, namespace: 'react-global' }, (args) => {
      if (args.path === 'react/jsx-runtime') {
        return { contents: 'export const { jsx, jsxs, Fragment } = window.__RENRE_JSX_RUNTIME__;', loader: 'js' };
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
 * Build an extension UI panel using esbuild.
 * Bundles the panel as an ESM module with React resolved from dashboard globals.
 *
 * @param entryPoint - Path to the panel source file (e.g. 'src/ui/panel.tsx')
 * @param outfile - Output path (e.g. 'dist/panel.js')
 * @param options - Additional esbuild options to merge
 */
export async function buildPanel(
  entryPoint: string,
  outfile: string,
  options?: Partial<BuildOptions>,
): Promise<void> {
  const { build } = await import('esbuild');
  await build({
    entryPoints: [entryPoint],
    bundle: true,
    format: 'esm',
    outfile,
    target: 'es2022',
    jsx: 'automatic',
    plugins: [reactGlobalPlugin],
    ...options,
  });
}
