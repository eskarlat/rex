import type { FastifyInstance, FastifyPluginCallback } from 'fastify';
import * as pty from 'node-pty';
import { homedir } from 'node:os';

interface TerminalSocket {
  send(data: string): void;
  close(): void;
  on(event: 'message', listener: (raw: Buffer | string) => void): void;
  on(event: 'close', listener: () => void): void;
  off(event: 'message', listener: (raw: Buffer | string) => void): void;
}

interface InitMessage {
  type: 'init';
  projectPath?: string;
  cols?: number;
  rows?: number;
}

interface ResizeMessage {
  type: 'resize';
  cols: number;
  rows: number;
}

function isInitMessage(data: unknown): data is InitMessage {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return obj['type'] === 'init';
}

function isResizeMessage(data: unknown): data is ResizeMessage {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return obj['type'] === 'resize' && typeof obj['cols'] === 'number' && typeof obj['rows'] === 'number';
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function resolveShell(): string {
  const envShell = process.env['SHELL'];
  if (envShell) return envShell;
  return process.platform === 'win32' ? 'powershell.exe' : 'bash';
}

function resolveCwd(projectPath: string | undefined): string {
  if (projectPath && projectPath.length > 0) return projectPath;
  return homedir();
}

const DEFAULT_COLS = 80;
const DEFAULT_ROWS = 24;
const INIT_TIMEOUT_MS = 5000;

function spawnPty(cwd: string, cols: number, rows: number): pty.IPty {
  return pty.spawn(resolveShell(), [], {
    name: 'xterm-256color',
    cols,
    rows,
    cwd,
    env: process.env as Record<string, string>,
  });
}

function attachPty(socket: TerminalSocket, ptyProcess: pty.IPty): void {
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
    const parsed = parseJson(message);
    if (isResizeMessage(parsed)) {
      ptyProcess.resize(parsed.cols, parsed.rows);
    } else {
      ptyProcess.write(message);
    }
  });

  socket.on('close', () => {
    ptyProcess.kill();
  });
}

const terminalWebsocket: FastifyPluginCallback = (fastify: FastifyInstance, _opts, done) => {
  fastify.get('/api/terminal', { websocket: true }, (socket: TerminalSocket) => {
    const timer = setTimeout(() => {
      socket.send('\r\n\x1b[31mTerminal init timed out — no init message received.\x1b[0m\r\n');
      socket.close();
    }, INIT_TIMEOUT_MS);

    const onFirstMessage = (raw: Buffer | string): void => {
      const message = typeof raw === 'string' ? raw : raw.toString('utf-8');
      const parsed = parseJson(message);

      if (!isInitMessage(parsed)) {
        // Not an init message — ignore and keep waiting
        return;
      }

      clearTimeout(timer);
      socket.off('message', onFirstMessage);

      const cwd = resolveCwd(parsed.projectPath);
      const cols = parsed.cols ?? DEFAULT_COLS;
      const rows = parsed.rows ?? DEFAULT_ROWS;

      let ptyProcess: pty.IPty;
      try {
        ptyProcess = spawnPty(cwd, cols, rows);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        socket.send(`\r\n\x1b[31mFailed to start terminal: ${errMsg}\x1b[0m\r\n`);
        socket.close();
        return;
      }

      attachPty(socket, ptyProcess);
    };

    socket.on('message', onFirstMessage);

    socket.on('close', () => {
      clearTimeout(timer);
    });
  });

  done();
};

export default terminalWebsocket;
