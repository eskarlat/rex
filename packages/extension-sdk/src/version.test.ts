import { describe, it, expect } from 'vitest';
import { SDK_VERSION } from './version.js';

const SEMVER_REGEX = /^\d+\.\d+\.\d+(?:-[\w.]+)?(?:\+[\w.]+)?$/;

describe('SDK version', () => {
  it('SDK_VERSION is a valid semver string', () => {
    expect(SDK_VERSION).toMatch(SEMVER_REGEX);
  });
});
