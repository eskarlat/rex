import type { SchemaMigration } from '../../../shared/schema-migration.js';

export const configV0toV1: SchemaMigration = {
  fromVersion: 0,
  toVersion: 1,
  migrate: (data) => ({
    ...data,
    schemaVersion: 1,
  }),
};
