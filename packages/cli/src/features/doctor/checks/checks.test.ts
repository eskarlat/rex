import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return {
    ...actual,
    existsSync: vi.fn().mockReturnValue(false),
    accessSync: vi.fn(),
    readFileSync: vi.fn().mockReturnValue('{}'),
    statSync: vi.fn().mockReturnValue({ mode: 0o100600 }),
    readdirSync: vi.fn().mockReturnValue([]),
  };
});

vi.mock('../../../core/paths/paths.js', () => ({
  GLOBAL_DIR: '/mock/global',
  DB_PATH: '/mock/global/db.sqlite',
  EXTENSIONS_DIR: '/mock/global/extensions',
  CONFIG_PATH: '/mock/global/config.json',
  VAULT_PATH: '/mock/global/vault.json',
  getExtensionDir: vi.fn().mockImplementation(
    (name: string, version: string) => `/mock/extensions/${name}@${version}`,
  ),
}));

vi.mock('../../../core/database/database.js', () => ({
  findMigrationsDir: vi.fn().mockReturnValue('/mock/migrations'),
  initDatabase: vi.fn().mockReturnValue({
    prepare: vi.fn().mockReturnValue({ all: vi.fn().mockReturnValue([]) }),
  }),
  closeDatabase: vi.fn(),
}));

vi.mock('better-sqlite3', () => ({
  default: vi.fn().mockImplementation(() => ({
    close: vi.fn(),
    prepare: vi.fn().mockReturnValue({ all: vi.fn().mockReturnValue([]) }),
  })),
}));

vi.mock('../../extensions/manager/extension-manager.js', () => ({
  listInstalled: vi.fn().mockReturnValue([]),
}));

vi.mock('../../extensions/manifest/manifest-loader.js', () => ({
  loadManifest: vi.fn().mockReturnValue({
    name: 'test',
    version: '1.0.0',
    type: 'standard',
    commands: {},
    engines: { 'renre-kit': '>=0.0.1', 'extension-sdk': '>=0.0.1' },
  }),
}));

vi.mock('../../extensions/engine/engine-compat.js', () => ({
  checkEngineCompat: vi.fn().mockReturnValue({ compatible: true, issues: [] }),
}));

vi.mock('../../config/config-manager.js', () => ({
  loadGlobalConfig: vi.fn().mockReturnValue({
    schemaVersion: 1,
    registries: [{ name: 'default', url: 'https://example.com', priority: 0, cacheTTL: 3600 }],
    settings: {},
    extensionConfigs: {},
  }),
}));

vi.mock('../../../shared/schema-migration.js', () => ({
  getSchemaVersion: vi.fn().mockReturnValue(1),
}));

vi.mock('../../config/migrations/index.js', () => ({
  configMigrations: [{ fromVersion: 0, toVersion: 1, migrate: (d: unknown) => d }],
}));

vi.mock('../../vault/migrations/index.js', () => ({
  vaultMigrations: [{ fromVersion: 0, toVersion: 1, migrate: (d: unknown) => d }],
}));

import { existsSync, accessSync, readFileSync, statSync, readdirSync } from 'node:fs';
import BetterSqlite3 from 'better-sqlite3';
import { nodeVersionCheck } from './node-version.js';
import { globalDirectoryCheck } from './global-directory.js';
import { databaseCheck } from './database.js';
import { schemaStatusCheck } from './schema-status.js';
import { configValidCheck } from './config-valid.js';
import { vaultValidCheck } from './vault-valid.js';
import { vaultKeyCheck } from './vault-key.js';
import { extensionManifestsCheck } from './extension-manifests.js';
import { createEngineConstraintsCheck } from './engine-constraints.js';
import { registryReachabilityCheck } from './registry-reachability.js';
import { checkEngineCompat } from '../../extensions/engine/engine-compat.js';
import { getSchemaVersion } from '../../../shared/schema-migration.js';
import { listInstalled } from '../../extensions/manager/extension-manager.js';
import { loadManifest } from '../../extensions/manifest/manifest-loader.js';
import { getAllChecks } from './index.js';

