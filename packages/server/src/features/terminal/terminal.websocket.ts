import type { FastifyInstance, FastifyPluginCallback } from 'fastify';
import * as pty from 'node-pty';
import { homedir } from 'node:os';
import { isAbsolute, normalize } from 'node:path';

interface TerminalSocket {
  send(data: string): void;
  close(): void;
  on(event: 'message', listener: (raw: Buffer | string) => void): void;
  on(event: 'close', listener: () => void): void;
}

interface ResizeMessage {
  type: 'resize';
  cols: number;
  rows: number;
}

function isResizeMessage(data: unknown): data is ResizeMessage {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return obj['type'] === 'resize' && typeof obj['cols'] === 'number' && typeof obj['rows'] === 'number';
}

function parseMessage(raw: string): ResizeMessage | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isResizeMessage(parsed)) return parsed;
  } catch {
    // Not JSON — treat as stdin input
  }
  return null;
}

function resolveShell(): string {
  const envShell = process.env['SHELL'];
  if (envShell) return envShell;
  return process.platform === 'win32' ? 'powershell.exe' : 'bash';
}

function isValidProjectPath(p: string): boolean {
  if (!isAbsolute(p)) return false;
  const normalized = normalize(p);
  if (normalized === p) return true;
  // Allow a single trailing slash difference after normalization
  return p.endsWith('/') && normalized === p.slice(0, -1);
}

function resolveCwd(projectPath: string | undefined): string {
  if (projectPath && isValidProjectPath(projectPath)) return normalize(projectPath);
  return homedir();
}

const DEFAULT_COLS = 80;
const DEFAULT_ROWS = 24;

const terminalWebsocket: FastifyPluginCallback = (fastify: FastifyInstance, _opts, done) => {
  fastify.get('/api/terminal', { websocket: true }, (socket: TerminalSocket, request) => {
    const cwd = resolveCwd(request.projectPath);
    const shell = resolveShell();

    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: DEFAULT_COLS,
      rows: DEFAULT_ROWS,
      cwd,
      env: process.env as Record<string, string>,
    });

    ptyProcess.onData((data: string) => {
      try {
        socket.send(data);
      } catch {
        // Socket may already be closed
      }
    });

    ptyProcess.onExit(() => {
      try {
        socket.close();
      } catch {
        // Socket may already be closed
      }
    });

    socket.on('message', (raw: Buffer | string) => {
      const message = typeof raw === 'string' ? raw : raw.toString('utf-8');
      const resize = parseMessage(message);
      if (resize) {
        ptyProcess.resize(resize.cols, resize.rows);
      } else {
        ptyProcess.write(message);
      }
    });

    socket.on('close', () => {
      ptyProcess.kill();
    });
  });

  done();
};

export default terminalWebsocket;
