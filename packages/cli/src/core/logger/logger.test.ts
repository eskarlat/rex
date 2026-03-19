import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Logger } from './logger.js';

describe('Logger', () => {
  let tmpDir: string;
  let logger: Logger;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'renre-kit-log-test-'));
    logger = new Logger(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function readLogEntries(): Record<string, unknown>[] {
    const files = fs.readdirSync(tmpDir).filter((f) => f.endsWith('.log'));
    if (files.length === 0) return [];
    const content = fs.readFileSync(path.join(tmpDir, files[0]!), 'utf-8');
    return content
      .trim()
      .split('\n')
      .filter((line) => line.length > 0)
      .map((line) => JSON.parse(line) as Record<string, unknown>);
  }

  it('should create log directory on construction', () => {
    expect(fs.existsSync(tmpDir)).toBe(true);
  });

  it('should write log entries as JSON lines', () => {
    logger.info('test-source', 'hello world');
    const entries = readLogEntries();
    expect(entries.length).toBe(1);
    expect(entries[0]!.level).toBe('info');
    expect(entries[0]!.source).toBe('test-source');
    expect(entries[0]!.msg).toBe('hello world');
    expect(entries[0]!.time).toBeDefined();
  });

  it('should log at all four levels', () => {
    logger.setLevel('debug');
    logger.debug('src', 'debug msg');
    logger.info('src', 'info msg');
    logger.warn('src', 'warn msg');
    logger.error('src', 'error msg');

    const entries = readLogEntries();
    expect(entries.length).toBe(4);
    expect(entries.map((e) => e.level)).toEqual(['debug', 'info', 'warn', 'error']);
  });

  it('should respect log level filtering', () => {
    logger.setLevel('warn');
    logger.debug('src', 'should not appear');
    logger.info('src', 'should not appear');
    logger.warn('src', 'should appear');
    logger.error('src', 'should appear');

    const entries = readLogEntries();
    expect(entries.length).toBe(2);
    expect(entries.map((e) => e.level)).toEqual(['warn', 'error']);
  });

  it('should include optional data in log entry', () => {
    logger.info('src', 'with data', { key: 'value' });
    const entries = readLogEntries();
    expect(entries[0]!.data).toEqual({ key: 'value' });
  });

  it('should generate log filename with current date', () => {
    logger.info('src', 'test');
    const files = fs.readdirSync(tmpDir).filter((f) => f.endsWith('.log'));
    const today = new Date().toISOString().slice(0, 10);
    expect(files[0]).toBe(`renre-kit-${today}.log`);
  });

  it('should delete log files older than 7 days', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 8);
    const oldFileName = `renre-kit-${oldDate.toISOString().slice(0, 10)}.log`;
    fs.writeFileSync(path.join(tmpDir, oldFileName), 'old log');

    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 3);
    const recentFileName = `renre-kit-${recentDate.toISOString().slice(0, 10)}.log`;
    fs.writeFileSync(path.join(tmpDir, recentFileName), 'recent log');

    // Creating a new logger triggers cleanup
    const freshLogger = new Logger(tmpDir);
    freshLogger.info('src', 'trigger');

    const remaining = fs.readdirSync(tmpDir).filter((f) => f.endsWith('.log'));
    expect(remaining).not.toContain(oldFileName);
    expect(remaining).toContain(recentFileName);
  });

  it('should set and get level', () => {
    logger.setLevel('error');
    expect(logger.getLevel()).toBe('error');
  });

  it('should format log filename correctly', () => {
    logger.info('src', 'msg');
    const files = fs.readdirSync(tmpDir).filter((f) => f.endsWith('.log'));
    expect(files[0]).toMatch(/^renre-kit-\d{4}-\d{2}-\d{2}\.log$/);
  });

  it('should suppress console output when console is disabled', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logger.setConsoleOutput(false);
    logger.info('src', 'no console');
    logger.warn('src', 'no console');
    logger.error('src', 'no console');

    expect(consoleSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
