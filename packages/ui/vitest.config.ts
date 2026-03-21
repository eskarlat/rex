import { defineConfig } from 'vitest/config';
import { createCoverageConfig, createSrcAlias } from '../../vitest.shared.js';

export default defineConfig({
  resolve: {
    alias: createSrcAlias(import.meta.url),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    passWithNoTests: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    setupFiles: ['./src/test-setup.ts'],
    ...createCoverageConfig({
      exclude: ['src/test-setup.ts', 'src/main.tsx', 'src/App.tsx', 'src/components/ui/**'],
    }),
  },
});
