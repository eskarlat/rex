import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import fs from 'node:fs';
import path from 'node:path';
import { LOGS_DIR, getLogger } from '@renre-kit/cli/lib';
import type { LogLevel } from '@renre-kit/cli/lib';
import { getConsoleEntries, subscribeConsole } from '../../core/utils/console-capture.js';

interface SocketLike {
  send(data: string): void;
  on(event: string, listener: () => void): void;
}

const POLL_INTERVAL_MS = 2000;

interface WatcherState {
  offset: number;
  timer: ReturnType<typeof setInterval>;
}

export interface ReadResult {
  lines: string[];
  newOffset: number;
}

export function readNewLines(filePath: string, offset: number): ReadResult {
  if (!fs.existsSync(filePath)) {
    return { lines: [], newOffset: offset };
  }

  const stat = fs.statSync(filePath);
  if (stat.size <= offset) {
    return { lines: [], newOffset: offset };
  }

  const fd = fs.openSync(filePath, 'r');
  const bufSize = stat.size - offset;
  const buffer = Buffer.alloc(bufSize);
  fs.readSync(fd, buffer, 0, bufSize, offset);
  fs.closeSync(fd);

  const content = buffer.toString('utf-8');
  const lines = content.split(/\r?\n/).filter((line) => line.length > 0);

  return { lines, newOffset: stat.size };
}

export function getLogFilePath(): string {
  const date = new Date().toISOString().slice(0, 10);
  return path.join(LOGS_DIR, `renre-kit-${date}.log`);
}

const MAX_INITIAL_LINES = 200;

const logsWebsocket: FastifyPluginCallback = (fastify: FastifyInstance, _opts, done) => {
  // REST endpoint: GET /api/logs/entries — returns existing log lines as JSON array
  fastify.get('/api/logs/entries', () => {
    const logFile = getLogFilePath();
    if (!fs.existsSync(logFile)) {
      return [];
    }
    const content = fs.readFileSync(logFile, 'utf-8');
    const lines = content.split(/\r?\n/).filter((line) => line.length > 0);
    return lines.slice(-MAX_INITIAL_LINES).map((line) => {
      try {
        return JSON.parse(line) as Record<string, unknown>;
      } catch {
        return { level: 'info', msg: line, time: new Date().toISOString() };
      }
    });
  });

  fastify.get('/api/logs', { websocket: true }, (socket: SocketLike) => {
    const logFile = getLogFilePath();

    // Start from end of file
    let currentOffset = 0;
    try {
      if (fs.existsSync(logFile)) {
        currentOffset = fs.statSync(logFile).size;
      }
    } catch {
      // File might not exist yet
    }

    const state: WatcherState = {
      offset: currentOffset,
      timer: setInterval(() => {
        try {
          const { lines, newOffset } = readNewLines(logFile, state.offset);
          state.offset = newOffset;
          for (const line of lines) {
            socket.send(line);
          }
        } catch {
          // Ignore read errors during polling
        }
      }, POLL_INTERVAL_MS),
    };

    socket.on('close', () => {
      clearInterval(state.timer);
    });
  });

  // REST endpoint: GET /api/logs/console/entries — returns buffered console entries
  fastify.get('/api/logs/console/entries', () => {
    return getConsoleEntries().slice(-MAX_INITIAL_LINES);
  });

  // WebSocket: GET /api/logs/console — live server console stream
  fastify.get('/api/logs/console', { websocket: true }, (socket: SocketLike) => {
    const unsubscribe = subscribeConsole((entry) => {
      socket.send(JSON.stringify(entry));
    });
    socket.on('close', () => {
      unsubscribe();
    });
  });

  // REST endpoint: POST /api/logs/write — write a log entry from an extension
  fastify.post('/api/logs/write', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as {
      level?: string;
      source?: string;
      message?: string;
      data?: unknown;
    };

    if (!body.level || !body.source || !body.message) {
      reply.code(400);
      return { error: 'level, source, and message are required' };
    }

    const validLevels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    if (!validLevels.includes(body.level as LogLevel)) {
      reply.code(400);
      return { error: `Invalid level: ${body.level}. Must be one of: ${validLevels.join(', ')}` };
    }

    if (!body.source.startsWith('ext:')) {
      reply.code(400);
      return { error: 'source must start with "ext:" prefix' };
    }

    const logger = getLogger();
    logger[body.level as LogLevel](body.source, body.message, body.data);

    return reply.code(204).send();
  });

  done();
};

export default logsWebsocket;
