import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'text-summary', 'lcov'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/test-setup.ts',
        'src/main.tsx',
      ],
      thresholds: {
        statements: 86,
        branches: 86,
        functions: 86,
        lines: 86,
      },
    },
  },
});
