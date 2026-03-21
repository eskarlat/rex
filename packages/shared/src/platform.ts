export type OSType = 'windows' | 'macos' | 'linux';

export type ArchType = 'x64' | 'arm64' | 'ia32' | 'arm' | 'unknown';

export interface PlatformInfo {
  readonly os: OSType;
  readonly arch: ArchType;
  readonly isWindows: boolean;
  readonly isMacos: boolean;
  readonly isLinux: boolean;
}
