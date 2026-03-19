import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version: string };
const sdkPkg = JSON.parse(readFileSync('../extension-sdk/package.json', 'utf-8')) as {
  version: string;
};

export default defineConfig({
  define: {
    __CLI_VERSION__: JSON.stringify(pkg.version),
    __SDK_VERSION__: JSON.stringify(sdkPkg.version),
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'text-summary', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/types/**', 'src/index.ts'],
      thresholds: {
        statements: 86,
        branches: 86,
        functions: 86,
        lines: 86,
      },
    },
  },
});
