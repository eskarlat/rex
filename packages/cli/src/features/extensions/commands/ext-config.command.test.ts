import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { info: vi.fn(), error: vi.fn(), success: vi.fn() },
  select: vi.fn(),
  text: vi.fn(),
  password: vi.fn(),
}));

vi.mock('../manager/extension-manager.js', () => ({
  getActivated: vi.fn(),
}));

vi.mock('../manifest/manifest-loader.js', () => ({
  loadManifest: vi.fn(),
}));

vi.mock('../../../core/paths/paths.js', () => ({
  getExtensionDir: vi.fn(() => '/tmp/extensions/test/1.0.0'),
}));

vi.mock('../../config/config-manager.js', () => ({
  setExtensionConfig: vi.fn(),
  getExtensionConfigMappings: vi.fn(() => ({})),
}));

vi.mock('../../vault/vault-manager.js', () => ({
  listKeys: vi.fn(() => []),
  getEntriesByTag: vi.fn(() => []),
}));

import * as clack from '@clack/prompts';
import { handleExtConfig } from './ext-config.command.js';
import { getActivated } from '../manager/extension-manager.js';
import { loadManifest } from '../manifest/manifest-loader.js';
import { setExtensionConfig } from '../../config/config-manager.js';
import { listKeys, getEntriesByTag } from '../../vault/vault-manager.js';