describe('doctor checks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(getSchemaVersion).mockReturnValue(1);
    vi.mocked(checkEngineCompat).mockReturnValue({ compatible: true, issues: [] });
    vi.mocked(loadManifest).mockReturnValue({
      name: 'test', version: '1.0.0', type: 'standard', commands: {},
      engines: { 'renre-kit': '>=0.0.1', 'extension-sdk': '>=0.0.1' },
    });
    vi.mocked(listInstalled).mockReturnValue([]);
    vi.mocked(BetterSqlite3).mockImplementation(() => ({
      close: vi.fn(),
      prepare: vi.fn().mockReturnValue({ all: vi.fn().mockReturnValue([]) }),
    }) as unknown as ReturnType<typeof BetterSqlite3>);
  });

  describe('nodeVersionCheck', () => {
    it('passes on current node version', () => {
      const result = nodeVersionCheck.run();
      expect(result.status).toBe('pass');
      expect(result.message).toContain('v');
    });
  });

  describe('globalDirectoryCheck', () => {
    it('fails when directory does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);
      const result = globalDirectoryCheck.run();
      expect(result.status).toBe('fail');
      expect(result.message).toContain('does not exist');
    });

    it('passes when directory exists and is writable', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(accessSync).mockReturnValue(undefined);
      const result = globalDirectoryCheck.run();
      expect(result.status).toBe('pass');
    });

    it('fails when directory is not writable', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(accessSync).mockImplementation(() => {
        throw new Error('EACCES');
      });
      const result = globalDirectoryCheck.run();
      expect(result.status).toBe('fail');
      expect(result.message).toContain('not writable');
    });
  });

  describe('databaseCheck', () => {
    it('fails when db.sqlite does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);
      const result = databaseCheck.run();
      expect(result.status).toBe('fail');
      expect(result.message).toContain('not found');
    });

    it('passes when database opens', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      const result = databaseCheck.run();
      expect(result.status).toBe('pass');
    });

    it('fails when database cannot be opened', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(BetterSqlite3).mockImplementation(() => {
        throw new Error('Corrupt database');
      });
      const result = databaseCheck.run();
      expect(result.status).toBe('fail');
      expect(result.message).toContain('cannot open');
      expect(result.detail).toContain('Corrupt database');
    });

    it('handles non-Error thrown from database open', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(BetterSqlite3).mockImplementation(() => {
        throw 'string error';
      });
      const result = databaseCheck.run();
      expect(result.status).toBe('fail');
    });
  });

  describe('schemaStatusCheck', () => {
    it('fails when database does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);
      const result = schemaStatusCheck.run();
      expect(result.status).toBe('fail');
    });

    it('passes when no pending migrations', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdirSync).mockReturnValue(['001-initial.sql'] as unknown as ReturnType<typeof readdirSync>);
      vi.mocked(BetterSqlite3).mockImplementation(() => ({
        close: vi.fn(),
        prepare: vi.fn().mockReturnValue({
          all: vi.fn().mockReturnValue([{ name: '001-initial.sql' }]),
        }),
      }) as unknown as ReturnType<typeof BetterSqlite3>);

      const result = schemaStatusCheck.run();
      expect(result.status).toBe('pass');
      expect(result.message).toContain('up-to-date');
    });

    it('warns when pending migrations exist', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdirSync).mockReturnValue(['001-initial.sql', '002-add-col.sql'] as unknown as ReturnType<typeof readdirSync>);
      vi.mocked(BetterSqlite3).mockImplementation(() => ({
        close: vi.fn(),
        prepare: vi.fn().mockReturnValue({
          all: vi.fn().mockReturnValue([{ name: '001-initial.sql' }]),
        }),
      }) as unknown as ReturnType<typeof BetterSqlite3>);

      const result = schemaStatusCheck.run();
      expect(result.status).toBe('warn');
      expect(result.message).toContain('1 pending');
    });

    it('fails when database throws during migration check', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(BetterSqlite3).mockImplementation(() => {
        throw new Error('Database locked');
      });

      const result = schemaStatusCheck.run();
      expect(result.status).toBe('fail');
      expect(result.message).toContain('cannot read migration state');
    });
  });

  describe('configValidCheck', () => {
    it('warns when config file is missing', () => {
      vi.mocked(existsSync).mockReturnValue(false);
      const result = configValidCheck.run();
      expect(result.status).toBe('warn');
      expect(result.message).toContain('missing');
    });

    it('passes when config is valid JSON', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ schemaVersion: 1 }));
      const result = configValidCheck.run();
      expect(result.status).toBe('pass');
    });

    it('fails when config has invalid JSON', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('{ bad json');
      const result = configValidCheck.run();
      expect(result.status).toBe('fail');
      expect(result.message).toContain('invalid JSON');
    });

    it('fails when config schemaVersion is too new', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ schemaVersion: 999 }));
      vi.mocked(getSchemaVersion).mockReturnValue(999);
      const result = configValidCheck.run();
      expect(result.status).toBe('fail');
      expect(result.message).toContain('newer');
    });

    it('passes with version 0 and shows current version', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ registries: [] }));
      vi.mocked(getSchemaVersion).mockReturnValue(0);
      const result = configValidCheck.run();
      expect(result.status).toBe('pass');
      expect(result.message).toContain('schemaVersion');
    });
  });

  describe('vaultValidCheck', () => {
    it('warns when vault file is missing', () => {
      vi.mocked(existsSync).mockReturnValue(false);
      const result = vaultValidCheck.run();
      expect(result.status).toBe('warn');
      expect(result.message).toContain('missing');
    });

    it('passes when vault is valid JSON', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ schemaVersion: 1, entries: {} }));
      const result = vaultValidCheck.run();
      expect(result.status).toBe('pass');
    });

    it('fails when vault has invalid JSON', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('not json');
      const result = vaultValidCheck.run();
      expect(result.status).toBe('fail');
    });

    it('fails when vault schemaVersion is too new', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ schemaVersion: 999, entries: {} }));
      vi.mocked(getSchemaVersion).mockReturnValue(999);
      const result = vaultValidCheck.run();
      expect(result.status).toBe('fail');
      expect(result.message).toContain('newer');
    });
  });

  describe('vaultKeyCheck', () => {
    it('fails when key file does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);
      const result = vaultKeyCheck.run();
      expect(result.status).toBe('fail');
      expect(result.message).toContain('not found');
    });

    it('passes when key file exists with 0o600 permissions', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(statSync).mockReturnValue({ mode: 0o100600 } as ReturnType<typeof statSync>);
      const result = vaultKeyCheck.run();
      expect(result.status).toBe('pass');
    });

    it('fails when key file has wrong permissions', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(statSync).mockReturnValue({ mode: 0o100644 } as ReturnType<typeof statSync>);
      const result = vaultKeyCheck.run();
      expect(result.status).toBe('fail');
      expect(result.message).toContain('644');
      expect(result.detail).toContain('chmod');
    });

    it('fails when statSync throws', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(statSync).mockImplementation(() => { throw new Error('EACCES'); });
      const result = vaultKeyCheck.run();
      expect(result.status).toBe('fail');
      expect(result.message).toContain('cannot stat');
    });
  });

  describe('extensionManifestsCheck', () => {
    it('passes when no database exists', () => {
      vi.mocked(existsSync).mockReturnValue(false);
      const result = extensionManifestsCheck.run();
      expect(result.status).toBe('pass');
    });

    it('passes when no extensions installed', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(listInstalled).mockReturnValue([]);
      const result = extensionManifestsCheck.run();
      expect(result.status).toBe('pass');
      expect(result.message).toContain('no extensions');
    });

    it('passes when all manifests are valid', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(listInstalled).mockReturnValue([
        { name: 'ext-a', version: '1.0.0', registry_source: 'default', installed_at: '', type: 'standard' },
      ]);
      const result = extensionManifestsCheck.run();
      expect(result.status).toBe('pass');
      expect(result.message).toContain('1 extension');
    });

    it('fails when a manifest is invalid', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(listInstalled).mockReturnValue([
        { name: 'bad-ext', version: '1.0.0', registry_source: 'default', installed_at: '', type: 'standard' },
      ]);
      vi.mocked(loadManifest).mockImplementation(() => {
        throw new Error('Invalid manifest');
      });
      const result = extensionManifestsCheck.run();
      expect(result.status).toBe('fail');
      expect(result.message).toContain('1 manifest error');
    });

    it('fails when database open throws', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      const BetterSqlite3 = (await import('better-sqlite3')).default;
      vi.mocked(BetterSqlite3).mockImplementation(() => { throw new Error('DB error'); });
      const result = extensionManifestsCheck.run();
      expect(result.status).toBe('fail');
      expect(result.message).toContain('cannot check');
    });
  });

  describe('getAllChecks', () => {
    it('returns 10 checks', () => {
      const checks = getAllChecks(null, () => ({}));
      expect(checks).toHaveLength(10);
    });

    it('returns checks with project context', () => {
      const checks = getAllChecks('/tmp/project', () => ({}));
      expect(checks).toHaveLength(10);
    });
  });

  describe('engineConstraintsCheck', () => {
    it('skips when not in project', () => {
      const check = createEngineConstraintsCheck(null, () => ({}));
      const result = check.run();
      expect(result.status).toBe('pass');
      expect(result.message).toContain('skipped');
    });

    it('passes with no activated extensions', () => {
      const check = createEngineConstraintsCheck('/tmp/project', () => ({}));
      const result = check.run();
      expect(result.status).toBe('pass');
    });

    it('passes when all engines are compatible', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      const check = createEngineConstraintsCheck('/tmp/project', () => ({ 'test-ext': '1.0.0' }));
      const result = check.run();
      expect(result.status).toBe('pass');
    });

    it('fails when engine constraints not met', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(checkEngineCompat).mockReturnValue({
        compatible: false,
        issues: ['Requires renre-kit >=99.0.0'],
      });
      const check = createEngineConstraintsCheck('/tmp/project', () => ({ 'test-ext': '1.0.0' }));
      const result = check.run();
      expect(result.status).toBe('fail');
      expect(result.detail).toContain('renre-kit');
    });

    it('skips extension when loadManifest throws', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(loadManifest).mockImplementation(() => {
        throw new Error('bad manifest');
      });
      const check = createEngineConstraintsCheck('/tmp/project', () => ({ 'broken-ext': '1.0.0' }));
      const result = check.run();
      // Should pass because broken manifest errors are handled by check #8
      expect(result.status).toBe('pass');
    });

    it('skips extension when directory does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);
      const check = createEngineConstraintsCheck('/tmp/project', () => ({ 'missing-ext': '1.0.0' }));
      const result = check.run();
      expect(result.status).toBe('pass');
    });
  });

  describe('registryReachabilityCheck', () => {
    it('reports all registries unreachable when fetch fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
      const result = await registryReachabilityCheck.run();
      expect(result.status).toBe('fail');
      expect(result.message).toContain('unreachable');
      vi.unstubAllGlobals();
    });

    it('passes when registry responds', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
      const result = await registryReachabilityCheck.run();
      expect(result.status).toBe('pass');
      vi.unstubAllGlobals();
    });

    it('warns when no registries configured', async () => {
      const { loadGlobalConfig } = await import('../../config/config-manager.js');
      vi.mocked(loadGlobalConfig).mockReturnValue({
        schemaVersion: 1,
        registries: [],
        settings: {},
        extensionConfigs: {},
      });
      const result = await registryReachabilityCheck.run();
      expect(result.status).toBe('warn');
      expect(result.message).toContain('no registries');
    });
  });
});
