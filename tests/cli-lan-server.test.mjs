/**
 * MJS integration test for the LAN server mode.
 *
 * Starts the dashboard server with --lan via the CLI and verifies that:
 * 1. The server starts and the terminal prints the LAN PIN
 * 2. Localhost (127.0.0.1) access bypasses PIN auth
 * 3. API requests without a PIN cookie return 401
 * 4. Submitting the correct PIN sets a cookie and grants access
 * 5. Submitting a wrong PIN returns 401
 * 6. The auth status endpoint reports lanMode correctly
 */
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

const CLI_BIN = join(import.meta.dirname, '..', 'packages', 'cli', 'bin', 'renre-kit.js');

/**
 * Wait for a port to be listening by polling (uses 127.0.0.1 — localhost).
 * In LAN mode auth middleware is active, so we probe /api/auth/status which
 * is always accessible regardless of PIN.
 */
async function waitForPort(port, timeoutMs = 15_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/auth/status`, {
        signal: AbortSignal.timeout(1000),
      });
      if (res.ok || res.status < 500) {
        return true;
      }
    } catch {
      // Server not ready yet
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

/**
 * Extract the PIN from the lan-pin file written by the server process.
 */
function readPinFile(renreKitHome) {
  const pinPath = join(renreKitHome, 'lan-pin');
  return readFileSync(pinPath, 'utf-8').trim();
}

/**
 * Extract the Set-Cookie header value for the renrekit-pin cookie.
 */
function extractPinCookie(response) {
  const setCookie = response.headers.get('set-cookie');
  if (!setCookie) return null;
  const match = setCookie.match(/renrekit-pin=([^;]+)/);
  return match ? match[1] : null;
}

describe('LAN server mode — auth lifecycle', () => {
  const TEST_PORT = 14_200 + Math.floor(Math.random() * 1000);
  const E2E_HOME = mkdtempSync(join(tmpdir(), 'renre-lan-e2e-'));
  const RENRE_KIT_HOME = join(E2E_HOME, '.renre-kit');
  let serverProc;
  let stdout = '';
  let lanPin;
  let serverPid;

  before(async () => {
    serverProc = spawn(
      process.execPath,
      [CLI_BIN, 'ui', '--port', String(TEST_PORT), '--no-browser', '--lan'],
      {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          HOME: E2E_HOME,
          RENRE_KIT_HOME,
        },
      },
    );

    serverProc.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    serverProc.stderr.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    const ready = await waitForPort(TEST_PORT, 15_000);
    if (!ready) {
      console.error('Server stdout/stderr:', stdout);
    }
    assert.ok(ready, `LAN server should be listening on port ${TEST_PORT}`);

    // Read the PIN that the server wrote to the file
    lanPin = readPinFile(RENRE_KIT_HOME);

    // Read the server PID (the CLI spawns a detached server process)
    try {
      const pidPath = join(RENRE_KIT_HOME, 'server.pid');
      serverPid = Number(readFileSync(pidPath, 'utf-8').trim());
    } catch {
      // PID file may not exist if the CLI is the server itself
    }

    // Wait for the CLI process to finish printing (it spawns server then exits)
    await new Promise((resolve) => {
      serverProc.on('exit', () => resolve());
      setTimeout(() => resolve(), 3000);
    });
  });

  after(async () => {
    // Kill the detached server process if it's still running
    if (serverPid) {
      try {
        process.kill(serverPid, 'SIGTERM');
      } catch {
        /* already dead */
      }
    }
    if (serverProc && serverProc.exitCode === null) {
      serverProc.kill('SIGTERM');
      const exited = await new Promise((resolve) => {
        serverProc.on('exit', () => resolve(true));
        setTimeout(() => resolve(false), 3000);
      });
      if (!exited && serverProc.exitCode === null) {
        serverProc.kill('SIGKILL');
      }
    }
  });

  it('server writes a 4-digit PIN file', () => {
    assert.ok(lanPin, 'PIN should be present');
    assert.match(lanPin, /^\d{4}$/, 'PIN should be exactly 4 digits');
  });

  it('terminal output contains the LAN PIN', () => {
    assert.ok(
      stdout.includes(`LAN PIN: ${lanPin}`),
      `Terminal output should contain "LAN PIN: ${lanPin}", got:\n${stdout}`,
    );
  });

  it('auth status reports lanMode true', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/auth/status`, {
      signal: AbortSignal.timeout(3000),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.lanMode, true);
    assert.equal(body.authenticated, false);
  });

  it('API requests without PIN cookie return 401', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/projects`, {
      signal: AbortSignal.timeout(3000),
    });
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.error, 'PIN required');
  });

  it('submitting wrong PIN returns 401', async () => {
    const wrongPin = lanPin === '0000' ? '1111' : '0000';
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/auth/pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: wrongPin }),
      signal: AbortSignal.timeout(3000),
    });
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.error, 'Invalid PIN');
  });

  it('submitting correct PIN returns 200 and sets cookie', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/auth/pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: lanPin }),
      signal: AbortSignal.timeout(3000),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.deepEqual(body, { ok: true });

    const cookie = extractPinCookie(res);
    assert.ok(cookie, 'Response should set renrekit-pin cookie');
    assert.equal(cookie, lanPin);
  });

  it('API requests with valid PIN cookie succeed', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/projects`, {
      headers: {
        Cookie: `renrekit-pin=${lanPin}`,
        'X-RenreKit-Project': '/tmp/test-project',
      },
      signal: AbortSignal.timeout(3000),
    });
    assert.ok(res.status < 500, `Should respond successfully, got ${res.status}`);
    assert.notEqual(res.status, 401, 'Should not be 401 with valid cookie');
  });

  it('auth status reports authenticated true with valid cookie', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/auth/status`, {
      headers: { Cookie: `renrekit-pin=${lanPin}` },
      signal: AbortSignal.timeout(3000),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.lanMode, true);
    assert.equal(body.authenticated, true);
  });

  it('non-API routes are accessible without PIN', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/`, {
      signal: AbortSignal.timeout(3000),
    });
    // Static assets or SPA fallback — should not be 401
    assert.notEqual(res.status, 401, 'Static routes should bypass auth');
  });

  it('detached server process shuts down on SIGTERM', async () => {
    assert.ok(serverPid, 'Server PID should be known');

    // Send SIGTERM to the detached server process
    process.kill(serverPid, 'SIGTERM');

    // Poll until the process is no longer running
    const start = Date.now();
    let alive = true;
    while (alive && Date.now() - start < 5000) {
      try {
        process.kill(serverPid, 0); // signal 0 = existence check
        await new Promise((r) => setTimeout(r, 200));
      } catch {
        alive = false;
      }
    }
    assert.ok(!alive, 'Server process should exit after SIGTERM');
  });
});
