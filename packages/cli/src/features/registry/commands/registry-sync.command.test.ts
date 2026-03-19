import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { success: vi.fn(), error: vi.fn(), warn: vi.fn() },
  spinner: vi.fn().mockReturnValue({ start: vi.fn(), stop: vi.fn() }),
}));

vi.mock('../registry-manager.js', () => ({
  syncAll: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../extensions/update-cache/update-cache.js', () => ({
  refreshUpdateCache: vi.fn(),
}));

vi.mock('../../../core/database/database.js', () => ({
  getDb: vi.fn().mockReturnValue({}),
}));

import * as clack from '@clack/prompts';
import { handleRegistrySync } from './registry-sync.command.js';
import * as registryManager from '../registry-manager.js';
import { refreshUpdateCache } from '../../extensions/update-cache/update-cache.js';

describe('registry-sync command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('syncs all registries', async () => {
    await handleRegistrySync({
      configs: [{ name: 'default', url: 'https://example.com', priority: 1, cacheTTL: 3600 }],
    });

    expect(registryManager.syncAll).toHaveBeenCalled();
    expect(clack.log.success).toHaveBeenCalled();
  });

  it('refreshes update cache after sync', async () => {
    await handleRegistrySync({
      configs: [{ name: 'default', url: 'https://example.com', priority: 1, cacheTTL: 3600 }],
    });

    expect(refreshUpdateCache).toHaveBeenCalled();
  });

  it('reports per-registry sync failures', async () => {
    vi.mocked(registryManager.syncAll).mockResolvedValue(['default: Network error']);

    await handleRegistrySync({
      configs: [{ name: 'default', url: 'https://example.com', priority: 1, cacheTTL: 3600 }],
    });

    expect(clack.log.warn).toHaveBeenCalledWith(expect.stringContaining('Network error'));
  });
});
