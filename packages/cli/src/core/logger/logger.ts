import fs from 'node:fs';
import path from 'node:path';

import pino from 'pino';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const RETENTION_DAYS = 7;

function getLogFileName(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `renre-kit-${date}.log`;
}

function cleanOldLogs(logDir: string): void {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  let files: string[];
  try {
    files = fs.readdirSync(logDir);
  } catch (err) {
    // Cannot use logger here (bootstrapping) — write to stderr
    process.stderr.write(`[logger] Failed to read log directory for cleanup: ${err instanceof Error ? err.message : String(err)}\n`);
    return;
  }

  for (const file of files) {
    const match = /^renre-kit-(\d{4}-\d{2}-\d{2})\.log$/.exec(file);
    if (match && match[1]! < cutoffStr) {
      try {
        fs.unlinkSync(path.join(logDir, file));
      } catch (err) {
        process.stderr.write(`[logger] Failed to delete old log file "${file}": ${err instanceof Error ? err.message : String(err)}\n`);
      }
    }
  }
}

export class Logger {
  private pinoLogger: pino.Logger;
  private level: LogLevel = 'info';
  private logDir: string;
  private consoleEnabled = true;

  constructor(logDir: string) {
    this.logDir = logDir;
    fs.mkdirSync(logDir, { recursive: true });
    cleanOldLogs(logDir);

    this.pinoLogger = this.createPinoInstance();
  }

  private createPinoInstance(): pino.Logger {
    const filePath = path.join(this.logDir, getLogFileName());
    const fileStream = pino.destination({ dest: filePath, append: true, sync: true });

    return pino(
      {
        level: this.level,
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
          level(label: string) {
            return { level: label };
          },
        },
      },
      fileStream,
    );
  }

  setLevel(level: LogLevel): void {
    this.level = level;
    this.pinoLogger.level = level;
  }

  getLevel(): LogLevel {
    return this.level;
  }

  setConsoleOutput(enabled: boolean): void {
    this.consoleEnabled = enabled;
  }

  debug(source: string, message: string, data?: unknown): void {
    this.log('debug', source, message, data);
  }

  info(source: string, message: string, data?: unknown): void {
    this.log('info', source, message, data);
  }

  warn(source: string, message: string, data?: unknown): void {
    this.log('warn', source, message, data);
  }

  error(source: string, message: string, data?: unknown): void {
    this.log('error', source, message, data);
  }

  private log(level: LogLevel, source: string, message: string, data?: unknown): void {
    const entry: Record<string, unknown> = { source };
    if (data !== undefined) {
      entry.data = data;
    }

    this.pinoLogger[level](entry, message);

    if (this.consoleEnabled) {
      this.writeToConsole(level, source, message);
    }
  }

  private writeToConsole(level: LogLevel, source: string, message: string): void {
    const prefix = `[${level.toUpperCase()}] [${source}]`;
    switch (level) {
      case 'error':
        // eslint-disable-next-line no-console
        console.error(`${prefix} ${message}`);
        break;
      case 'warn':
        // eslint-disable-next-line no-console
        console.warn(`${prefix} ${message}`);
        break;
      default:
        // eslint-disable-next-line no-console
        console.log(`${prefix} ${message}`);
        break;
    }
  }
}
