import { describe, it, expect } from 'vitest';
import semver from 'semver';
import { CLI_VERSION, SDK_VERSION } from './version.js';

describe('version', () => {
  it('CLI_VERSION is a valid semver string', () => {
    expect(semver.valid(CLI_VERSION)).not.toBeNull();
  });

  it('SDK_VERSION is a valid semver string', () => {
    expect(semver.valid(SDK_VERSION)).not.toBeNull();
  });
});
