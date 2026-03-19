import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getSchemaVersion, migrateFile } from './schema-migration.js';
import type { SchemaMigration } from './schema-migration.js';

describe('schema-migration', () => {
  describe('getSchemaVersion', () => {
    it('should return 0 when schemaVersion is missing', () => {
      expect(getSchemaVersion({ key: 'value' })).toBe(0);
    });

    it('should return the schemaVersion when present', () => {
      expect(getSchemaVersion({ schemaVersion: 2, key: 'value' })).toBe(2);
    });

    it('should return 0 when schemaVersion is not a number', () => {
      expect(getSchemaVersion({ schemaVersion: 'invalid' })).toBe(0);
    });
  });

  describe('migrateFile', () => {
    let tmpDir: string;
    let filePath: string;

    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'renre-kit-schema-test-'));
      filePath = path.join(tmpDir, 'test.json');
    });

    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('should return data unchanged when no migrations apply', () => {
      const data = { schemaVersion: 1, key: 'value' };
      fs.writeFileSync(filePath, JSON.stringify(data));
      const migrations: SchemaMigration[] = [
        { fromVersion: 0, toVersion: 1, migrate: (d) => ({ ...d, schemaVersion: 1 }) },
      ];
      const result = migrateFile(filePath, data, migrations);
      expect(result).toEqual(data);
    });

    it('should apply v0 to v1 migration', () => {
      const data = { key: 'value' };
      fs.writeFileSync(filePath, JSON.stringify(data));
      const migrations: SchemaMigration[] = [
        {
          fromVersion: 0,
          toVersion: 1,
          migrate: (d) => ({ ...d, schemaVersion: 1, added: true }),
        },
      ];
      const result = migrateFile(filePath, data, migrations);
      expect(result).toEqual({ key: 'value', schemaVersion: 1, added: true });
    });

    it('should create a backup before migrating', () => {
      const data = { key: 'value' };
      fs.writeFileSync(filePath, JSON.stringify(data));
      const migrations: SchemaMigration[] = [
        { fromVersion: 0, toVersion: 1, migrate: (d) => ({ ...d, schemaVersion: 1 }) },
      ];
      migrateFile(filePath, data, migrations);
      expect(fs.existsSync(`${filePath}.bak`)).toBe(true);
    });

    it('should apply multi-step migrations in order', () => {
      const data = { key: 'value' };
      fs.writeFileSync(filePath, JSON.stringify(data));
      const migrations: SchemaMigration[] = [
        { fromVersion: 0, toVersion: 1, migrate: (d) => ({ ...d, schemaVersion: 1, step1: true }) },
        { fromVersion: 1, toVersion: 2, migrate: (d) => ({ ...d, schemaVersion: 2, step2: true }) },
      ];
      const result = migrateFile(filePath, data, migrations);
      expect(result).toEqual({ key: 'value', schemaVersion: 2, step1: true, step2: true });
    });

    it('should write migrated data back to file', () => {
      const data = { key: 'value' };
      fs.writeFileSync(filePath, JSON.stringify(data));
      const migrations: SchemaMigration[] = [
        { fromVersion: 0, toVersion: 1, migrate: (d) => ({ ...d, schemaVersion: 1 }) },
      ];
      migrateFile(filePath, data, migrations);
      const written = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Record<string, unknown>;
      expect(written['schemaVersion']).toBe(1);
    });

    it('should handle backup failure gracefully when file does not exist', () => {
      const nonExistentPath = path.join(tmpDir, 'nonexistent.json');
      const data = { key: 'value' };
      const migrations: SchemaMigration[] = [
        { fromVersion: 0, toVersion: 1, migrate: (d) => ({ ...d, schemaVersion: 1 }) },
      ];
      expect(() => migrateFile(nonExistentPath, data, migrations)).not.toThrow();
    });

    it('should throw on migration gap', () => {
      const data = { key: 'value' };
      fs.writeFileSync(filePath, JSON.stringify(data));
      const migrations: SchemaMigration[] = [
        { fromVersion: 0, toVersion: 1, migrate: (d) => ({ ...d, schemaVersion: 1 }) },
        { fromVersion: 2, toVersion: 3, migrate: (d) => ({ ...d, schemaVersion: 3 }) },
      ];
      expect(() => migrateFile(filePath, data, migrations)).toThrow('Migration gap');
    });

    it('should only apply migrations from current version forward', () => {
      const data = { schemaVersion: 1, key: 'value' };
      fs.writeFileSync(filePath, JSON.stringify(data));
      const migrations: SchemaMigration[] = [
        { fromVersion: 0, toVersion: 1, migrate: (d) => ({ ...d, schemaVersion: 1, step1: true }) },
        { fromVersion: 1, toVersion: 2, migrate: (d) => ({ ...d, schemaVersion: 2, step2: true }) },
      ];
      const result = migrateFile(filePath, data, migrations);
      expect(result).toEqual({ key: 'value', schemaVersion: 2, step2: true });
      expect(result).not.toHaveProperty('step1');
    });
  });
});
