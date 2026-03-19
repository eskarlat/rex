import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'node:crypto';

vi.mock('../../shared/fs-helpers.js', () => ({
  pathExistsSync: vi.fn(),
  readJsonSync: vi.fn(),
  writeJsonSync: vi.fn(),
  ensureDirSync: vi.fn(),
}));

vi.mock('../../shared/schema-migration.js', () => ({
  migrateFile: vi.fn((_path: string, data: Record<string, unknown>) => {
    // Simulate v0-to-v1 migration: wrap flat entries in envelope
    if (typeof data['schemaVersion'] !== 'number') {
      const { ...entries } = data;
      return { schemaVersion: 1, entries };
    }
    return data;
  }),
  getSchemaVersion: vi.fn((data: Record<string, unknown>) =>
    typeof data['schemaVersion'] === 'number' ? data['schemaVersion'] : 0,
  ),
}));

vi.mock('../../core/paths/paths.js', () => ({
  VAULT_PATH: '/tmp/test-vault.json',
  GLOBAL_DIR: '/tmp/test-global',
}));

const STABLE_KEY = crypto.randomBytes(32).toString('hex');
vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return {
    ...actual,
    default: {
      ...(actual['default'] as Record<string, unknown>),
      existsSync: vi.fn((p: string) => {
        if (String(p).endsWith('.vault-key')) return true;
        return false;
      }),
      readFileSync: vi.fn((p: string) => {
        if (String(p).endsWith('.vault-key')) return STABLE_KEY;
        throw new Error(`Unexpected read: ${p}`);
      }),
      writeFileSync: vi.fn(),
    },
  };
});

