import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { info: vi.fn(), error: vi.fn(), success: vi.fn(), warn: vi.fn() },
  spinner: vi.fn(() => ({ start: vi.fn(), stop: vi.fn() })),
}));

vi.mock('../manager/extension-manager.js', () => ({
  listInstalled: vi.fn(),
  install: vi.fn(),
  activate: vi.fn(),
  getActivated: vi.fn(() => ({})),
}));

vi.mock('../../registry/registry-manager.js', () => ({
  resolve: vi.fn(),
  installExtension: vi.fn(() => Promise.resolve('/tmp/ext')),
  ensureSynced: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../engine/engine-compat.js', () => ({
  checkEngineConstraints: vi.fn(),
}));

vi.mock('../../../core/version.js', () => ({
  CLI_VERSION: '1.0.0',
  SDK_VERSION: '1.0.0',
}));

vi.mock('../update-cache/update-cache.js', () => ({
  refreshUpdateCache: vi.fn(),
}));

import * as clack from '@clack/prompts';
import { handleExtUpdate } from './ext-update.command.js';
import { listInstalled, install, activate, getActivated } from '../manager/extension-manager.js';
import { resolve, installExtension } from '../../registry/registry-manager.js';
import { checkEngineConstraints } from '../engine/engine-compat.js';
import { refreshUpdateCache } from '../update-cache/update-cache.js';

