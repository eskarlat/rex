import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    coverage: {
      provider: 'istanbul',
      thresholds: {
        statements: 86,
        branches: 86,
        functions: 86,
        lines: 86,
      },
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/test-setup.ts',
        'dist/**',
        'vitest.config.ts',
      ],
    },
  },
});