describe('ext-config command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should error when extension is not activated', async () => {
    vi.mocked(getActivated).mockReturnValue({});

    await handleExtConfig({ name: 'jira', projectPath: '/tmp/project' });

    expect(clack.log.error).toHaveBeenCalledWith(
      'Extension "jira" is not activated in this project.',
    );
  });

  it('should inform when extension has no config schema', async () => {
    vi.mocked(getActivated).mockReturnValue({ jira: '1.0.0' });
    vi.mocked(loadManifest).mockReturnValue({
      name: 'jira',
      version: '1.0.0',
      description: 'Jira integration',
      type: 'standard',
      commands: {},
    });

    await handleExtConfig({ name: 'jira', projectPath: '/tmp/project' });

    expect(clack.log.info).toHaveBeenCalledWith(
      'Extension "jira" has no configurable fields.',
    );
  });

  it('should configure a direct value field', async () => {
    vi.mocked(getActivated).mockReturnValue({ jira: '1.0.0' });
    vi.mocked(loadManifest).mockReturnValue({
      name: 'jira',
      version: '1.0.0',
      description: 'Jira integration',
      type: 'standard',
      commands: {},
      config: {
        schema: {
          baseUrl: { type: 'string', description: 'Base URL', secret: false },
        },
      },
    });

    vi.mocked(clack.select).mockResolvedValue('direct');
    vi.mocked(clack.text).mockResolvedValue('https://jira.example.com');

    await handleExtConfig({ name: 'jira', projectPath: '/tmp/project' });

    expect(setExtensionConfig).toHaveBeenCalledWith('jira', 'baseUrl', {
      source: 'direct',
      value: 'https://jira.example.com',
    });
    expect(clack.log.success).toHaveBeenCalled();
  });

  it('should configure a vault-mapped secret field', async () => {
    vi.mocked(getActivated).mockReturnValue({ jira: '1.0.0' });
    vi.mocked(loadManifest).mockReturnValue({
      name: 'jira',
      version: '1.0.0',
      description: 'Jira integration',
      type: 'standard',
      commands: {},
      config: {
        schema: {
          apiToken: { type: 'string', description: 'API Token', secret: true },
        },
      },
    });

    vi.mocked(listKeys).mockReturnValue(['jira_token', 'github_token']);
    vi.mocked(clack.select)
      .mockResolvedValueOnce('vault')
      .mockResolvedValueOnce('jira_token');

    await handleExtConfig({ name: 'jira', projectPath: '/tmp/project' });

    expect(setExtensionConfig).toHaveBeenCalledWith('jira', 'apiToken', {
      source: 'vault',
      value: 'jira_token',
    });
  });

  it('should skip field when user selects skip', async () => {
    vi.mocked(getActivated).mockReturnValue({ jira: '1.0.0' });
    vi.mocked(loadManifest).mockReturnValue({
      name: 'jira',
      version: '1.0.0',
      description: 'Jira integration',
      type: 'standard',
      commands: {},
      config: {
        schema: {
          baseUrl: { type: 'string', description: 'Base URL', secret: false },
        },
      },
    });

    vi.mocked(clack.select).mockResolvedValue('skip');

    await handleExtConfig({ name: 'jira', projectPath: '/tmp/project' });

    expect(setExtensionConfig).not.toHaveBeenCalled();
    expect(clack.log.success).toHaveBeenCalled();
  });

  it('should enter secret value directly when no vault keys exist', async () => {
    vi.mocked(getActivated).mockReturnValue({ jira: '1.0.0' });
    vi.mocked(loadManifest).mockReturnValue({
      name: 'jira',
      version: '1.0.0',
      description: 'Jira integration',
      type: 'standard',
      commands: {},
      config: {
        schema: {
          apiToken: { type: 'string', description: 'API Token', secret: true },
        },
      },
    });

    vi.mocked(listKeys).mockReturnValue([]);
    vi.mocked(clack.select).mockResolvedValue('direct');
    vi.mocked(clack.password).mockResolvedValue('my-secret');

    await handleExtConfig({ name: 'jira', projectPath: '/tmp/project' });

    expect(clack.password).toHaveBeenCalled();
    expect(setExtensionConfig).toHaveBeenCalledWith('jira', 'apiToken', {
      source: 'direct',
      value: 'my-secret',
    });
  });

  it('should abort when user cancels vault key selection', async () => {
    vi.mocked(getActivated).mockReturnValue({ jira: '1.0.0' });
    vi.mocked(loadManifest).mockReturnValue({
      name: 'jira',
      version: '1.0.0',
      description: 'Jira integration',
      type: 'standard',
      commands: {},
      config: {
        schema: {
          apiToken: { type: 'string', description: 'API Token', secret: true },
        },
      },
    });

    vi.mocked(listKeys).mockReturnValue(['jira_token']);
    vi.mocked(clack.select)
      .mockResolvedValueOnce('vault')
      .mockResolvedValueOnce(Symbol('cancel'));

    await handleExtConfig({ name: 'jira', projectPath: '/tmp/project' });

    expect(clack.log.info).toHaveBeenCalledWith('Cancelled.');
    expect(setExtensionConfig).not.toHaveBeenCalled();
  });

  it('should abort when user cancels direct value entry', async () => {
    vi.mocked(getActivated).mockReturnValue({ jira: '1.0.0' });
    vi.mocked(loadManifest).mockReturnValue({
      name: 'jira',
      version: '1.0.0',
      description: 'Jira integration',
      type: 'standard',
      commands: {},
      config: {
        schema: {
          baseUrl: { type: 'string', description: 'Base URL', secret: false },
        },
      },
    });

    vi.mocked(clack.select).mockResolvedValue('direct');
    vi.mocked(clack.text).mockResolvedValue(Symbol('cancel'));

    await handleExtConfig({ name: 'jira', projectPath: '/tmp/project' });

    expect(clack.log.info).toHaveBeenCalledWith('Cancelled.');
    expect(setExtensionConfig).not.toHaveBeenCalled();
  });

  it('should show current vault mapping in field label', async () => {
    vi.mocked(getActivated).mockReturnValue({ jira: '1.0.0' });
    vi.mocked(loadManifest).mockReturnValue({
      name: 'jira',
      version: '1.0.0',
      description: 'Jira integration',
      type: 'standard',
      commands: {},
      config: {
        schema: {
          apiToken: { type: 'string', description: 'API Token', secret: true },
        },
      },
    });

    const { getExtensionConfigMappings } = await import('../../config/config-manager.js');
    vi.mocked(getExtensionConfigMappings).mockReturnValue({
      apiToken: { source: 'vault', value: 'jira_token' },
    });

    vi.mocked(clack.select).mockResolvedValue('skip');

    await handleExtConfig({ name: 'jira', projectPath: '/tmp/project' });

    expect(clack.select).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('vault:jira_token'),
    }));
  });

  it('should show default value in field label', async () => {
    vi.mocked(getActivated).mockReturnValue({ jira: '1.0.0' });
    vi.mocked(loadManifest).mockReturnValue({
      name: 'jira',
      version: '1.0.0',
      description: 'Jira integration',
      type: 'standard',
      commands: {},
      config: {
        schema: {
          timeout: { type: 'number', description: 'Timeout', secret: false, default: 30 },
        },
      },
    });

    vi.mocked(clack.select).mockResolvedValue('skip');

    await handleExtConfig({ name: 'jira', projectPath: '/tmp/project' });

    expect(clack.select).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('default: 30'),
    }));
  });

  it('should handle empty config schema', async () => {
    vi.mocked(getActivated).mockReturnValue({ jira: '1.0.0' });
    vi.mocked(loadManifest).mockReturnValue({
      name: 'jira',
      version: '1.0.0',
      description: 'Jira integration',
      type: 'standard',
      commands: {},
      config: { schema: {} },
    });

    await handleExtConfig({ name: 'jira', projectPath: '/tmp/project' });

    expect(clack.log.info).toHaveBeenCalledWith(
      'Extension "jira" has no configurable fields.',
    );
  });

  it('should sort vault keys by vaultHint tag matching', async () => {
    vi.mocked(getActivated).mockReturnValue({ jira: '1.0.0' });
    vi.mocked(loadManifest).mockReturnValue({
      name: 'jira',
      version: '1.0.0',
      description: 'Jira integration',
      type: 'standard',
      commands: {},
      config: {
        schema: {
          apiToken: { type: 'string', description: 'API Token', secret: true, vaultHint: 'jira' },
        },
      },
    });

    vi.mocked(listKeys).mockReturnValue(['github_token', 'jira_token', 'slack_token']);
    vi.mocked(getEntriesByTag).mockReturnValue([
      { key: 'jira_token', value: '********', secret: true, tags: ['jira'] },
    ]);

    vi.mocked(clack.select)
      .mockResolvedValueOnce('vault')
      .mockResolvedValueOnce('jira_token');

    await handleExtConfig({ name: 'jira', projectPath: '/tmp/project' });

    // Verify the second select call (vault key picker) has jira_token first with hint
    const selectCalls = vi.mocked(clack.select).mock.calls;
    const vaultSelect = selectCalls[1]?.[0] as { options: Array<{ value: string; hint?: string }> };
    expect(vaultSelect.options[0]?.value).toBe('jira_token');
    expect(vaultSelect.options[0]?.hint).toContain('jira');
  });

  it('should abort on cancel', async () => {
    vi.mocked(getActivated).mockReturnValue({ jira: '1.0.0' });
    vi.mocked(loadManifest).mockReturnValue({
      name: 'jira',
      version: '1.0.0',
      description: 'Jira integration',
      type: 'standard',
      commands: {},
      config: {
        schema: {
          baseUrl: { type: 'string', description: 'Base URL', secret: false },
        },
      },
    });

    vi.mocked(clack.select).mockResolvedValue(Symbol('cancel'));

    await handleExtConfig({ name: 'jira', projectPath: '/tmp/project' });

    expect(clack.log.info).toHaveBeenCalledWith('Cancelled.');
    expect(setExtensionConfig).not.toHaveBeenCalled();
  });
});
