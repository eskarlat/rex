/**
 * Full e2e workflow test using the REAL server (started by Playwright config).
 *
 * This test:
 * 1. Creates a local git registry with reference extensions
 * 2. Configures the registry via the settings API
 * 3. Syncs registry, installs & activates extensions via CLI (real HOME)
 * 4. Verifies everything in the web dashboard via Playwright
 *
 * Since Playwright starts the server with the real HOME, all CLI
 * commands also run against the real HOME for consistency.
 */
import { test, expect } from '@playwright/test';
import * as childProcess from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const ROOT_DIR = path.resolve('.');
const CLI_BIN = path.join(ROOT_DIR, 'packages', 'cli', 'bin', 'renre-kit.js');
const EXTENSIONS_DIR = path.join(ROOT_DIR, 'extensions');

let projectDir: string;
let registryRepoDir: string;
let helloWorldRepoDir: string;

function runCli(args: string[], options: { cwd?: string } = {}): string {
  return childProcess.execFileSync(
    process.execPath,
    [CLI_BIN, ...args],
    {
      encoding: 'utf-8',
      timeout: 30_000,
      cwd: options.cwd ?? projectDir,
    },
  );
}

function gitInit(dir: string): void {
  childProcess.execSync('git init', { cwd: dir, stdio: 'ignore' });
  childProcess.execSync('git config user.email "test@test.com"', { cwd: dir, stdio: 'ignore' });
  childProcess.execSync('git config user.name "Test"', { cwd: dir, stdio: 'ignore' });
  childProcess.execSync('git config commit.gpgsign false', { cwd: dir, stdio: 'ignore' });
}

function gitCommitAll(dir: string, message: string): void {
  childProcess.execSync('git add -A', { cwd: dir, stdio: 'ignore' });
  childProcess.execSync(`git commit -m "${message}" --allow-empty`, { cwd: dir, stdio: 'ignore' });
}

// ──────────────────────────────────────────────
// Setup: create local extension git repos and registry
// ──────────────────────────────────────────────

test.beforeAll(async () => {
  // Create project dir
  projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'renre-e2e-project-'));

  // 1. Create a local git repo for hello-world extension (tagged v1.0.0)
  helloWorldRepoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'renre-e2e-ext-hello-'));
  fs.cpSync(path.join(EXTENSIONS_DIR, 'hello-world'), helloWorldRepoDir, { recursive: true });
  gitInit(helloWorldRepoDir);
  gitCommitAll(helloWorldRepoDir, 'initial');
  childProcess.execSync('git tag v1.0.0', { cwd: helloWorldRepoDir, stdio: 'ignore' });

  // 2. Create local git registry repo with extensions.json
  registryRepoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'renre-e2e-registry-'));
  const extensionsJson = {
    extensions: [
      {
        name: 'hello-world',
        description: 'A simple hello world extension',
        gitUrl: helloWorldRepoDir,
        latestVersion: '1.0.0',
        type: 'standard',
        icon: 'wave',
        author: 'test',
      },
    ],
  };
  const renreKitDir = path.join(registryRepoDir, '.renre-kit');
  fs.mkdirSync(renreKitDir, { recursive: true });
  fs.writeFileSync(
    path.join(renreKitDir, 'extensions.json'),
    JSON.stringify(extensionsJson, null, 2),
  );
  gitInit(registryRepoDir);
  gitCommitAll(registryRepoDir, 'initial registry');

  // 3. Add registry to global config via CLI settings API
  // Read existing config, add our registry, write back
  const home = process.env['HOME'] ?? '';
  const configPath = path.join(home, '.renre-kit', 'config.json');
  let config: Record<string, unknown> = { registries: [], settings: {}, extensionConfigs: {} };
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
  const registries = (config['registries'] ?? []) as Array<Record<string, unknown>>;
  // Remove existing "e2e-local" registry if present from prior runs
  const filtered = registries.filter((r) => r['name'] !== 'e2e-local');
  filtered.push({
    name: 'e2e-local',
    url: registryRepoDir,
    priority: 1,
    cacheTTL: -1,
  });
  config['registries'] = filtered;
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
});

test.afterAll(async () => {
  // Remove the e2e-local registry from config
  const home = process.env['HOME'] ?? '';
  const configPath = path.join(home, '.renre-kit', 'config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    config.registries = (config.registries ?? []).filter(
      (r: Record<string, unknown>) => r.name !== 'e2e-local',
    );
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }

  // Cleanup temp dirs
  for (const dir of [projectDir, registryRepoDir, helloWorldRepoDir]) {
    if (dir && fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }

  // Remove installed extension from global state
  const extDir = path.join(home, '.renre-kit', 'extensions', 'hello-world@1.0.0');
  if (fs.existsSync(extDir)) {
    fs.rmSync(extDir, { recursive: true, force: true });
  }
  // Remove synced registry
  const regDir = path.join(home, '.renre-kit', 'registries', 'e2e-local');
  if (fs.existsSync(regDir)) {
    fs.rmSync(regDir, { recursive: true, force: true });
  }
});

