import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
  password: vi.fn(),
  text: vi.fn(),
}));

vi.mock('../vault-manager.js', () => ({
  setEntry: vi.fn(),
}));

describe('vault-set command', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('should set a non-secret value', async () => {
    const { handleVaultSet } = await import('./vault-set.command.js');
    const { setEntry } = await import('../vault-manager.js');

    await handleVaultSet({ key: 'api_url', value: 'https://api.com', secret: false, tags: [] });

    expect(setEntry).toHaveBeenCalledWith('api_url', 'https://api.com', false, []);
  });

  it('should set a secret value with tags', async () => {
    const { handleVaultSet } = await import('./vault-set.command.js');
    const { setEntry } = await import('../vault-manager.js');

    await handleVaultSet({
      key: 'token',
      value: 'secret123',
      secret: true,
      tags: ['jira', 'auth'],
    });

    expect(setEntry).toHaveBeenCalledWith('token', 'secret123', true, ['jira', 'auth']);
  });

  it('should prompt for value when not provided and secret', async () => {
    const clack = await import('@clack/prompts');
    vi.mocked(clack.password).mockResolvedValue('prompted-secret');

    const { handleVaultSet } = await import('./vault-set.command.js');
    const { setEntry } = await import('../vault-manager.js');

    await handleVaultSet({ key: 'token', secret: true, tags: [] });

    expect(clack.password).toHaveBeenCalled();
    expect(setEntry).toHaveBeenCalledWith('token', 'prompted-secret', true, []);
  });

  it('should prompt for value when not provided and non-secret', async () => {
    const clack = await import('@clack/prompts');
    vi.mocked(clack.text).mockResolvedValue('prompted-value');

    const { handleVaultSet } = await import('./vault-set.command.js');
    const { setEntry } = await import('../vault-manager.js');

    await handleVaultSet({ key: 'url', secret: false, tags: [] });

    expect(clack.text).toHaveBeenCalled();
    expect(setEntry).toHaveBeenCalledWith('url', 'prompted-value', false, []);
  });

  it('should abort when user cancels prompt', async () => {
    const clack = await import('@clack/prompts');
    vi.mocked(clack.text).mockResolvedValue(Symbol('cancel'));

    const { handleVaultSet } = await import('./vault-set.command.js');
    const { setEntry } = await import('../vault-manager.js');

    await handleVaultSet({ key: 'url', secret: false, tags: [] });

    expect(setEntry).not.toHaveBeenCalled();
    expect(clack.log.info).toHaveBeenCalledWith('Cancelled.');
  });
});
