import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'text-summary', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/index.ts',
        'src/ui/**',
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
