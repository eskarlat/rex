import { defineConfig } from 'vitest/config';
import { createCoverageConfig, createSrcAlias } from '../../vitest.shared.js';

export default defineConfig({
  resolve: {
    alias: createSrcAlias(import.meta.url),
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
