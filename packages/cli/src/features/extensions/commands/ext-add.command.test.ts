import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { info: vi.fn(), success: vi.fn(), error: vi.fn(), warn: vi.fn() },
  spinner: vi.fn().mockReturnValue({ start: vi.fn(), stop: vi.fn() }),
}));

vi.mock('../../registry/registry-manager.js', () => ({
  resolve: vi.fn(),
  installExtension: vi.fn().mockResolvedValue('/path/to/ext'),
}));

vi.mock('../manager/extension-manager.js', () => ({
  install: vi.fn(),
  activate: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../../core/database/database.js', () => ({
  getDb: vi.fn().mockReturnValue({}),
}));

import * as clack from '@clack/prompts';
import { handleExtAdd } from './ext-add.command.js';
import * as registryManager from '../../registry/registry-manager.js';
import * as extensionManager from '../manager/extension-manager.js';

describe('ext-add command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves, installs, and records extension', async () => {
    vi.mocked(registryManager.resolve).mockReturnValue({
      name: 'my-ext',
      gitUrl: 'https://github.com/user/my-ext.git',
      latestVersion: '1.0.0',
      type: 'standard',
      registryName: 'default',
    });

    await handleExtAdd({
      name: 'my-ext',
      registryConfigs: [{ name: 'default', url: 'https://example.com', priority: 1, cacheTTL: 3600 }],
      projectPath: '/tmp/project',
    });

    expect(registryManager.resolve).toHaveBeenCalledWith('my-ext', expect.any(Array));
    expect(registryManager.installExtension).toHaveBeenCalledWith('my-ext', 'https://github.com/user/my-ext.git', '1.0.0');
    expect(extensionManager.install).toHaveBeenCalled();
  });

  it('reports error when extension not found in registries', async () => {
    vi.mocked(registryManager.resolve).mockReturnValue(null);

    await handleExtAdd({
      name: 'nonexistent',
      registryConfigs: [{ name: 'default', url: 'https://example.com', priority: 1, cacheTTL: 3600 }],
      projectPath: null,
    });

    expect(clack.log.error).toHaveBeenCalled();
    expect(registryManager.installExtension).not.toHaveBeenCalled();
  });

  it('activates in project when projectPath provided', async () => {
    vi.mocked(registryManager.resolve).mockReturnValue({
      name: 'my-ext',
      gitUrl: 'https://github.com/user/my-ext.git',
      latestVersion: '1.0.0',
      type: 'standard',
      registryName: 'default',
    });

    await handleExtAdd({
      name: 'my-ext',
      registryConfigs: [{ name: 'default', url: 'https://example.com', priority: 1, cacheTTL: 3600 }],
      projectPath: '/tmp/project',
    });

    expect(extensionManager.activate).toHaveBeenCalled();
  });
});
