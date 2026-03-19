import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { info: vi.fn() },
}));

vi.mock('../registry-manager.js', () => ({
  searchAvailable: vi.fn(),
}));

import * as clack from '@clack/prompts';
import { handleRegistrySearch } from './registry-search.command.js';
import * as registryManager from '../registry-manager.js';

describe('registry-search command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays matching extensions', () => {
    vi.mocked(registryManager.searchAvailable).mockReturnValue([
      { name: 'hello-world', description: 'A hello extension', gitUrl: '', latestVersion: '1.0.0', type: 'standard', icon: '', author: 'test', tags: ['example'] },
    ]);

    handleRegistrySearch({
      query: 'hello',
      configs: [{ name: 'default', url: 'https://example.com', priority: 1, cacheTTL: 3600 }],
    });

    expect(registryManager.searchAvailable).toHaveBeenCalledWith(
      expect.any(Array),
      { query: 'hello', type: undefined, tag: undefined },
    );
    expect(clack.log.info).toHaveBeenCalledWith(expect.stringContaining('Found 1 extension'));
  });

  it('passes type and tag filters to searchAvailable', () => {
    vi.mocked(registryManager.searchAvailable).mockReturnValue([]);

    handleRegistrySearch({
      type: 'mcp',
      tag: 'example',
      configs: [],
    });

    expect(registryManager.searchAvailable).toHaveBeenCalledWith(
      expect.any(Array),
      { query: undefined, type: 'mcp', tag: 'example' },
    );
  });

  it('shows no-results message when nothing matches', () => {
    vi.mocked(registryManager.searchAvailable).mockReturnValue([]);

    handleRegistrySearch({
      query: 'nonexistent',
      configs: [],
    });

    expect(clack.log.info).toHaveBeenCalledWith(expect.stringContaining('No extensions found'));
  });

  it('displays tags in output when present', () => {
    vi.mocked(registryManager.searchAvailable).mockReturnValue([
      { name: 'ext1', description: 'Desc', gitUrl: '', latestVersion: '1.0.0', type: 'standard', icon: '', author: 'test', tags: ['tag1', 'tag2'] },
    ]);

    handleRegistrySearch({ configs: [] });

    const call = vi.mocked(clack.log.info).mock.calls[0]?.[0] as string;
    expect(call).toContain('[tag1, tag2]');
  });

  it('omits tag brackets when extension has no tags', () => {
    vi.mocked(registryManager.searchAvailable).mockReturnValue([
      { name: 'ext1', description: 'Desc', gitUrl: '', latestVersion: '1.0.0', type: 'standard', icon: '', author: 'test' },
    ]);

    handleRegistrySearch({ configs: [] });

    const call = vi.mocked(clack.log.info).mock.calls[0]?.[0] as string;
    expect(call).not.toContain('[');
  });
});
