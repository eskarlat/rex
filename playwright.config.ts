import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
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