describe('ext-update command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkEngineConstraints).mockReturnValue({ compatible: true, issues: [] });
  });

  it('should update a single extension', async () => {
    vi.mocked(listInstalled).mockReturnValue([
      { name: 'jira', version: '1.0.0', registry_source: 'default', installed_at: '2026-01-01', type: 'standard' },
    ]);
    vi.mocked(resolve).mockReturnValue({
      name: 'jira', gitUrl: 'https://github.com/ext-jira', latestVersion: '1.1.0', type: 'standard', registryName: 'default',
    });
    vi.mocked(getActivated).mockReturnValue({ jira: '1.0.0' });

    await handleExtUpdate({
      name: 'jira',
      all: false,
      registryConfigs: [],
      projectPath: '/tmp/project',
      db: {} as never,
    });

    expect(installExtension).toHaveBeenCalledWith('jira', 'https://github.com/ext-jira', '1.1.0', 'default');
    expect(install).toHaveBeenCalledWith('jira', '1.1.0', 'default', 'standard', expect.anything());
    expect(activate).toHaveBeenCalledWith('jira', '1.1.0', '/tmp/project', '/tmp/ext');
    expect(clack.log.success).toHaveBeenCalled();
    expect(refreshUpdateCache).toHaveBeenCalled();
  });

  it('should skip when extension is already up to date', async () => {
    vi.mocked(listInstalled).mockReturnValue([
      { name: 'jira', version: '1.0.0', registry_source: 'default', installed_at: '2026-01-01', type: 'standard' },
    ]);
    vi.mocked(resolve).mockReturnValue({
      name: 'jira', gitUrl: '', latestVersion: '1.0.0', type: 'standard', registryName: 'default',
    });

    await handleExtUpdate({
      name: 'jira',
      all: false,
      registryConfigs: [],
      projectPath: '/tmp/project',
      db: {} as never,
    });

    expect(installExtension).not.toHaveBeenCalled();
    expect(clack.log.info).toHaveBeenCalledWith(expect.stringContaining('already up to date'));
  });

  it('should error when extension is not installed', async () => {
    vi.mocked(listInstalled).mockReturnValue([]);

    await handleExtUpdate({
      name: 'missing',
      all: false,
      registryConfigs: [],
      projectPath: '/tmp/project',
      db: {} as never,
    });

    expect(clack.log.error).toHaveBeenCalledWith(expect.stringContaining('not installed'));
  });

  it('should update all extensions when --all flag is used', async () => {
    vi.mocked(listInstalled).mockReturnValue([
      { name: 'jira', version: '1.0.0', registry_source: 'default', installed_at: '2026-01-01', type: 'standard' },
      { name: 'github', version: '2.0.0', registry_source: 'default', installed_at: '2026-01-01', type: 'mcp' },
    ]);
    vi.mocked(resolve).mockImplementation((name: string) => {
      if (name === 'jira') return { name: 'jira', gitUrl: 'https://jira', latestVersion: '1.1.0', type: 'standard', registryName: 'default' };
      if (name === 'github') return { name: 'github', gitUrl: 'https://github', latestVersion: '2.1.0', type: 'mcp', registryName: 'default' };
      return null;
    });
    vi.mocked(getActivated).mockReturnValue({});

    await handleExtUpdate({
      all: true,
      registryConfigs: [],
      projectPath: '/tmp/project',
      db: {} as never,
    });

    expect(installExtension).toHaveBeenCalledTimes(2);
    expect(install).toHaveBeenCalledTimes(2);
  });

  it('blocks update when engine is incompatible and no --force', async () => {
    vi.mocked(listInstalled).mockReturnValue([
      { name: 'jira', version: '1.0.0', registry_source: 'default', installed_at: '2026-01-01', type: 'standard' },
    ]);
    vi.mocked(resolve).mockReturnValue({
      name: 'jira', gitUrl: '', latestVersion: '2.0.0', type: 'standard', registryName: 'default',
      engines: { 'renre-kit': '>=5.0.0' },
    });
    vi.mocked(checkEngineConstraints).mockReturnValue({
      compatible: false,
      issues: ['Requires renre-kit >=5.0.0, current is 1.0.0'],
    });

    await handleExtUpdate({
      name: 'jira',
      all: false,
      registryConfigs: [],
      projectPath: '/tmp/project',
      db: {} as never,
    });

    expect(installExtension).not.toHaveBeenCalled();
    expect(clack.log.error).toHaveBeenCalledWith(expect.stringContaining('incompatible'));
    expect(clack.log.error).toHaveBeenCalledWith(expect.stringContaining('--force'));
  });

  it('allows update with --force despite engine incompatibility', async () => {
    vi.mocked(listInstalled).mockReturnValue([
      { name: 'jira', version: '1.0.0', registry_source: 'default', installed_at: '2026-01-01', type: 'standard' },
    ]);
    vi.mocked(resolve).mockReturnValue({
      name: 'jira', gitUrl: 'https://github.com/ext-jira', latestVersion: '2.0.0', type: 'standard', registryName: 'default',
      engines: { 'renre-kit': '>=5.0.0' },
    });
    vi.mocked(checkEngineConstraints).mockReturnValue({
      compatible: false,
      issues: ['Requires renre-kit >=5.0.0, current is 1.0.0'],
    });
    vi.mocked(getActivated).mockReturnValue({});

    await handleExtUpdate({
      name: 'jira',
      all: false,
      force: true,
      registryConfigs: [],
      projectPath: '/tmp/project',
      db: {} as never,
    });

    expect(installExtension).toHaveBeenCalled();
    expect(clack.log.warn).toHaveBeenCalledWith(expect.stringContaining('Forcing update'));
    expect(clack.log.success).toHaveBeenCalled();
  });

  it('uses semver.gt for comparison (1.9.0 vs 1.10.0)', async () => {
    vi.mocked(listInstalled).mockReturnValue([
      { name: 'jira', version: '1.9.0', registry_source: 'default', installed_at: '2026-01-01', type: 'standard' },
    ]);
    vi.mocked(resolve).mockReturnValue({
      name: 'jira', gitUrl: 'https://github.com/ext-jira', latestVersion: '1.10.0', type: 'standard', registryName: 'default',
    });
    vi.mocked(getActivated).mockReturnValue({});

    await handleExtUpdate({
      name: 'jira',
      all: false,
      registryConfigs: [],
      projectPath: '/tmp/project',
      db: {} as never,
    });

    expect(installExtension).toHaveBeenCalled();
    expect(clack.log.success).toHaveBeenCalledWith(expect.stringContaining('1.9.0 → 1.10.0'));
  });
});
