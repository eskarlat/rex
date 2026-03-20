import * as pty from 'node-pty';
import { homedir } from 'node:os';
import { OutputBuffer } from './output-buffer.js';

export interface TerminalSocket {
  send(data: string): void;
  close(): void;
}

interface TerminalSession {
  key: string;
  projectPath: string | undefined;
  pty: pty.IPty;
  outputBuffer: OutputBuffer;
  sockets: Set<TerminalSocket>;
  lastActivity: number;
  idleTimer: ReturnType<typeof setTimeout> | undefined;
}

const IDLE_TIMEOUT_MS = 300_000; // 5 minutes

function resolveShell(): string {
  const envShell = process.env['SHELL'];
  if (envShell) return envShell;
  return process.platform === 'win32' ? 'powershell.exe' : 'bash';
}

function resolveCwd(projectPath: string | undefined): string {
  if (projectPath && projectPath.length > 0) return projectPath;
  return homedir();
}

export class TerminalSessionManager {
  private sessions = new Map<string, TerminalSession>();

  getOrCreateSession(
    key: string,
    projectPath: string | undefined,
    cols: number,
    rows: number,
  ): { session: TerminalSession; isNew: boolean } {
    const existing = this.sessions.get(key);
    if (existing) {
      return { session: existing, isNew: false };
    }

    const cwd = resolveCwd(projectPath);
    const ptyProcess = pty.spawn(resolveShell(), [], {
      name: 'xterm-256color',
      cols,
      rows,
      cwd,
      env: process.env as Record<string, string>,
    });

    const session: TerminalSession = {
      key,
      projectPath,
      pty: ptyProcess,
      outputBuffer: new OutputBuffer(),
      sockets: new Set(),
      lastActivity: Date.now(),
      idleTimer: undefined,
    };

    ptyProcess.onData((data: string) => {
      session.outputBuffer.append(data);
      session.lastActivity = Date.now();
      for (const socket of session.sockets) {
        try {
          socket.send(data);
        } catch {
          // Socket may already be closed
        }
      }
    });

    ptyProcess.onExit(() => {
      this.destroySession(key);
    });

    this.sessions.set(key, session);
    return { session, isNew: true };
  }

  attachSocket(key: string, socket: TerminalSocket): void {
    const session = this.sessions.get(key);
    if (!session) return;

    session.sockets.add(socket);

    if (session.idleTimer !== undefined) {
      clearTimeout(session.idleTimer);
      session.idleTimer = undefined;
    }
  }

  detachSocket(key: string, socket: TerminalSocket): void {
    const session = this.sessions.get(key);
    if (!session) return;

    session.sockets.delete(socket);

    if (session.sockets.size === 0) {
      session.idleTimer = setTimeout(() => {
        this.destroySession(key);
      }, IDLE_TIMEOUT_MS);
    }
  }

  getReplayData(key: string): string {
    const session = this.sessions.get(key);
    if (!session) return '';
    return session.outputBuffer.getContents();
  }

  resizeSession(key: string, cols: number, rows: number): void {
    const session = this.sessions.get(key);
    if (!session) return;
    session.pty.resize(cols, rows);
  }

  writeToSession(key: string, data: string): void {
    const session = this.sessions.get(key);
    if (!session) return;
    session.pty.write(data);
  }

  destroySession(key: string): void {
    const session = this.sessions.get(key);
    if (!session) return;

    if (session.idleTimer !== undefined) {
      clearTimeout(session.idleTimer);
    }

    try {
      session.pty.kill();
    } catch {
      // PTY may already be dead
    }

    for (const socket of session.sockets) {
      try {
        socket.close();
      } catch {
        // Socket may already be closed
      }
    }

    session.sockets.clear();
    this.sessions.delete(key);
  }

  destroyAll(): void {
    for (const key of [...this.sessions.keys()]) {
      this.destroySession(key);
    }
  }
}
