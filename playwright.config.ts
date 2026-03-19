import { defineConfig } from '@playwright/test';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const E2E_HOME = mkdtempSync(join(tmpdir(), 'renre-e2e-'));

// Write E2E_HOME to a file so test workers can read it
writeFileSync(join(__dirname, '.e2e-home'), E2E_HOME);

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  globalTeardown: './e2e/global-teardown.ts',
  use: {
    baseURL: 'http://localhost:4201',
    headless: true,
  },
  webServer: [
    {
      // Start the API server (Fastify on port 4200)
      command: 'node packages/cli/bin/renre-kit.js ui --port 4200 --no-browser',
      port: 4200,
      timeout: 15_000,
      reuseExistingServer: !process.env['CI'],
      env: { HOME: E2E_HOME, RENRE_KIT_HOME: join(E2E_HOME, '.renre-kit') },
    },
    {
      // Start the UI dev server (Vite on port 4201, proxies /api to 4200)
      command: 'pnpm --filter @renre-kit/ui dev',
      port: 4201,
      timeout: 30_000,
      reuseExistingServer: !process.env['CI'],
    },
  ],
});
