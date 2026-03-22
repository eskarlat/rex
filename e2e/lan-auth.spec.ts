/**
 * E2E test for LAN server mode with real UI.
 *
 * Spawns a real LAN-mode server (with PIN auth) and verifies:
 * 1. The PIN prompt is shown when accessing the dashboard
 * 2. Submitting the wrong PIN shows an error
 * 3. Submitting the correct PIN (read from the pin file) shows the dashboard
 * 4. Non-LAN server access bypasses the PIN prompt entirely
 */
import { test, expect } from '@playwright/test';
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const CLI_BIN = join(__dirname, '..', 'packages', 'cli', 'bin', 'renre-kit.js');

/** Poll until the server responds on the auth status endpoint. */
async function waitForServer(port: number, timeoutMs = 15_000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/auth/status`, {
        signal: AbortSignal.timeout(1000),
      });
      if (res.ok || res.status < 500) return true;
    } catch {
      // not ready
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

/** Kill a process tree — send SIGTERM then SIGKILL if needed. */
async function killProc(proc: ChildProcess, pid?: number): Promise<void> {
  if (pid) {
    try {
      process.kill(pid, 'SIGTERM');
    } catch {
      /* already dead */
    }
  }
  if (proc.exitCode === null) {
    proc.kill('SIGTERM');
    const exited = await new Promise<boolean>((resolve) => {
      proc.on('exit', () => resolve(true));
      setTimeout(() => resolve(false), 3000);
    });
    if (!exited && proc.exitCode === null) {
      proc.kill('SIGKILL');
    }
  }
}

// ──────────────────────────────────────────────
// LAN mode — PIN prompt UI
// ──────────────────────────────────────────────

test.describe('LAN Auth — real server UI', () => {
  const LAN_PORT = 14_500 + Math.floor(Math.random() * 500);
  const E2E_HOME = mkdtempSync(join(tmpdir(), 'renre-lan-ui-e2e-'));
  const RENRE_KIT_HOME = join(E2E_HOME, '.renre-kit');
  let serverProc: ChildProcess;
  let serverPid: number | undefined;
  let lanPin: string;

  test.beforeAll(async () => {
    serverProc = spawn(
      process.execPath,
      [CLI_BIN, 'ui', '--port', String(LAN_PORT), '--no-browser', '--lan'],
      {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, HOME: E2E_HOME, RENRE_KIT_HOME },
      },
    );

    // Collect output for debugging
    let stdout = '';
    serverProc.stdout!.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    serverProc.stderr!.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    const ready = await waitForServer(LAN_PORT);
    if (!ready) {
      console.error('LAN server stdout/stderr:', stdout);
      throw new Error(`LAN server did not start on port ${LAN_PORT}`);
    }

    // Read the generated PIN
    lanPin = readFileSync(join(RENRE_KIT_HOME, 'lan-pin'), 'utf-8').trim();

    // Read the detached server PID for cleanup
    try {
      serverPid = Number(readFileSync(join(RENRE_KIT_HOME, 'server.pid'), 'utf-8').trim());
    } catch {
      // CLI may still be the direct process
    }

    // Wait for CLI process to finish its output
    await new Promise<void>((resolve) => {
      serverProc.on('exit', () => resolve());
      setTimeout(() => resolve(), 3000);
    });
  });

  test.afterAll(async () => {
    await killProc(serverProc, serverPid);
  });

  test('shows PIN prompt when accessing the dashboard', async ({ page }) => {
    await page.goto(`http://127.0.0.1:${LAN_PORT}/`);

    // PIN prompt card should be visible
    await expect(page.getByText('RenreKit Dashboard')).toBeVisible();
    await expect(
      page.getByText('Enter the PIN displayed in your terminal to access the dashboard.'),
    ).toBeVisible();
    await expect(page.getByLabel('PIN')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
  });

  test('submit button is disabled until 4 digits are entered', async ({ page }) => {
    await page.goto(`http://127.0.0.1:${LAN_PORT}/`);

    const submitButton = page.getByRole('button', { name: 'Submit' });

    // Disabled with empty input
    await expect(submitButton).toBeDisabled();

    // Disabled with partial PIN
    await page.getByLabel('PIN').pressSequentially('12');
    await expect(submitButton).toBeDisabled();

    // Enabled with full 4-digit PIN
    await page.getByLabel('PIN').pressSequentially('34');
    await expect(submitButton).toBeEnabled();
  });

  test('submitting wrong PIN shows error message', async ({ page }) => {
    await page.goto(`http://127.0.0.1:${LAN_PORT}/`);

    const wrongPin = lanPin === '0000' ? '1111' : '0000';
    await page.getByLabel('PIN').fill(wrongPin);
    await page.getByRole('button', { name: 'Submit' }).click();

    // Error should appear
    await expect(page.getByText('Invalid PIN. Please try again.')).toBeVisible();

    // PIN prompt should still be visible
    await expect(page.getByLabel('PIN')).toBeVisible();
  });

  test('submitting correct PIN shows the dashboard', async ({ page }) => {
    await page.goto(`http://127.0.0.1:${LAN_PORT}/`);

    // Enter the real PIN from the server
    await page.getByLabel('PIN').fill(lanPin);
    await page.getByRole('button', { name: 'Submit' }).click();

    // PIN prompt should disappear and dashboard content should load
    await expect(page.getByLabel('PIN')).not.toBeVisible({ timeout: 5000 });

    // The app should render real content (sidebar, heading, or root content)
    await expect(page.locator('#root')).toBeAttached();
    // Verify some dashboard element is visible (not the PIN prompt)
    const body = page.locator('body');
    await expect(body).not.toContainText('Enter the PIN displayed in your terminal');
  });

  test('can recover from wrong PIN and enter correct PIN', async ({ page }) => {
    await page.goto(`http://127.0.0.1:${LAN_PORT}/`);

    // First attempt: wrong PIN
    const wrongPin = lanPin === '9999' ? '8888' : '9999';
    await page.getByLabel('PIN').fill(wrongPin);
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText('Invalid PIN. Please try again.')).toBeVisible();

    // Second attempt: correct PIN
    await page.getByLabel('PIN').fill(lanPin);
    await page.getByRole('button', { name: 'Submit' }).click();

    // Dashboard should load
    await expect(page.getByLabel('PIN')).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator('body')).not.toContainText(
      'Enter the PIN displayed in your terminal',
    );
  });
});

