import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { homedir, platform } from 'node:os';
import { join } from 'node:path';

import type { BrowserState, GlobalBrowserSession } from './types.js';

function getStorageDir(projectPath: string): string {
  return join(projectPath, '.renre-kit', 'storage', 'chrome-debugger');
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
      'No browser is running. Start one with: renre-kit chrome-debugger:launch'
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

function winSystemRoot(): string {
  return process.env.SystemRoot ?? 'C:\\Windows';
}

export function isProcessAlive(pid: number): boolean {
  if (platform() === 'win32') {
    const tasklist = join(winSystemRoot(), 'System32', 'tasklist.exe');
    const result = spawnSync(tasklist, ['/FI', `PID eq ${String(pid)}`, '/NH'], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return result.status === 0 && result.stdout.includes(String(pid));
  }

  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function killProcessTree(pid: number): void {
  if (platform() === 'win32') {
    const taskkill = join(winSystemRoot(), 'System32', 'taskkill.exe');
    spawnSync(taskkill, ['/PID', String(pid), '/T', '/F'], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return;
  }

  try {
    process.kill(-pid, 'SIGTERM');
  } catch {
    try {
      process.kill(pid, 'SIGTERM');
    } catch {
      // Already dead
    }
  }
}
