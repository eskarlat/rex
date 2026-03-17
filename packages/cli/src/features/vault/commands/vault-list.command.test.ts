import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { info: vi.fn(), warn: vi.fn() },
}));

vi.mock('../vault-manager.js', () => ({
  listEntries: vi.fn(),
}));

describe('vault-list command', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('should display vault entries', async () => {
    const { listEntries } = await import('../vault-manager.js');
    vi.mocked(listEntries).mockReturnValue([
      { key: 'api_url', value: 'https://api.com', secret: false, tags: ['http'] },
      { key: 'token', value: '********', secret: true, tags: ['auth'] },
    ]);

    const clack = await import('@clack/prompts');
    const { handleVaultList } = await import('./vault-list.command.js');
    handleVaultList();

    expect(clack.log.info).toHaveBeenCalledTimes(2);
  });

  it('should show message when vault is empty', async () => {
    const { listEntries } = await import('../vault-manager.js');
    vi.mocked(listEntries).mockReturnValue([]);

    const clack = await import('@clack/prompts');
    const { handleVaultList } = await import('./vault-list.command.js');
    handleVaultList();

    expect(clack.log.info).toHaveBeenCalledWith('No vault entries found.');
  });
});