describe('vault-manager', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  describe('setEntry', () => {
    it('should store a non-secret value as plaintext', async () => {
      const { pathExistsSync, readJsonSync, writeJsonSync, ensureDirSync } =
        await import('../../shared/fs-helpers.js');
      vi.mocked(pathExistsSync).mockReturnValue(false);

      const { setEntry } = await import('./vault-manager.js');
      setEntry('api_url', 'https://example.com', false, ['http']);

      expect(ensureDirSync).toHaveBeenCalledWith('/tmp/test-global');
      expect(writeJsonSync).toHaveBeenCalledWith(
        '/tmp/test-vault.json',
        expect.objectContaining({
          schemaVersion: 1,
          entries: expect.objectContaining({
            api_url: {
              value: 'https://example.com',
              secret: false,
              tags: ['http'],
            },
          }),
        }),
      );
    });

    it('should encrypt a secret value', async () => {
      const { pathExistsSync, writeJsonSync, ensureDirSync } =
        await import('../../shared/fs-helpers.js');
      vi.mocked(pathExistsSync).mockReturnValue(false);

      const { setEntry } = await import('./vault-manager.js');
      setEntry('api_token', 'my-secret-token', true, ['jira']);

      expect(ensureDirSync).toHaveBeenCalled();
      const call = vi.mocked(writeJsonSync).mock.calls[0];
      const written = call?.[1] as { entries: Record<string, { value: string; secret: boolean; tags: string[] }> };
      const entry = written.entries['api_token'];
      expect(entry).toBeDefined();
      expect(entry?.secret).toBe(true);
      expect(entry?.tags).toEqual(['jira']);
      // Encrypted value should differ from original
      expect(entry?.value).not.toBe('my-secret-token');
      // Should be hex-encoded with IV prefix
      expect(entry?.value.length).toBeGreaterThan(0);
    });

    it('should add to existing vault entries', async () => {
      const { pathExistsSync, readJsonSync, writeJsonSync } =
        await import('../../shared/fs-helpers.js');
      vi.mocked(pathExistsSync).mockReturnValue(true);
      vi.mocked(readJsonSync).mockReturnValue({
        schemaVersion: 1,
        entries: {
          existing_key: { value: 'existing', secret: false, tags: [] },
        },
      });

      const { setEntry } = await import('./vault-manager.js');
      setEntry('new_key', 'new_value', false);

      const call = vi.mocked(writeJsonSync).mock.calls[0];
      const written = call?.[1] as { entries: Record<string, unknown> };
      expect(written.entries['existing_key']).toBeDefined();
      expect(written.entries['new_key']).toBeDefined();
    });
  });

  describe('getEntry', () => {
    it('should return a non-secret entry as-is', async () => {
      const { pathExistsSync, readJsonSync } =
        await import('../../shared/fs-helpers.js');
      vi.mocked(pathExistsSync).mockReturnValue(true);
      vi.mocked(readJsonSync).mockReturnValue({
        schemaVersion: 1,
        entries: {
          api_url: { value: 'https://example.com', secret: false, tags: [] },
        },
      });

      const { getEntry } = await import('./vault-manager.js');
      const entry = getEntry('api_url');
      expect(entry).toEqual({
        value: 'https://example.com',
        secret: false,
        tags: [],
      });
    });

    it('should decrypt a secret entry', async () => {
      const { pathExistsSync, readJsonSync, writeJsonSync, ensureDirSync } =
        await import('../../shared/fs-helpers.js');

      // First, set a secret entry so we have valid encrypted data
      vi.mocked(pathExistsSync).mockReturnValue(false);
      const { setEntry, getEntry } = await import('./vault-manager.js');
      setEntry('secret_key', 'my-secret-value', true);

      // Grab what was written (now in envelope format)
      const call = vi.mocked(writeJsonSync).mock.calls[0];
      const written = call?.[1] as Record<string, unknown>;

      // Now mock reading that back
      vi.mocked(pathExistsSync).mockReturnValue(true);
      vi.mocked(readJsonSync).mockReturnValue(written);

      const entry = getEntry('secret_key');
      expect(entry).toBeDefined();
      expect(entry?.value).toBe('my-secret-value');
      expect(entry?.secret).toBe(true);
    });

    it('should return undefined for non-existent key', async () => {
      const { pathExistsSync, readJsonSync } =
        await import('../../shared/fs-helpers.js');
      vi.mocked(pathExistsSync).mockReturnValue(true);
      vi.mocked(readJsonSync).mockReturnValue({
        schemaVersion: 1,
        entries: {},
      });

      const { getEntry } = await import('./vault-manager.js');
      expect(getEntry('missing')).toBeUndefined();
    });

    it('should return undefined when vault file does not exist', async () => {
      const { pathExistsSync } = await import('../../shared/fs-helpers.js');
      vi.mocked(pathExistsSync).mockReturnValue(false);

      const { getEntry } = await import('./vault-manager.js');
      expect(getEntry('missing')).toBeUndefined();
    });
  });

  describe('removeEntry', () => {
    it('should remove an existing entry', async () => {
      const { pathExistsSync, readJsonSync, writeJsonSync } =
        await import('../../shared/fs-helpers.js');
      vi.mocked(pathExistsSync).mockReturnValue(true);
      vi.mocked(readJsonSync).mockReturnValue({
        schemaVersion: 1,
        entries: {
          to_remove: { value: 'x', secret: false, tags: [] },
          to_keep: { value: 'y', secret: false, tags: [] },
        },
      });

      const { removeEntry } = await import('./vault-manager.js');
      const removed = removeEntry('to_remove');
      expect(removed).toBe(true);

      const call = vi.mocked(writeJsonSync).mock.calls[0];
      const written = call?.[1] as { entries: Record<string, unknown> };
      expect(written.entries['to_remove']).toBeUndefined();
      expect(written.entries['to_keep']).toBeDefined();
    });

    it('should return false when key does not exist', async () => {
      const { pathExistsSync, readJsonSync } =
        await import('../../shared/fs-helpers.js');
      vi.mocked(pathExistsSync).mockReturnValue(true);
      vi.mocked(readJsonSync).mockReturnValue({
        schemaVersion: 1,
        entries: {},
      });

      const { removeEntry } = await import('./vault-manager.js');
      expect(removeEntry('missing')).toBe(false);
    });
  });

  describe('listEntries', () => {
    it('should return all entries with secrets masked', async () => {
      const { pathExistsSync, readJsonSync, writeJsonSync, ensureDirSync } =
        await import('../../shared/fs-helpers.js');

      // Create a vault with both secret and non-secret entries
      vi.mocked(pathExistsSync).mockReturnValue(false);
      const { setEntry, listEntries } = await import('./vault-manager.js');
      setEntry('url', 'https://api.com', false, ['http']);

      // After first write, mock reading back the written data (envelope format)
      const firstCall = vi.mocked(writeJsonSync).mock.calls[0];
      const firstWritten = firstCall?.[1] as Record<string, unknown>;
      vi.mocked(pathExistsSync).mockReturnValue(true);
      vi.mocked(readJsonSync).mockReturnValue(firstWritten);

      setEntry('token', 'secret123', true, ['auth']);

      // Read back the cumulative vault (envelope format)
      const lastCall = vi.mocked(writeJsonSync).mock.calls.at(-1);
      const written = lastCall?.[1] as Record<string, unknown>;
      vi.mocked(readJsonSync).mockReturnValue(written);

      const entries = listEntries();
      expect(entries).toHaveLength(2);

      const urlEntry = entries.find((e) => e.key === 'url');
      expect(urlEntry?.value).toBe('https://api.com');
      expect(urlEntry?.secret).toBe(false);

      const tokenEntry = entries.find((e) => e.key === 'token');
      expect(tokenEntry?.value).toBe('********');
      expect(tokenEntry?.secret).toBe(true);
      expect(tokenEntry?.tags).toEqual(['auth']);
    });

    it('should return empty array when vault does not exist', async () => {
      const { pathExistsSync } = await import('../../shared/fs-helpers.js');
      vi.mocked(pathExistsSync).mockReturnValue(false);

      const { listEntries } = await import('./vault-manager.js');
      expect(listEntries()).toEqual([]);
    });
  });

  describe('getDecryptedValue', () => {
    it('should return decrypted value for secret entries', async () => {
      const { pathExistsSync, readJsonSync, writeJsonSync, ensureDirSync } =
        await import('../../shared/fs-helpers.js');

      vi.mocked(pathExistsSync).mockReturnValue(false);
      const { setEntry, getDecryptedValue } = await import('./vault-manager.js');
      setEntry('token', 'my-secret', true);

      const lastCall = vi.mocked(writeJsonSync).mock.calls.at(-1);
      const written = lastCall?.[1] as Record<string, unknown>;

      vi.mocked(pathExistsSync).mockReturnValue(true);
      vi.mocked(readJsonSync).mockReturnValue(written);

      expect(getDecryptedValue('token')).toBe('my-secret');
    });

    it('should return plaintext value for non-secret entries', async () => {
      const { pathExistsSync, readJsonSync } =
        await import('../../shared/fs-helpers.js');
      vi.mocked(pathExistsSync).mockReturnValue(true);
      vi.mocked(readJsonSync).mockReturnValue({
        schemaVersion: 1,
        entries: {
          url: { value: 'https://api.com', secret: false, tags: [] },
        },
      });

      const { getDecryptedValue } = await import('./vault-manager.js');
      expect(getDecryptedValue('url')).toBe('https://api.com');
    });

    it('should return undefined for non-existent key', async () => {
      const { pathExistsSync } = await import('../../shared/fs-helpers.js');
      vi.mocked(pathExistsSync).mockReturnValue(false);

      const { getDecryptedValue } = await import('./vault-manager.js');
      expect(getDecryptedValue('missing')).toBeUndefined();
    });
  });

  describe('encryption roundtrip', () => {
    it('should correctly encrypt and decrypt various strings', async () => {
      const { pathExistsSync, readJsonSync, writeJsonSync, ensureDirSync } =
        await import('../../shared/fs-helpers.js');

      const testValues = [
        'simple',
        'with spaces and symbols!@#$%',
        'unicode: 日本語',
        '',
        'a'.repeat(1000),
      ];

      for (const val of testValues) {
        vi.mocked(pathExistsSync).mockReturnValue(false);
        vi.mocked(writeJsonSync).mockClear();

        const { setEntry, getDecryptedValue } = await import('./vault-manager.js');
        setEntry('test', val, true);

        const lastCall = vi.mocked(writeJsonSync).mock.calls.at(-1);
        const written = lastCall?.[1] as Record<string, unknown>;

        vi.mocked(pathExistsSync).mockReturnValue(true);
        vi.mocked(readJsonSync).mockReturnValue(written);

        expect(getDecryptedValue('test')).toBe(val);
        vi.resetModules();
      }
    });
  });

  describe('error handling', () => {
    it('should throw VAULT_DECRYPT_FAILED for corrupted data', async () => {
      const { pathExistsSync, readJsonSync } =
        await import('../../shared/fs-helpers.js');
      vi.mocked(pathExistsSync).mockReturnValue(true);
      vi.mocked(readJsonSync).mockReturnValue({
        schemaVersion: 1,
        entries: {
          bad_key: { value: 'not-valid-encrypted-data', secret: true, tags: [] },
        },
      });

      const { getEntry } = await import('./vault-manager.js');
      expect(() => getEntry('bad_key')).toThrow('Failed to decrypt vault entry');
    });
  });
});
