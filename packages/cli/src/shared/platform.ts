import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import crypto from 'node:crypto';

export type OSType = 'windows' | 'macos' | 'linux';

export function getOSType(): OSType {
  const platform = process.platform;

  if (platform === 'win32') {
    return 'windows';
  }

  if (platform === 'darwin') {
    return 'macos';
  }

  return 'linux';
}

function getHardwareUUIDMacOS(): string | undefined {
  try {
    const output = execFileSync('/usr/sbin/ioreg', ['-d2', '-c', 'IOPlatformExpertDevice'], {
      encoding: 'utf-8',
    });
    const match = /[A-F0-9-]{36}/i.exec(output);
    return match?.[0];
  } catch {
    return undefined;
  }
}

function getHardwareUUIDLinux(): string | undefined {
  const paths = ['/etc/machine-id', '/var/lib/dbus/machine-id'];
  for (const filePath of paths) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8').trim();
      if (content.length > 0) {
        return content;
      }
    } catch {
      // try next path
    }
  }
  return undefined;
}

function getHardwareUUIDWindows(): string | undefined {
  try {
    const wmicPath = path.join(
      process.env['SYSTEMROOT'] ?? 'C:\\Windows',
      'System32',
      'wbem',
      'wmic.exe',
    );
    const output = execFileSync(wmicPath, ['csproduct', 'get', 'UUID'], {
      encoding: 'utf-8',
      windowsHide: true,
    });
    const lines = output.trim().split(/\r?\n/);
    const uuidLine = lines[1]?.trim();
    if (uuidLine && uuidLine.length > 0) {
      return uuidLine;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function getFallbackUUID(): string {
  const hostname = os.hostname();
  const homedir = os.homedir();
  return crypto.createHash('sha256').update(`${hostname}:${homedir}`).digest('hex');
}

export function getHardwareUUID(): string {
  const osType = getOSType();

  let uuid: string | undefined;

  if (osType === 'macos') {
    uuid = getHardwareUUIDMacOS();
  } else if (osType === 'linux') {
    uuid = getHardwareUUIDLinux();
  } else {
    uuid = getHardwareUUIDWindows();
  }

  return uuid ?? getFallbackUUID();
}

export function getMACAddress(): string | undefined {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    const entries = interfaces[name];
    if (!entries) {
      continue;
    }
    for (const entry of entries) {
      if (!entry.internal && entry.family === 'IPv4' && entry.mac !== '00:00:00:00:00:00') {
        return entry.mac;
      }
    }
  }

  return undefined;
}