// ──────────────────────────────────────────────
// Non-LAN mode — no auth bypass
// ──────────────────────────────────────────────

test.describe('Non-LAN server — no PIN required', () => {
  const NOLAN_PORT = 15_000 + Math.floor(Math.random() * 500);
  const E2E_HOME = mkdtempSync(join(tmpdir(), 'renre-nolan-ui-e2e-'));
  const RENRE_KIT_HOME = join(E2E_HOME, '.renre-kit');
  let serverProc: ChildProcess;
  let serverPid: number | undefined;

  test.beforeAll(async () => {
    serverProc = spawn(
      process.execPath,
      [CLI_BIN, 'ui', '--port', String(NOLAN_PORT), '--no-browser'],
      {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, HOME: E2E_HOME, RENRE_KIT_HOME },
      },
    );

    let stdout = '';
    serverProc.stdout!.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    serverProc.stderr!.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    // For non-LAN, poll /api/projects (no auth middleware)
    const start = Date.now();
    let ready = false;
    while (Date.now() - start < 15_000) {
      try {
        const res = await fetch(`http://127.0.0.1:${NOLAN_PORT}/api/projects`, {
          signal: AbortSignal.timeout(1000),
        });
        if (res.ok || res.status < 500) {
          ready = true;
          break;
        }
      } catch {
        // not ready
      }
      await new Promise((r) => setTimeout(r, 300));
    }

    if (!ready) {
      console.error('Non-LAN server stdout/stderr:', stdout);
      throw new Error(`Non-LAN server did not start on port ${NOLAN_PORT}`);
    }

    try {
      serverPid = Number(readFileSync(join(RENRE_KIT_HOME, 'server.pid'), 'utf-8').trim());
    } catch {
      // noop
    }

    await new Promise<void>((resolve) => {
      serverProc.on('exit', () => resolve());
      setTimeout(() => resolve(), 3000);
    });
  });

  test.afterAll(async () => {
    await killProc(serverProc, serverPid);
  });

  test('dashboard loads directly without PIN prompt', async ({ page }) => {
    await page.goto(`http://127.0.0.1:${NOLAN_PORT}/`);

    // PIN prompt should NOT be visible
    await expect(page.getByLabel('PIN')).not.toBeVisible();
    await expect(page.getByText('Enter the PIN displayed in your terminal')).not.toBeVisible();

    // Dashboard content should render
    await expect(page.locator('#root')).toBeAttached();
  });

  test('API is accessible without PIN cookie', async ({ request }) => {
    const res = await request.get(`http://127.0.0.1:${NOLAN_PORT}/api/projects`);
    expect(res.ok()).toBeTruthy();
  });
});
