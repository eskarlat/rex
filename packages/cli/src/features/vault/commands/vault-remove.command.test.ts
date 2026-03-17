import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { success: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

vi.mock('../vault-manager.js', () => ({
  removeEntry: vi.fn(),
}));

vi.mock('../../config/config-manager.js', () => ({
  getReferencingExtensions: vi.fn(() => []),
}));

describe('vault-remove command', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('should remove an existing entry', async () => {
    const { removeEntry } = await import('../vault-manager.js');
    vi.mocked(removeEntry).mockReturnValue(true);

    const clack = await import('@clack/prompts');
    const { handleVaultRemove } = await import('./vault-remove.command.js');
    handleVaultRemove({ key: 'old_key' });

    expect(removeEntry).toHaveBeenCalledWith('old_key');
    expect(clack.log.success).toHaveBeenCalledWith('Removed vault entry "old_key".');
  });

  it('should show error when key does not exist', async () => {
    const { removeEntry } = await import('../vault-manager.js');
    vi.mocked(removeEntry).mockReturnValue(false);

    const clack = await import('@clack/prompts');
    const { handleVaultRemove } = await import('./vault-remove.command.js');
    handleVaultRemove({ key: 'missing' });

    expect(clack.log.error).toHaveBeenCalledWith('Vault entry "missing" not found.');
  });

  it('should warn when entry is referenced by extensions', async () => {
    const { removeEntry } = await import('../vault-manager.js');
    vi.mocked(removeEntry).mockReturnValue(true);

    const { getReferencingExtensions } = await import('../../config/config-manager.js');
    vi.mocked(getReferencingExtensions).mockReturnValue(['jira', 'github']);

    const clack = await import('@clack/prompts');
    const { handleVaultRemove } = await import('./vault-remove.command.js');
    handleVaultRemove({ key: 'token' });

    expect(clack.log.warn).toHaveBeenCalledWith(
      expect.stringContaining('referenced by: jira, github'),
    );
    expect(removeEntry).toHaveBeenCalledWith('token');
  });
});
