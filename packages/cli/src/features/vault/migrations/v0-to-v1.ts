import type { SchemaMigration } from '../../../shared/schema-migration.js';

export const vaultV0toV1: SchemaMigration = {
  fromVersion: 0,
  toVersion: 1,
  migrate: (data) => {
    // v0 format: flat Record<string, VaultEntry> (no schemaVersion key)
    // v1 format: { schemaVersion: 1, entries: Record<string, VaultEntry> }
    const entries = { ...data };
    delete entries['schemaVersion'];
    return {
      schemaVersion: 1,
      entries,
    };
  },
};
