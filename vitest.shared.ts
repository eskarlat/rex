import { fileURLToPath, URL } from 'node:url';
import type { UserConfig } from 'vitest/config';

const COVERAGE_THRESHOLD = 86;

interface CoverageOptions {
  exclude?: string[];
}

const DEFAULT_EXCLUDE = ['src/index.ts'];

export function createCoverageConfig(opts: CoverageOptions = {}): UserConfig['test'] {
  return {
    coverage: {
      provider: 'istanbul' as const,
      reporter: ['text', 'text-summary', 'lcov'] as const,
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', ...(opts.exclude ?? []), ...DEFAULT_EXCLUDE],
      thresholds: {
        statements: COVERAGE_THRESHOLD,
        branches: COVERAGE_THRESHOLD,
        functions: COVERAGE_THRESHOLD,
        lines: COVERAGE_THRESHOLD,
      },
    },
  };
}

export function createSrcAlias(metaUrl: string): Record<string, string> {
  return { '@': fileURLToPath(new URL('./src', metaUrl)) };
}
