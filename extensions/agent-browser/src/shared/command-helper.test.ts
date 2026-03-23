import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getBinPath, getConfigFlags } from './command-helper.js';

describe('getBinPath', () => {
  it('returns a path ending with agent-browser', () => {
    const binPath = getBinPath();
    expect(binPath).toContain('node_modules');
    expect(binPath).toContain('.bin');
    expect(binPath).toMatch(/agent-browser$/);
  });
});

describe('getConfigFlags', () => {
  it('always includes --json', () => {
    const flags = getConfigFlags({});
    expect(flags).toContain('--json');
  });

  it('adds --session when not default', () => {
    const flags = getConfigFlags({ session: 'my-session' });
    expect(flags).toContain('--session');
    expect(flags).toContain('my-session');
  });

  it('skips --session when set to default', () => {
    const flags = getConfigFlags({ session: 'default' });
    expect(flags).not.toContain('--session');
  });

  it('skips --session when empty', () => {
    const flags = getConfigFlags({ session: '' });
    expect(flags).not.toContain('--session');
  });

  it('adds --profile when set', () => {
    const flags = getConfigFlags({ profile: '/path/to/profile' });
    expect(flags).toContain('--profile');
    expect(flags).toContain('/path/to/profile');
  });

  it('skips --profile when empty', () => {
    const flags = getConfigFlags({ profile: '' });
    expect(flags).not.toContain('--profile');
  });

  it('handles multiple config values', () => {
    const flags = getConfigFlags({
      session: 'test',
      profile: '/tmp/profile',
    });
    expect(flags).toEqual(['--json', '--session', 'test', '--profile', '/tmp/profile']);
  });
});
