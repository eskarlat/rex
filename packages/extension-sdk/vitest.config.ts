import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';
import { createCoverageConfig, createSrcAlias } from '../../vitest.shared.js';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version: string };

export default defineConfig({
  resolve: {
    alias: createSrcAlias(import.meta.url),
  },
  define: {
    __SDK_VERSION__: JSON.stringify(pkg.version),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    passWithNoTests: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    ...createCoverageConfig({
      exclude: [
        'src/index.ts',
        'src/components/ui/**',
        'src/components/index.ts',
        'src/test-setup.ts',
      ],
    }),
  },
});
