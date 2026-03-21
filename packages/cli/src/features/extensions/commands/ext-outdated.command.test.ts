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

vi.mock('../engine/engine-compat.js', () => ({
  checkEngineConstraints: vi.fn(),
}));

vi.mock('../../../core/version.js', () => ({
  CLI_VERSION: '1.0.0',
  SDK_VERSION: '1.0.0',
}));

import * as clack from '@clack/prompts';
import { handleExtOutdated } from './ext-outdated.command.js';
import { listInstalled } from '../manager/extension-manager.js';
import { resolve } from '../../registry/registry-manager.js';
import { checkEngineConstraints } from '../engine/engine-compat.js';

describe('ext-outdated command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkEngineConstraints).mockReturnValue({ compatible: true, issues: [] });
  });

  it('should show outdated extensions', () => {
    vi.mocked(listInstalled).mockReturnValue([
      {
        name: 'jira',
        version: '1.0.0',
        registry_source: 'default',
        installed_at: '2026-01-01',
        type: 'standard',
      },
      {
        name: 'github',
        version: '2.0.0',
        registry_source: 'default',
        installed_at: '2026-01-01',
        type: 'standard',
      },
    ]);

    vi.mocked(resolve)
      .mockReturnValueOnce({
        name: 'jira',
        gitUrl: '',
        latestVersion: '1.1.0',
        type: 'standard',
        registryName: 'default',
      })
      .mockReturnValueOnce({
        name: 'github',
        gitUrl: '',
        latestVersion: '2.0.0',
        type: 'standard',
        registryName: 'default',
      });

    handleExtOutdated({ registryConfigs: [], db: {} as never });

    expect(clack.log.warn).toHaveBeenCalledWith(expect.stringContaining('jira: 1.0.0 → 1.1.0'));
  });

  it('should show message when all extensions are up to date', () => {
    vi.mocked(listInstalled).mockReturnValue([
      {
        name: 'jira',
        version: '1.0.0',
        registry_source: 'default',
        installed_at: '2026-01-01',
        type: 'standard',
      },
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

  it('uses semver.gt for comparison (1.9.0 < 1.10.0)', () => {
    vi.mocked(listInstalled).mockReturnValue([
      {
        name: 'ext-a',
        version: '1.9.0',
        registry_source: 'default',
        installed_at: '2026-01-01',
        type: 'standard',
      },
    ]);
    vi.mocked(resolve).mockReturnValue({
      name: 'ext-a',
      gitUrl: '',
      latestVersion: '1.10.0',
      type: 'standard',
      registryName: 'default',
    });

    handleExtOutdated({ registryConfigs: [], db: {} as never });

    expect(clack.log.warn).toHaveBeenCalledWith(expect.stringContaining('1.9.0 → 1.10.0'));
  });

  it('shows incompatible engine tag', () => {
    vi.mocked(listInstalled).mockReturnValue([
      {
        name: 'ext-a',
        version: '1.0.0',
        registry_source: 'default',
        installed_at: '2026-01-01',
        type: 'standard',
      },
    ]);
    vi.mocked(resolve).mockReturnValue({
      name: 'ext-a',
      gitUrl: '',
      latestVersion: '2.0.0',
      type: 'standard',
      registryName: 'default',
      engines: { 'renre-kit': '>=5.0.0' },
    });
    vi.mocked(checkEngineConstraints).mockReturnValue({
      compatible: false,
      issues: ['Requires renre-kit >=5.0.0, current is 1.0.0'],
    });

    handleExtOutdated({ registryConfigs: [], db: {} as never });

    expect(clack.log.warn).toHaveBeenCalledWith(expect.stringContaining('[incompatible engine]'));
    expect(clack.log.warn).toHaveBeenCalledWith(expect.stringContaining('Requires renre-kit'));
  });

  it('skips extensions with invalid semver', () => {
    vi.mocked(listInstalled).mockReturnValue([
      {
        name: 'ext-a',
        version: 'not-valid',
        registry_source: 'default',
        installed_at: '2026-01-01',
        type: 'standard',
      },
    ]);

    handleExtOutdated({ registryConfigs: [], db: {} as never });

    expect(clack.log.info).toHaveBeenCalledWith('All extensions are up to date.');
  });
});
