/* eslint-disable no-console -- This module intentionally patches console methods for capture */
export interface ConsoleEntry {
  level: string;
  msg: string;
  time: string;
}

type ConsoleListener = (entry: ConsoleEntry) => void;

const MAX_BUFFER_SIZE = 1000;

const buffer: ConsoleEntry[] = [];
const listeners = new Set<ConsoleListener>();
let installed = false;

function push(level: string, args: unknown[]): void {
  const msg = args
    .map((a) => (typeof a === 'string' ? a : JSON.stringify(a)))
    .join(' ');
  const entry: ConsoleEntry = { level, msg, time: new Date().toISOString() };

  if (buffer.length >= MAX_BUFFER_SIZE) {
    buffer.splice(0, buffer.length - MAX_BUFFER_SIZE + 1);
  }
  buffer.push(entry);

  for (const fn of listeners) {
    fn(entry);
  }
}

export function installConsoleCapture(): void {
  if (installed) return;
  installed = true;

  const origLog = console.log.bind(console);
  const origWarn = console.warn.bind(console);
  const origError = console.error.bind(console);
  const origDebug = console.debug.bind(console);

  console.log = (...args: unknown[]) => {
    origLog(...args);
    push('info', args);
  };
  console.warn = (...args: unknown[]) => {
    origWarn(...args);
    push('warn', args);
  };
  console.error = (...args: unknown[]) => {
    origError(...args);
    push('error', args);
  };
  console.debug = (...args: unknown[]) => {
    origDebug(...args);
    push('debug', args);
  };
}

export function pushConsoleEntry(level: string, msg: string): void {
  const entry: ConsoleEntry = { level, msg, time: new Date().toISOString() };

  if (buffer.length >= MAX_BUFFER_SIZE) {
    buffer.splice(0, buffer.length - MAX_BUFFER_SIZE + 1);
  }
  buffer.push(entry);

  for (const fn of listeners) {
    fn(entry);
  }
}

export function getConsoleEntries(): ConsoleEntry[] {
  return [...buffer];
}

export function subscribeConsole(fn: ConsoleListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
