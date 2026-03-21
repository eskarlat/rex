import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { NetworkInterfaceInfo } from 'node:os';

vi.mock('node:os', () => ({
  default: {
    hostname: vi.fn(() => 'test-host'),
    homedir: vi.fn(() => '/home/test'),
    networkInterfaces: vi.fn(() => ({})),
  },
}));

vi.mock('node:child_process', () => ({
  execFileSync: vi.fn(),
}));

vi.mock('node:fs', () => ({
  default: {
    readFileSync: vi.fn(),
  },
}));

vi.mock('node:crypto', () => ({
  default: {
    createHash: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn(() => 'abcdef1234567890fallbackhash'),
    })),
  },
}));

describe('platform', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getOSType', () => {
    it('should return "windows" when platform is win32', async () => {
      vi.stubGlobal('process', { ...process, platform: 'win32' });
      const { getOSType } = await import('./platform.js');
      expect(getOSType()).toBe('windows');
    });

    it('should return "macos" when platform is darwin', async () => {
      vi.stubGlobal('process', { ...process, platform: 'darwin' });
      const { getOSType } = await import('./platform.js');
      expect(getOSType()).toBe('macos');
    });

    it('should return "linux" when platform is linux', async () => {
      vi.stubGlobal('process', { ...process, platform: 'linux' });
      const { getOSType } = await import('./platform.js');
      expect(getOSType()).toBe('linux');
    });

    it('should return "linux" for unknown platforms', async () => {
      vi.stubGlobal('process', { ...process, platform: 'freebsd' });
      const { getOSType } = await import('./platform.js');
      expect(getOSType()).toBe('linux');
    });
  });

  describe('getArchType', () => {
    it('should return "x64" when arch is x64', async () => {
      vi.stubGlobal('process', { ...process, arch: 'x64' });
      const { getArchType } = await import('./platform.js');
      expect(getArchType()).toBe('x64');
    });

    it('should return "arm64" when arch is arm64', async () => {
      vi.stubGlobal('process', { ...process, arch: 'arm64' });
      const { getArchType } = await import('./platform.js');
      expect(getArchType()).toBe('arm64');
    });

    it('should return "ia32" when arch is ia32', async () => {
      vi.stubGlobal('process', { ...process, arch: 'ia32' });
      const { getArchType } = await import('./platform.js');
      expect(getArchType()).toBe('ia32');
    });

    it('should return "arm" when arch is arm', async () => {
      vi.stubGlobal('process', { ...process, arch: 'arm' });
      const { getArchType } = await import('./platform.js');
      expect(getArchType()).toBe('arm');
    });

    it('should return "x64" for unknown architectures', async () => {
      vi.stubGlobal('process', { ...process, arch: 'mips' });
      const { getArchType } = await import('./platform.js');
      expect(getArchType()).toBe('x64');
    });
  });

  describe('getPlatformInfo', () => {
    it('should return complete platform info for linux x64', async () => {
      vi.stubGlobal('process', { ...process, platform: 'linux', arch: 'x64' });
      const { getPlatformInfo } = await import('./platform.js');
      expect(getPlatformInfo()).toEqual({
        os: 'linux',
        arch: 'x64',
        isWindows: false,
        isMacos: false,
        isLinux: true,
      });
    });

    it('should return complete platform info for macos arm64', async () => {
      vi.stubGlobal('process', { ...process, platform: 'darwin', arch: 'arm64' });
      const { getPlatformInfo } = await import('./platform.js');
      expect(getPlatformInfo()).toEqual({
        os: 'macos',
        arch: 'arm64',
        isWindows: false,
        isMacos: true,
        isLinux: false,
      });
    });

    it('should return complete platform info for windows x64', async () => {
      vi.stubGlobal('process', { ...process, platform: 'win32', arch: 'x64' });
      const { getPlatformInfo } = await import('./platform.js');
      expect(getPlatformInfo()).toEqual({
        os: 'windows',
        arch: 'x64',
        isWindows: true,
        isMacos: false,
        isLinux: false,
      });
    });
  });

  describe('getHardwareUUID', () => {
    it('should return UUID from ioreg on macOS', async () => {
      vi.stubGlobal('process', { ...process, platform: 'darwin' });
      const { execFileSync } = await import('node:child_process');
      vi.mocked(execFileSync).mockReturnValue(
        '    | "IOPlatformUUID" = "A1B2C3D4-E5F6-7890-ABCD-EF1234567890"\n',
      );
      const { getHardwareUUID } = await import('./platform.js');
      expect(getHardwareUUID()).toBe('A1B2C3D4-E5F6-7890-ABCD-EF1234567890');
    });

    it('should return fallback on macOS when ioreg fails', async () => {
      vi.stubGlobal('process', { ...process, platform: 'darwin' });
      const { execFileSync } = await import('node:child_process');
      vi.mocked(execFileSync).mockImplementation(() => {
        throw new Error('command not found');
      });
      const { getHardwareUUID } = await import('./platform.js');
      expect(getHardwareUUID()).toBe('abcdef1234567890fallbackhash');
    });

    it('should return machine-id on Linux from /etc/machine-id', async () => {
      vi.stubGlobal('process', { ...process, platform: 'linux' });
      const fs = await import('node:fs');
      vi.mocked(fs.default.readFileSync).mockReturnValue('abcdef1234567890abcdef1234567890\n');
      const { getHardwareUUID } = await import('./platform.js');
      expect(getHardwareUUID()).toBe('abcdef1234567890abcdef1234567890');
    });

    it('should try /var/lib/dbus/machine-id when /etc/machine-id fails on Linux', async () => {
      vi.stubGlobal('process', { ...process, platform: 'linux' });
      const fs = await import('node:fs');
      let callCount = 0;
      vi.mocked(fs.default.readFileSync).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error('ENOENT');
        }
        return 'dbus-machine-id-value\n';
      });
      const { getHardwareUUID } = await import('./platform.js');
      expect(getHardwareUUID()).toBe('dbus-machine-id-value');
    });

    it('should return fallback on Linux when both machine-id files fail', async () => {
      vi.stubGlobal('process', { ...process, platform: 'linux' });
      const fs = await import('node:fs');
      vi.mocked(fs.default.readFileSync).mockImplementation(() => {
        throw new Error('ENOENT');
      });
      const { getHardwareUUID } = await import('./platform.js');
      expect(getHardwareUUID()).toBe('abcdef1234567890fallbackhash');
    });

    it('should return UUID from wmic on Windows', async () => {
      vi.stubGlobal('process', { ...process, platform: 'win32' });
      const { execFileSync } = await import('node:child_process');
      vi.mocked(execFileSync).mockReturnValue('UUID\r\nA1B2C3D4-E5F6-7890-ABCD-EF1234567890\r\n');
      const { getHardwareUUID } = await import('./platform.js');
      expect(getHardwareUUID()).toBe('A1B2C3D4-E5F6-7890-ABCD-EF1234567890');
    });

    it('should return fallback on Windows when wmic fails', async () => {
      vi.stubGlobal('process', { ...process, platform: 'win32' });
      const { execFileSync } = await import('node:child_process');
      vi.mocked(execFileSync).mockImplementation(() => {
        throw new Error('command not found');
      });
      const { getHardwareUUID } = await import('./platform.js');
      expect(getHardwareUUID()).toBe('abcdef1234567890fallbackhash');
    });
  });

  describe('getMACAddress', () => {
    it('should return MAC address of first non-internal IPv4 interface', async () => {
      const os = await import('node:os');
      vi.mocked(os.default.networkInterfaces).mockReturnValue({
        lo: [
          {
            address: '127.0.0.1',
            netmask: '255.0.0.0',
            family: 'IPv4',
            mac: '00:00:00:00:00:00',
            internal: true,
            cidr: '127.0.0.1/8',
          },
        ],
        eth0: [
          {
            address: 'fe80::1',
            netmask: 'ffff:ffff:ffff:ffff::',
            family: 'IPv6',
            mac: 'aa:bb:cc:dd:ee:ff',
            internal: false,
            cidr: 'fe80::1/64',
            scopeid: 1,
          },
          {
            address: '192.168.1.10',
            netmask: '255.255.255.0',
            family: 'IPv4',
            mac: 'aa:bb:cc:dd:ee:ff',
            internal: false,
            cidr: '192.168.1.10/24',
          },
        ],
      } as Record<string, NetworkInterfaceInfo[]>);
      const { getMACAddress } = await import('./platform.js');
      expect(getMACAddress()).toBe('aa:bb:cc:dd:ee:ff');
    });

    it('should return undefined when no non-internal IPv4 interface exists', async () => {
      const os = await import('node:os');
      vi.mocked(os.default.networkInterfaces).mockReturnValue({
        lo: [
          {
            address: '127.0.0.1',
            netmask: '255.0.0.0',
            family: 'IPv4',
            mac: '00:00:00:00:00:00',
            internal: true,
            cidr: '127.0.0.1/8',
          },
        ],
      } as Record<string, NetworkInterfaceInfo[]>);
      const { getMACAddress } = await import('./platform.js');
      expect(getMACAddress()).toBeUndefined();
    });

    it('should return undefined when no interfaces exist', async () => {
      const os = await import('node:os');
      vi.mocked(os.default.networkInterfaces).mockReturnValue({});
      const { getMACAddress } = await import('./platform.js');
      expect(getMACAddress()).toBeUndefined();
    });

    it('should skip interfaces with undefined entries', async () => {
      const os = await import('node:os');
      vi.mocked(os.default.networkInterfaces).mockReturnValue({
        eth0: undefined,
      } as unknown as Record<string, NetworkInterfaceInfo[]>);
      const { getMACAddress } = await import('./platform.js');
      expect(getMACAddress()).toBeUndefined();
    });

    it('should skip interfaces with all-zero MAC addresses', async () => {
      const os = await import('node:os');
      vi.mocked(os.default.networkInterfaces).mockReturnValue({
        eth0: [
          {
            address: '192.168.1.10',
            netmask: '255.255.255.0',
            family: 'IPv4',
            mac: '00:00:00:00:00:00',
            internal: false,
            cidr: '192.168.1.10/24',
          },
        ],
      } as Record<string, NetworkInterfaceInfo[]>);
      const { getMACAddress } = await import('./platform.js');
      expect(getMACAddress()).toBeUndefined();
    });
  });
});
