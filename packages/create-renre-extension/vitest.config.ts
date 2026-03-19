import { defineConfig } from 'vitest/config';
import { createCoverageConfig } from '../../vitest.shared.js';

export default defineConfig({
  test: {
    globals: true,
    passWithNoTests: true,
    include: ['src/**/*.test.ts'],
    ...createCoverageConfig(),
  },
});
