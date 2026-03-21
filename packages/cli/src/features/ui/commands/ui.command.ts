import { spawn } from 'node:child_process';
import { createConnection } from 'node:net';
import { resolve, dirname } from 'node:path';
import { existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

import * as clack from '@clack/prompts';

import { SERVER_PID_PATH, LAN_PIN_PATH, GLOBAL_DIR } from '../../../core/paths/paths.js';
import { isProcessRunning, readPidFile } from '../../../shared/process-utils.js';

export interface UiCommandOptions {
  port: number;
  lan: boolean;
  noBrowser: boolean;
  noSleep: boolean;
}

const DEFAULT_PORT = 4200;

function openBrowser(url: string): void {
  const platform = os.platform();
  const commands: Record<string, [string, string[]]> = {
    darwin: ['open', [url]],
    win32: ['cmd', ['/c', 'start', url]],
    linux: ['xdg-open', [url]],
  };
  const entry = commands[platform];
  if (!entry) {
    return;
  }
  const [cmd, args] = entry;
   
  const proc = spawn(cmd, args, { stdio: 'ignore', detached: true });
  proc.unref();
}

function resolveServerEntry(): string {
  // Try using Node module resolution via createRequire
  try {
    const esmRequire = createRequire(import.meta.url);
    return esmRequire.resolve('@renre-kit/server');
  } catch {
    // noop
  }

  // Resolve from monorepo structure: packages/cli/dist/ -> packages/server/dist/
  // In source: src/features/ui/commands/ -> 6 levels up to packages/, then server/dist/
  // In bundle: dist/ -> 2 levels up to packages/, then server/dist/
  const thisDir = dirname(fileURLToPath(import.meta.url));
  const levelsUp = [2, 3, 4, 5, 6];
  for (const n of levelsUp) {
    const segments = Array.from({ length: n }, () => '..');
    const candidate = resolve(thisDir, ...segments, 'server', 'dist', 'index.js');
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error('Could not find @renre-kit/server. Ensure the server package is built.');
}

function waitForServer(url: string, timeoutMs: number): Promise<boolean> {
  return new Promise((resolvePromise) => {
    const start = Date.now();
    const check = (): void => {
      fetch(url)
        .then((res) => {
          if (res.status < 500) {
            resolvePromise(true);
          } else {
            retry();
          }
        })
        .catch(() => {
          retry();
        });
    };
    const retry = (): void => {
      if (Date.now() - start >= timeoutMs) {
        resolvePromise(false);
        return;
      }
      setTimeout(check, 300);
    };
    check();
  });
}

function isPortInUse(port: number, host: string): Promise<boolean> {
  return new Promise((resolvePromise) => {
    const socket = createConnection({ port, host });
    socket.once('connect', () => {
      socket.destroy();
      resolvePromise(true);
    });
    socket.once('error', () => {
      socket.destroy();
      resolvePromise(false);
    });
  });
}

function buildDashboardUrl(port: number, lan: boolean): string {
  const host = lan ? '0.0.0.0' : '127.0.0.1';
  return `http://${lan ? 'localhost' : host}:${port}`;
}

function buildServerEnv(port: number, lan: boolean, noSleep: boolean): Record<string, string> {
  const env: Record<string, string> = {
    ...(process.env as Record<string, string>),
    PORT: String(port),
  };
  if (lan) env['LAN_MODE'] = 'true';
  if (noSleep) env['NO_SLEEP'] = 'true';
  return env;
}

/** Returns true if an existing server is already running (early exit). */
function checkExistingServer(url: string): boolean {
  const existingPid = readPidFile(SERVER_PID_PATH);
  if (existingPid === null) return false;

  if (isProcessRunning(existingPid)) {
    clack.log.warn(`Dashboard server is already running (PID ${existingPid}).`);
    clack.outro(`Dashboard: ${url}`);
    return true;
  }

  // Stale PID file — clean up
  try {
    unlinkSync(SERVER_PID_PATH);
  } catch {
    // PID file may have been removed by another process
  }
  return false;
}

interface SpawnResult {
  pid: number;
  ready: boolean;
}

function spawnServer(env: Record<string, string>): {
  pid: number | undefined;
  child: ReturnType<typeof spawn>;
} {
  const child = spawn(process.execPath, [resolveServerEntry()], {
    env,
    detached: true,
    stdio: 'ignore',
  });

  child.on('error', (err) => {
    clack.log.error(err.message);
    process.exit(1);
  });

  return { pid: child.pid, child };
}

async function startAndVerifyServer(
  port: number,
  env: Record<string, string>,
): Promise<SpawnResult | null> {
  const { pid, child } = spawnServer(env);
  if (pid === undefined) {
    clack.log.error('Could not obtain server process ID.');
    process.exit(1);
    return null;
  }

  mkdirSync(GLOBAL_DIR, { recursive: true });
  writeFileSync(SERVER_PID_PATH, String(pid), 'utf-8');
  child.unref();

  const ready = await waitForServer(`http://127.0.0.1:${port}/api/projects`, 5000);

  // Verify the spawned process is still alive — it may have crashed (e.g. EADDRINUSE)
  if (!isProcessRunning(pid)) {
    clack.log.error(
      `Server process ${pid} exited unexpectedly. Port ${port} may be in use by another process.`,
    );
    try {
      unlinkSync(SERVER_PID_PATH);
    } catch {
      /* already removed */
    }
    return null;
  }

  return { pid, ready };
}

function resolveOptions(options: Partial<UiCommandOptions>): UiCommandOptions {
  return {
    port: options.port ?? DEFAULT_PORT,
    lan: options.lan ?? false,
    noBrowser: options.noBrowser ?? false,
    noSleep: options.noSleep ?? false,
  };
}

function showLanPin(): void {
  try {
    const pin = readFileSync(LAN_PIN_PATH, 'utf-8').trim();
    clack.log.info(`LAN PIN: ${pin}`);
  } catch {
    // PIN file not yet written — server may still be initializing
  }
}

export async function handleUi(options: Partial<UiCommandOptions> = {}): Promise<void> {
  clack.intro('RenreKit Dashboard');

  const { port, lan, noBrowser, noSleep } = resolveOptions(options);
  const url = buildDashboardUrl(port, lan);

  if (checkExistingServer(url)) return;

  // Check if the port is already occupied by another process
  const portBusy = await isPortInUse(port, '127.0.0.1');
  if (portBusy) {
    clack.log.error(
      `Port ${port} is already in use. Stop the other process or use --port to pick a different port.`,
    );
    clack.outro('Could not start dashboard.');
    return;
  }

  const env = buildServerEnv(port, lan, noSleep);
  const s = clack.spinner();
  s.start('Starting dashboard server...');

  const result = await startAndVerifyServer(port, env);
  if (!result) {
    s.stop('Failed to start server.');
    return;
  }

  s.stop(result.ready ? 'Dashboard server is running.' : 'Server started (still initializing).');

  if (!noBrowser) openBrowser(url);

  clack.log.info(`PID: ${result.pid}`);

  if (lan) showLanPin();

  clack.outro(`Dashboard: ${url}`);
}