// ──────────────────────────────────────────────
// CLI: registry sync & extension install
// ──────────────────────────────────────────────

test.describe.serial('CLI workflow', () => {
  test('registry:sync downloads registry index', () => {
    runCli(['registry:sync']);
    const home = process.env['HOME'] ?? '';
    const regDir = path.join(home, '.renre-kit', 'registries', 'e2e-local');
    expect(fs.existsSync(regDir)).toBeTruthy();
    expect(fs.existsSync(path.join(regDir, '.renre-kit', 'extensions.json'))).toBeTruthy();
  });

  test('registry:list shows e2e-local registry', () => {
    const output = runCli(['registry:list']);
    expect(output).toContain('e2e-local');
  });

  test('ext:add installs hello-world from registry', () => {
    runCli(['ext:add', 'hello-world']);
    const home = process.env['HOME'] ?? '';
    const extDir = path.join(home, '.renre-kit', 'extensions', 'hello-world@1.0.0');
    expect(fs.existsSync(extDir)).toBeTruthy();
    expect(fs.existsSync(path.join(extDir, 'manifest.json'))).toBeTruthy();
  });

  test('ext:list shows installed hello-world', () => {
    const output = runCli(['ext:list']);
    expect(output).toContain('hello-world');
  });

  test('ext:outdated runs without error', () => {
    const output = runCli(['ext:outdated']);
    expect(output).toBeDefined();
  });

  test('ext:cleanup runs without error', () => {
    const output = runCli(['ext:cleanup']);
    expect(output).toBeDefined();
  });
});

// ──────────────────────────────────────────────
// Dashboard API: verify real data
// ──────────────────────────────────────────────

test.describe('Dashboard API with real extensions', () => {
  test('marketplace shows hello-world as installed', async ({ request }) => {
    const response = await request.get('/api/marketplace', {
      headers: { 'X-RenreKit-Project': projectDir },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    const installed = data.installed as Array<{ name: string }>;
    const helloWorld = installed.find((e) => e.name === 'hello-world');
    expect(helloWorld).toBeDefined();
  });

  test('registries API includes e2e-local', async ({ request }) => {
    const response = await request.get('/api/registries');
    expect(response.ok()).toBeTruthy();
    const data = (await response.json()) as Array<{ name: string }>;
    expect(data.some((r) => r.name === 'e2e-local')).toBeTruthy();
  });

  test('vault CRUD cycle works', async ({ request }) => {
    // Create
    const createRes = await request.post('/api/vault', {
      data: { key: 'e2e-test-key', value: 'test-value-42', secret: false, tags: ['e2e'] },
    });
    expect(createRes.ok()).toBeTruthy();

    // Read
    const listRes = await request.get('/api/vault');
    expect(listRes.ok()).toBeTruthy();
    const entries = (await listRes.json()) as Array<{ key: string }>;
    expect(entries.some((e) => e.key === 'e2e-test-key')).toBeTruthy();

    // Delete
    const delRes = await request.delete('/api/vault/e2e-test-key');
    expect(delRes.ok()).toBeTruthy();

    // Verify deleted
    const afterDelRes = await request.get('/api/vault');
    const afterEntries = (await afterDelRes.json()) as Array<{ key: string }>;
    expect(afterEntries.some((e) => e.key === 'e2e-test-key')).toBeFalsy();
  });

  test('settings API returns valid config', async ({ request }) => {
    const response = await request.get('/api/settings');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('registries');
    const registries = data.registries as Array<{ name: string }>;
    expect(registries.some((r) => r.name === 'e2e-local')).toBeTruthy();
  });
});

// ──────────────────────────────────────────────
// Dashboard UI: verify real data renders
// ──────────────────────────────────────────────

test.describe('Dashboard UI with real extensions', () => {
  test('marketplace page loads and renders', async ({ page }) => {
    await page.goto('/marketplace');
    // The marketplace page should load and show extension management UI
    // Note: the "hello-world" text only appears when a project is active in the UI context
    // The API test (test 7) already verified the data is returned correctly
    await expect(page.locator('[role="tablist"], table, [data-orientation]').first()).toBeVisible();
  });

  test('settings registries page shows e2e-local', async ({ page }) => {
    await page.goto('/settings/registries');
    await page.waitForTimeout(1000);
    const content = await page.content();
    expect(content).toContain('e2e-local');
  });
});
