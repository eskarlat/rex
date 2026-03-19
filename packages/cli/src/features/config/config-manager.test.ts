import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../shared/fs-helpers.js', () => ({
  pathExistsSync: vi.fn(),
  readJsonSync: vi.fn(),
  writeJsonSync: vi.fn(),
  ensureDirSync: vi.fn(),
}));

vi.mock('../../shared/schema-migration.js', () => ({
  migrateFile: vi.fn((_path: string, data: Record<string, unknown>) => data),
  getSchemaVersion: vi.fn((data: Record<string, unknown>) =>
    typeof data['schemaVersion'] === 'number' ? data['schemaVersion'] : 0,
  ),
}));

vi.mock('../../core/paths/paths.js', () => ({
  CONFIG_PATH: '/tmp/test-config.json',
  GLOBAL_DIR: '/tmp/test-global',
  VAULT_PATH: '/tmp/test-vault.json',
  PROJECT_DIR: '.renre-kit',
  MANIFEST_JSON: 'manifest.json',
}));

vi.mock('../vault/vault-manager.js', () => ({
  getDecryptedValue: vi.fn(),
  listKeys: vi.fn(() => []),
}));

describe('config-manager', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  describe('loadGlobalConfig', () => {
    it('should return default config when file does not exist', async () => {
      const { pathExistsSync } = await import('../../shared/fs-helpers.js');
      vi.mocked(pathExistsSync).mockReturnValue(false);

      const { loadGlobalConfig } = await import('./config-manager.js');
      const config = loadGlobalConfig();

      expect(config.registries).toHaveLength(1);
      expect(config.registries[0]).toMatchObject({ name: 'default', url: 'https://github.com/eskarlat/rex.git' });
      expect(config.settings).toEqual({});
      expect(config.extensionConfigs).toEqual({});
    });

    it('should merge defaults for missing fields in config file', async () => {
      const { pathExistsSync, readJsonSync } = await import('../../shared/fs-helpers.js');
      vi.mocked(pathExistsSync).mockReturnValue(true);
      vi.mocked(readJsonSync).mockReturnValue({
        settings: { theme: 'dark' },
      });

      const { loadGlobalConfig } = await import('./config-manager.js');
      const config = loadGlobalConfig();

      expect(config.registries).toHaveLength(1);
      expect(config.registries[0]).toMatchObject({ name: 'default' });
      expect(config.settings).toEqual({ theme: 'dark' });
      expect(config.extensionConfigs).toEqual({});
    });

    it('should load config from file', async () => {
      const { pathExistsSync, readJsonSync } = await import('../../shared/fs-helpers.js');
      vi.mocked(pathExistsSync).mockReturnValue(true);
      vi.mocked(readJsonSync).mockReturnValue({
        schemaVersion: 1,
        registries: [{ name: 'default', url: 'https://example.com', priority: 0, cacheTTL: 3600 }],
        settings: { theme: 'dark' },
        extensionConfigs: {
          jira: { apiToken: { source: 'vault', value: 'jira_token' } },
        },
      });

      const { loadGlobalConfig } = await import('./config-manager.js');
      const config = loadGlobalConfig();

      expect(config.registries).toHaveLength(1);
      expect(config.extensionConfigs['jira']).toBeDefined();
    });

    it('should call migrateFile when loading config', async () => {
      const { pathExistsSync, readJsonSync } = await import('../../shared/fs-helpers.js');
      const { migrateFile } = await import('../../shared/schema-migration.js');
      vi.mocked(pathExistsSync).mockReturnValue(true);
      vi.mocked(readJsonSync).mockReturnValue({
        registries: [],
        settings: {},
        extensionConfigs: {},
      });

      const { loadGlobalConfig } = await import('./config-manager.js');
      loadGlobalConfig();

      expect(migrateFile).toHaveBeenCalledWith(
        '/tmp/test-config.json',
        expect.any(Object),
        expect.any(Array),
      );
    });
  });

  describe('saveGlobalConfig', () => {
    it('should save config to file', async () => {
      const { writeJsonSync, ensureDirSync } = await import('../../shared/fs-helpers.js');

      const { saveGlobalConfig } = await import('./config-manager.js');
      saveGlobalConfig({
        schemaVersion: 1,
        registries: [],
        settings: {},
        extensionConfigs: {
          jira: { apiToken: { source: 'vault', value: 'jira_token' } },
        },
      });

      expect(ensureDirSync).toHaveBeenCalledWith('/tmp/test-global');
      expect(writeJsonSync).toHaveBeenCalledWith(
        '/tmp/test-config.json',
        expect.objectContaining({ extensionConfigs: expect.any(Object) }),
      );
    });
  });

  describe('setExtensionConfig', () => {
    it('should set a vault-mapped config field', async () => {
      const { pathExistsSync, readJsonSync, writeJsonSync } =
        await import('../../shared/fs-helpers.js');
      vi.mocked(pathExistsSync).mockReturnValue(false);

      const { setExtensionConfig } = await import('./config-manager.js');
      setExtensionConfig('jira', 'apiToken', { source: 'vault', value: 'jira_token' });

      const call = vi.mocked(writeJsonSync).mock.calls[0];
      const written = call?.[1] as { extensionConfigs: Record<string, Record<string, unknown>> };
      expect(written.extensionConfigs['jira']?.['apiToken']).toEqual({
        source: 'vault',
        value: 'jira_token',
      });
    });

    it('should set a direct config field', async () => {
      const { pathExistsSync, writeJsonSync } =
        await import('../../shared/fs-helpers.js');
      vi.mocked(pathExistsSync).mockReturnValue(false);

      const { setExtensionConfig } = await import('./config-manager.js');
      setExtensionConfig('jira', 'baseUrl', { source: 'direct', value: 'https://jira.example.com' });

      const call = vi.mocked(writeJsonSync).mock.calls[0];
      const written = call?.[1] as { extensionConfigs: Record<string, Record<string, unknown>> };
      expect(written.extensionConfigs['jira']?.['baseUrl']).toEqual({
        source: 'direct',
        value: 'https://jira.example.com',
      });
    });
  });

  describe('resolveExtensionConfig', () => {
    it('should resolve vault-mapped field to decrypted value', async () => {
      const { pathExistsSync, readJsonSync } =
        await import('../../shared/fs-helpers.js');
      vi.mocked(pathExistsSync).mockReturnValue(true);
      vi.mocked(readJsonSync).mockReturnValue({
        registries: [],
        settings: {},
        extensionConfigs: {
          jira: { apiToken: { source: 'vault', value: 'jira_token' } },
        },
      });

      const { getDecryptedValue } = await import('../vault/vault-manager.js');
      vi.mocked(getDecryptedValue).mockReturnValue('decrypted-token');

      const { resolveExtensionConfig } = await import('./config-manager.js');
      const schema = {
        apiToken: { type: 'string' as const, description: 'API Token', secret: true },
      };
      const resolved = resolveExtensionConfig('jira', schema);

      expect(resolved['apiToken']).toBe('decrypted-token');
    });

    it('should resolve direct field to its value', async () => {
      const { pathExistsSync, readJsonSync } =
        await import('../../shared/fs-helpers.js');
      vi.mocked(pathExistsSync).mockReturnValue(true);
      vi.mocked(readJsonSync).mockReturnValue({
        registries: [],
        settings: {},
        extensionConfigs: {
          jira: { baseUrl: { source: 'direct', value: 'https://jira.example.com' } },
        },
      });

      const { resolveExtensionConfig } = await import('./config-manager.js');
      const schema = {
        baseUrl: { type: 'string' as const, description: 'Base URL', secret: false },
      };
      const resolved = resolveExtensionConfig('jira', schema);

      expect(resolved['baseUrl']).toBe('https://jira.example.com');
    });

    it('should fall back to schema defaults when no mapping exists', async () => {
      const { pathExistsSync } = await import('../../shared/fs-helpers.js');
      vi.mocked(pathExistsSync).mockReturnValue(false);

      const { resolveExtensionConfig } = await import('./config-manager.js');
      const schema = {
        timeout: {
          type: 'number' as const,
          description: 'Timeout',
          secret: false,
          default: 30,
        },
      };
      const resolved = resolveExtensionConfig('jira', schema);

      expect(resolved['timeout']).toBe(30);
    });

    it('should return undefined for unmapped fields without defaults', async () => {
      const { pathExistsSync } = await import('../../shared/fs-helpers.js');
      vi.mocked(pathExistsSync).mockReturnValue(false);

      const { resolveExtensionConfig } = await import('./config-manager.js');
      const schema = {
        optional: { type: 'string' as const, description: 'Optional', secret: false },
      };
      const resolved = resolveExtensionConfig('jira', schema);

      expect(resolved['optional']).toBeUndefined();
    });

    it('should use project override when available', async () => {
      const { pathExistsSync, readJsonSync } =
        await import('../../shared/fs-helpers.js');
      vi.mocked(pathExistsSync).mockReturnValue(true);
      vi.mocked(readJsonSync).mockImplementation((filePath: string) => {
        if (filePath === '/tmp/test-config.json') {
          return {
            registries: [],
            settings: {},
            extensionConfigs: {
              jira: { baseUrl: { source: 'direct', value: 'https://global.jira.com' } },
            },
          };
        }
        // project manifest with config overrides
        return {
          name: 'test-project',
          version: '1.0.0',
          created_at: '2026-01-01',
          extensionConfigs: {
            jira: { baseUrl: { source: 'direct', value: 'https://project.jira.com' } },
          },
        };
      });

      const { resolveExtensionConfig } = await import('./config-manager.js');
      const schema = {
        baseUrl: { type: 'string' as const, description: 'Base URL', secret: false },
      };
      const resolved = resolveExtensionConfig('jira', schema, '/tmp/project');

      expect(resolved['baseUrl']).toBe('https://project.jira.com');
    });
  });

  describe('getReferencingExtensions', () => {
    it('should return extensions that reference a vault key', async () => {
      const { pathExistsSync, readJsonSync } =
        await import('../../shared/fs-helpers.js');
      vi.mocked(pathExistsSync).mockReturnValue(true);
      vi.mocked(readJsonSync).mockReturnValue({
        registries: [],
        settings: {},
        extensionConfigs: {
          jira: { apiToken: { source: 'vault', value: 'shared_token' } },
          github: { token: { source: 'vault', value: 'shared_token' } },
          slack: { webhook: { source: 'direct', value: 'https://hooks.slack.com' } },
        },
      });

      const { getReferencingExtensions } = await import('./config-manager.js');
      const refs = getReferencingExtensions('shared_token');

      expect(refs).toEqual(['jira', 'github']);
    });

    it('should return empty array when no extensions reference key', async () => {
      const { pathExistsSync, readJsonSync } =
        await import('../../shared/fs-helpers.js');
      vi.mocked(pathExistsSync).mockReturnValue(true);
      vi.mocked(readJsonSync).mockReturnValue({
        registries: [],
        settings: {},
        extensionConfigs: {},
      });

      const { getReferencingExtensions } = await import('./config-manager.js');
      expect(getReferencingExtensions('unused')).toEqual([]);
    });
  });

  describe('getExtensionConfigMappings', () => {
    it('should return mappings for a specific extension', async () => {
      const { pathExistsSync, readJsonSync } =
        await import('../../shared/fs-helpers.js');
      vi.mocked(pathExistsSync).mockReturnValue(true);
      vi.mocked(readJsonSync).mockReturnValue({
        registries: [],
        settings: {},
        extensionConfigs: {
          jira: {
            apiToken: { source: 'vault', value: 'jira_token' },
            baseUrl: { source: 'direct', value: 'https://jira.com' },
          },
        },
      });

      const { getExtensionConfigMappings } = await import('./config-manager.js');
      const mappings = getExtensionConfigMappings('jira');

      expect(mappings).toEqual({
        apiToken: { source: 'vault', value: 'jira_token' },
        baseUrl: { source: 'direct', value: 'https://jira.com' },
      });
    });

    it('should return empty object for unconfigured extension', async () => {
      const { pathExistsSync } = await import('../../shared/fs-helpers.js');
      vi.mocked(pathExistsSync).mockReturnValue(false);

      const { getExtensionConfigMappings } = await import('./config-manager.js');
      expect(getExtensionConfigMappings('unknown')).toEqual({});
    });
  });
});
