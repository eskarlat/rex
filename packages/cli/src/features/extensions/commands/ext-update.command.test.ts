import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { info: vi.fn(), error: vi.fn(), success: vi.fn() },
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

import * as clack from '@clack/prompts';
import { handleExtUpdate } from './ext-update.command.js';
import { listInstalled, install, activate, getActivated } from '../manager/extension-manager.js';
import { resolve, installExtension } from '../../registry/registry-manager.js';

describe('ext-update command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    vi.mocked(resolve)
      .mockReturnValueOnce({ name: 'jira', gitUrl: 'https://jira', latestVersion: '1.1.0', type: 'standard', registryName: 'default' })
      .mockReturnValueOnce({ name: 'github', gitUrl: 'https://github', latestVersion: '2.1.0', type: 'mcp', registryName: 'default' });
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
});
