import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { info: vi.fn(), warn: vi.fn() },
}));

vi.mock('../manager/extension-manager.js', () => ({
  listInstalled: vi.fn(),
}));

vi.mock('../../registry/registry-manager.js', () => ({
  resolve: vi.fn(),
}));

import * as clack from '@clack/prompts';
import { handleExtOutdated } from './ext-outdated.command.js';
import { listInstalled } from '../manager/extension-manager.js';
import { resolve } from '../../registry/registry-manager.js';

describe('ext-outdated command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show outdated extensions', () => {
    vi.mocked(listInstalled).mockReturnValue([
      { name: 'jira', version: '1.0.0', registry_source: 'default', installed_at: '2026-01-01', type: 'standard' },
      { name: 'github', version: '2.0.0', registry_source: 'default', installed_at: '2026-01-01', type: 'standard' },
    ]);

    vi.mocked(resolve)
      .mockReturnValueOnce({ name: 'jira', gitUrl: '', latestVersion: '1.1.0', type: 'standard', registryName: 'default' })
      .mockReturnValueOnce({ name: 'github', gitUrl: '', latestVersion: '2.0.0', type: 'standard', registryName: 'default' });

    handleExtOutdated({ registryConfigs: [], db: {} as never });

    expect(clack.log.warn).toHaveBeenCalledWith(
      expect.stringContaining('jira: 1.0.0 → 1.1.0'),
    );
  });

  it('should show message when all extensions are up to date', () => {
    vi.mocked(listInstalled).mockReturnValue([
      { name: 'jira', version: '1.0.0', registry_source: 'default', installed_at: '2026-01-01', type: 'standard' },
    ]);

    vi.mocked(resolve).mockReturnValue({
      name: 'jira',
      gitUrl: '',
      latestVersion: '1.0.0',
      type: 'standard',
      registryName: 'default',
    });

    handleExtOutdated({ registryConfigs: [], db: {} as never });

    expect(clack.log.info).toHaveBeenCalledWith('All extensions are up to date.');
  });

  it('should show message when no extensions are installed', () => {
    vi.mocked(listInstalled).mockReturnValue([]);

    handleExtOutdated({ registryConfigs: [], db: {} as never });

    expect(clack.log.info).toHaveBeenCalledWith('No extensions installed.');
  });
});
