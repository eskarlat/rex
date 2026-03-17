import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: { resolve: false },
  clean: true,
  sourcemap: true,
  target: 'node20',
  outDir: 'dist',
  splitting: false,
  tsconfig: 'tsconfig.json',
  external: ['@renre-kit/cli', 'better-sqlite3'],
});
