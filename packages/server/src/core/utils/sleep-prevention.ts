import { spawn } from 'node:child_process';
import os from 'node:os';

export interface SleepLock {
  release: () => void;
}

function preventSleepMacOS(): SleepLock {
  // eslint-disable-next-line sonarjs/no-os-command-from-path
  const proc = spawn('caffeinate', ['-d'], {
    stdio: 'ignore',
    detached: true,
  });
  proc.unref();
  return {
    release: () => {
      proc.kill();
    },
  };
}

function preventSleepLinux(): SleepLock {
  /* eslint-disable sonarjs/no-os-command-from-path */
  const proc = spawn(
    'systemd-inhibit',
    ['--what=idle', '--who=renre-kit', '--why=dashboard-active', 'sleep', 'infinity'],
    { stdio: 'ignore', detached: true },
  );
  /* eslint-enable sonarjs/no-os-command-from-path */
  proc.unref();
  return {
    release: () => {
      proc.kill();
    },
  };
}

function noopLock(): SleepLock {
  return { release: () => {} };
}

export function preventSleep(): SleepLock {
  const platform = os.platform();
  if (platform === 'darwin') {
    return preventSleepMacOS();
  }
  if (platform === 'linux') {
    return preventSleepLinux();
  }
  return noopLock();
}
