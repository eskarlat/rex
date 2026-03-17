import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { info: vi.fn() },
}));

vi.mock('../registry-manager.js', () => ({
  list: vi.fn(),
}));

import * as clack from '@clack/prompts';
import { handleRegistryList } from './registry-list.command.js';
import * as registryManager from '../registry-manager.js';

describe('registry-list command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays registries with sync status', () => {
    vi.mocked(registryManager.list).mockReturnValue([
      { name: 'default', url: 'https://example.com', priority: 1, lastFetched: new Date(), isStale: false },
      { name: 'community', url: 'https://community.com', priority: 2, lastFetched: null, isStale: true },
    ]);

    handleRegistryList({
      configs: [
        { name: 'default', url: 'https://example.com', priority: 1, cacheTTL: 3600 },
        { name: 'community', url: 'https://community.com', priority: 2, cacheTTL: 3600 },
      ],
    });

    expect(registryManager.list).toHaveBeenCalled();
    expect(clack.log.info).toHaveBeenCalled();
  });

  it('shows message when no registries configured', () => {
    vi.mocked(registryManager.list).mockReturnValue([]);

    handleRegistryList({ configs: [] });

    expect(clack.log.info).toHaveBeenCalledWith(expect.stringContaining('No registries'));
  });
});
