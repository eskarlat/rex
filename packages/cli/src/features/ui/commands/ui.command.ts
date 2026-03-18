import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

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

export function handleUi(options: Partial<UiCommandOptions> = {}): void {
  const port = options.port ?? DEFAULT_PORT;
  const lan = options.lan ?? false;
  const noBrowser = options.noBrowser ?? false;
  const noSleep = options.noSleep ?? false;

  const serverEntry = resolveServerEntry();

  const env: Record<string, string> = {
    ...process.env as Record<string, string>,
    PORT: String(port),
  };

  if (lan) {
    env['LAN_MODE'] = 'true';
  }
  if (noSleep) {
    env['NO_SLEEP'] = 'true';
  }

  const child = spawn(process.execPath, [serverEntry], {
    env,
    stdio: 'inherit',
  });

  child.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error(`Failed to start dashboard server: ${err.message}`);
    process.exit(1);
  });

  const host = lan ? '0.0.0.0' : '127.0.0.1';
  const url = `http://${lan ? 'localhost' : host}:${port}`;

  // eslint-disable-next-line no-console
  console.log(`Starting RenreKit Dashboard on ${url}`);

  if (!noBrowser) {
    // Small delay to let the server start before opening browser
    setTimeout(() => {
      openBrowser(url);
    }, 1500);
  }

  // Forward signals to child
  const forwardSignal = (signal: NodeJS.Signals): void => {
    child.kill(signal);
  };

  process.on('SIGINT', () => forwardSignal('SIGINT'));
  process.on('SIGTERM', () => forwardSignal('SIGTERM'));

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}
