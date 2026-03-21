import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

import type { BrowserState, GlobalBrowserSession } from './types.js';

function getStorageDir(projectPath: string): string {
  return join(projectPath, '.renre-kit', 'storage', 'renre-devtools');
}

function getStatePath(projectPath: string): string {
  return join(getStorageDir(projectPath), 'state.json');
}

export function getLogDir(projectPath: string): string {
  return getStorageDir(projectPath);
}

export function getScreenshotDir(projectPath: string): string {
  return join(getStorageDir(projectPath), 'screenshots');
}

export function readState(projectPath: string): BrowserState | null {
  const statePath = getStatePath(projectPath);
  if (!existsSync(statePath)) return null;

  const raw = readFileSync(statePath, 'utf-8');
  return JSON.parse(raw) as BrowserState;
}

export function writeState(projectPath: string, state: BrowserState): void {
  const dir = getStorageDir(projectPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(getStatePath(projectPath), JSON.stringify(state, null, 2));
}

export function deleteState(projectPath: string): void {
  const statePath = getStatePath(projectPath);
  if (existsSync(statePath)) {
    unlinkSync(statePath);
  }
}

export function ensureBrowserRunning(projectPath: string): BrowserState {
  const state = readState(projectPath);
  if (!state) {
    throw new Error(
      'No browser is running. Start one with: renre-kit renre-devtools:launch'
    );
  }
  return state;
}

// --- Global browser session ---

function getGlobalDir(): string {
  return process.env.RENRE_KIT_HOME ?? join(homedir(), '.renre-kit');
}

function getGlobalSessionPath(): string {
  return join(getGlobalDir(), 'browser-session.json');
}

export function readGlobalSession(): GlobalBrowserSession | null {
  const sessionPath = getGlobalSessionPath();
  if (!existsSync(sessionPath)) return null;

  const raw = readFileSync(sessionPath, 'utf-8');
  return JSON.parse(raw) as GlobalBrowserSession;
}

export function writeGlobalSession(session: GlobalBrowserSession): void {
  const dir = getGlobalDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(getGlobalSessionPath(), JSON.stringify(session, null, 2));
}

export function deleteGlobalSession(): void {
  const sessionPath = getGlobalSessionPath();
  if (existsSync(sessionPath)) {
    unlinkSync(sessionPath);
  }
}

export function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
