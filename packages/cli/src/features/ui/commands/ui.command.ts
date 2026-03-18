import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import * as clack from '@clack/prompts';
import { SERVER_PID_PATH, GLOBAL_DIR } from '../../../core/paths/paths.js';
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
  // eslint-disable-next-line sonarjs/no-os-command-from-path
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

function buildDashboardUrl(port: number, lan: boolean): string {
  const host = lan ? '0.0.0.0' : '127.0.0.1';
  return `http://${lan ? 'localhost' : host}:${port}`;
}

function buildServerEnv(port: number, lan: boolean, noSleep: boolean): Record<string, string> {
  const env: Record<string, string> = {
    ...process.env as Record<string, string>,
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

export async function handleUi(options: Partial<UiCommandOptions> = {}): Promise<void> {
  clack.intro('RenreKit Dashboard');

  const port = options.port ?? DEFAULT_PORT;
  const lan = options.lan ?? false;
  const noBrowser = options.noBrowser ?? false;
  const noSleep = options.noSleep ?? false;
  const url = buildDashboardUrl(port, lan);

  if (checkExistingServer(url)) return;

  const env = buildServerEnv(port, lan, noSleep);
  const s = clack.spinner();
  s.start('Starting dashboard server...');

  const child = spawn(process.execPath, [resolveServerEntry()], {
    env,
    detached: true,
    stdio: 'ignore',
  });

  child.on('error', (err) => {
    s.stop('Failed to start server.');
    clack.log.error(err.message);
    process.exit(1);
  });

  const pid = child.pid;
  if (pid === undefined) {
    s.stop('Failed to start server.');
    clack.log.error('Could not obtain server process ID.');
    process.exit(1);
    return;
  }

  mkdirSync(GLOBAL_DIR, { recursive: true });
  writeFileSync(SERVER_PID_PATH, String(pid), 'utf-8');
  child.unref();

  const ready = await waitForServer(`http://127.0.0.1:${port}/api/projects`, 5000);
  s.stop(ready ? 'Dashboard server is running.' : 'Server started (still initializing).');

  if (!noBrowser) openBrowser(url);

  clack.log.info(`PID: ${pid}`);
  clack.outro(`Dashboard: ${url}`);
}
