import { copyFileSync, writeFileSync } from 'node:fs';

export interface SchemaMigration {
  fromVersion: number;
  toVersion: number;
  migrate: (data: Record<string, unknown>) => Record<string, unknown>;
}

export function getSchemaVersion(data: Record<string, unknown>): number {
  if (typeof data['schemaVersion'] === 'number') {
    return data['schemaVersion'];
  }
  return 0;
}

export function migrateFile(
  filePath: string,
  data: Record<string, unknown>,
  migrations: SchemaMigration[],
): Record<string, unknown> {
  let version = getSchemaVersion(data);
  const sorted = [...migrations].sort((a, b) => a.fromVersion - b.fromVersion);

  // Find applicable migrations starting from current version
  const applicable = sorted.filter((m) => m.fromVersion >= version);
  if (applicable.length === 0) return data;

  // Validate sequential chain: each migration must start where the previous ended
  for (const migration of applicable) {
    if (migration.fromVersion !== version) {
      throw new Error(
        `Migration gap: expected migration from version ${version}, but next available is from ${migration.fromVersion}`,
      );
    }
    version = migration.toVersion;
  }

  // Backup before migrating
  const backupPath = `${filePath}.bak`;
  try {
    copyFileSync(filePath, backupPath);
  } catch {
    // Backup failure should not block migration (file may not exist yet)
  }

  let migrated = data;
  for (const migration of applicable) {
    migrated = migration.migrate(migrated);
  }

  writeFileSync(filePath, JSON.stringify(migrated, null, 2));
  return migrated;
}
