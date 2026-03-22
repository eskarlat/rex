/**
 * MJS integration test for the `renre-kit start` command.
 *
 * Starts the dashboard server via the CLI and verifies that:
 * 1. The server starts and listens on the specified port
 * 2. It responds to HTTP requests
 * 3. It shuts down cleanly on SIGTERM
 */
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

const CLI_BIN = join(import.meta.dirname, '..', 'packages', 'cli', 'bin', 'renre-kit.js');

/**
 * Wait for a port to be listening by polling.
 */
async function waitForPort(port, timeoutMs = 10_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/projects`, {
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

describe('ui command — server lifecycle', () => {
  const TEST_PORT = 14_200 + Math.floor(Math.random() * 1000);
  let serverProc;

  before(async () => {
    // Start the start command with --no-browser to avoid opening browser
    serverProc = spawn(
      process.execPath,
      [CLI_BIN, 'start', '--port', String(TEST_PORT), '--no-browser'],
      {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env },
      },
    );

    // Collect stdout for debugging
    let stdout = '';
    serverProc.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    serverProc.stderr.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    const ready = await waitForPort(TEST_PORT, 10_000);
    if (!ready) {
      console.error('Server stdout/stderr:', stdout);
    }
    assert.ok(ready, `Server should be listening on port ${TEST_PORT}`);
  });

  after(async () => {
    if (serverProc && serverProc.exitCode === null) {
      serverProc.kill('SIGTERM');
      // Wait for process to exit, escalate to SIGKILL if needed
      const exited = await new Promise((resolve) => {
        serverProc.on('exit', () => resolve(true));
        setTimeout(() => resolve(false), 3000);
      });
      if (!exited && serverProc.exitCode === null) {
        serverProc.kill('SIGKILL');
      }
    }
  });

  it('server responds to HTTP requests', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/projects`, {
      headers: { 'X-RenreKit-Project': '/tmp/test-project' },
      signal: AbortSignal.timeout(3000),
    });
    // The exact status depends on whether the project exists,
    // but the server should respond (not connection refused)
    assert.ok(res.status < 500, `Server should respond, got status ${res.status}`);
  });

  it('server shuts down on SIGTERM', async () => {
    serverProc.kill('SIGTERM');
    const exitCode = await new Promise((resolve) => {
      serverProc.on('exit', (code) => resolve(code));
      setTimeout(() => resolve('timeout'), 5000);
    });
    assert.notEqual(exitCode, 'timeout', 'Server should exit on SIGTERM');
  });
});
