import type { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fs from 'node:fs';
import path from 'node:path';
import { LOGS_DIR } from '@renre-kit/cli/lib';

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
  const lines = content.split('\n').filter((line) => line.length > 0);

  return { lines, newOffset: stat.size };
}

export function getLogFilePath(): string {
  const date = new Date().toISOString().slice(0, 10);
  return path.join(LOGS_DIR, `renre-kit-${date}.log`);
}

const logsWebsocket: FastifyPluginCallback = (fastify: FastifyInstance, _opts, done) => {
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

  done();
};

export default logsWebsocket;
