import type { FastifyInstance, FastifyPluginCallback } from 'fastify';
import { getLogger } from '@renre-kit/cli/lib';
import { TerminalSessionManager } from './terminal-session-manager.js';

interface WebSocketLike {
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

export interface TerminalWebsocketOptions {
  sessionManager?: TerminalSessionManager;
}

function isInitMessage(data: unknown): data is InitMessage {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return obj['type'] === 'init';
}

function isResizeMessage(data: unknown): data is ResizeMessage {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    obj['type'] === 'resize' && typeof obj['cols'] === 'number' && typeof obj['rows'] === 'number'
  );
}

function parseJson(raw: string): unknown {
  const trimmed = raw.trimStart();
  if (!trimmed.startsWith('{')) return null;
  try {
    return JSON.parse(trimmed);
  } catch (err) {
    getLogger().debug('terminal', 'Failed to parse WebSocket message as JSON', {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

function toUtf8(raw: Buffer | string): string {
  return typeof raw === 'string' ? raw : raw.toString('utf-8');
}

function safeSend(socket: WebSocketLike, data: string): void {
  try {
    socket.send(data);
  } catch (err) {
    getLogger().debug('terminal', 'WebSocket send failed (socket likely closed)', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

function routeMessage(
  sessionManager: TerminalSessionManager,
  key: string,
  raw: Buffer | string,
): void {
  const msg = toUtf8(raw);
  const parsed = parseJson(msg);
  if (isResizeMessage(parsed)) {
    sessionManager.resizeSession(key, parsed.cols, parsed.rows);
  } else {
    sessionManager.writeToSession(key, msg);
  }
}

function safeClose(socket: WebSocketLike): void {
  try {
    socket.close();
  } catch (closeErr) {
    getLogger().debug('terminal', 'Socket close failed', {
      error: closeErr instanceof Error ? closeErr.message : String(closeErr),
    });
  }
}

function sendReplay(
  sessionManager: TerminalSessionManager,
  socket: WebSocketLike,
  key: string,
): void {
  const replayData = sessionManager.getReplayData(key);
  if (replayData) {
    safeSend(socket, JSON.stringify({ type: 'session-replay', data: replayData }));
  }
}

function handleInit(
  sessionManager: TerminalSessionManager,
  socket: WebSocketLike,
  parsed: InitMessage,
): string | undefined {
  const key = parsed.projectPath ?? '__no_project__';
  const cols = parsed.cols ?? DEFAULT_COLS;
  const rows = parsed.rows ?? DEFAULT_ROWS;

  let isNew: boolean;
  try {
    ({ isNew } = sessionManager.getOrCreateSession(key, parsed.projectPath, cols, rows));
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    safeSend(socket, `\r\n\x1b[31mFailed to start terminal: ${errMsg}\x1b[0m\r\n`);
    safeClose(socket);
    return undefined;
  }

  sessionManager.attachSocket(key, socket);
  safeSend(socket, JSON.stringify({ type: 'session-info', status: isNew ? 'new' : 'reconnected' }));

  if (!isNew) {
    sendReplay(sessionManager, socket, key);
  }

  socket.on('message', (raw: Buffer | string) => {
    routeMessage(sessionManager, key, raw);
  });

  return key;
}

const DEFAULT_COLS = 80;
const DEFAULT_ROWS = 24;
const INIT_TIMEOUT_MS = 5000;

const terminalWebsocket: FastifyPluginCallback<TerminalWebsocketOptions> = (
  fastify: FastifyInstance,
  opts,
  done,
) => {
  const sessionManager = opts.sessionManager ?? new TerminalSessionManager();

  fastify.addHook('onClose', () => {
    sessionManager.destroyAll();
  });

  fastify.get('/api/terminal', { websocket: true }, (socket: WebSocketLike) => {
    let attachedKey: string | undefined;

    const timer = setTimeout(() => {
      safeSend(
        socket,
        '\r\n\x1b[31mTerminal init timed out — no init message received.\x1b[0m\r\n',
      );
      safeClose(socket);
    }, INIT_TIMEOUT_MS);

    const onFirstMessage = (raw: Buffer | string): void => {
      const message = toUtf8(raw);
      const parsed = parseJson(message);

      if (!isInitMessage(parsed)) return;

      clearTimeout(timer);
      socket.off('message', onFirstMessage);

      attachedKey = handleInit(sessionManager, socket, parsed);
    };

    socket.on('message', onFirstMessage);

    socket.on('close', () => {
      clearTimeout(timer);
      if (attachedKey) {
        sessionManager.detachSocket(attachedKey, socket);
      }
    });
  });

  done();
};

export default terminalWebsocket;
