import fs from 'node:fs';
import path from 'node:path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  data?: unknown;
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const RETENTION_DAYS = 7;

export class Logger {
  private level: LogLevel = 'info';
  private logDir: string;
  private consoleEnabled = true;

  constructor(logDir: string) {
    this.logDir = logDir;
    fs.mkdirSync(logDir, { recursive: true });
    this.cleanOldLogs();
  }

  setLevel(level: LogLevel): void {
    this.level = level;
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

  private log(
    level: LogLevel,
    source: string,
    message: string,
    data?: unknown,
  ): void {
    if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[this.level]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      source,
      message,
    };
    if (data !== undefined) {
      entry.data = data;
    }

    const line = JSON.stringify(entry) + '\n';
    const filePath = path.join(this.logDir, this.getLogFileName());
    fs.appendFileSync(filePath, line, 'utf-8');

    if (this.consoleEnabled) {
      this.writeToConsole(level, source, message);
    }
  }

  private getLogFileName(): string {
    const date = new Date().toISOString().slice(0, 10);
    return `renre-kit-${date}.log`;
  }

  private writeToConsole(
    level: LogLevel,
    source: string,
    message: string,
  ): void {
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

  private cleanOldLogs(): void {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    let files: string[];
    try {
      files = fs.readdirSync(this.logDir);
    } catch {
      return;
    }

    for (const file of files) {
      const match = /^renre-kit-(\d{4}-\d{2}-\d{2})\.log$/.exec(file);
      if (match && match[1]! < cutoffStr) {
        fs.unlinkSync(path.join(this.logDir, file));
      }
    }
  }
}
