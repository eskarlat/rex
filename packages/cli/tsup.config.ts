import { readFileSync } from 'node:fs';
import { defineConfig } from 'tsup';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version: string };
const sdkPkg = JSON.parse(readFileSync('../extension-sdk/package.json', 'utf-8')) as {
  version: string;
};

export default defineConfig({
  entry: ['src/index.ts', 'src/lib.ts'],
  format: ['esm'],
  tsconfig: 'tsconfig.build.json',
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'node20',
  outDir: 'dist',
  splitting: false,
  external: ['better-sqlite3', 'yazl'],
  define: {
    __CLI_VERSION__: JSON.stringify(pkg.version),
    __SDK_VERSION__: JSON.stringify(sdkPkg.version),
  },
});
