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
  const currentVersion = getSchemaVersion(data);
  const applicable = migrations
    .filter((m) => m.fromVersion >= currentVersion)
    .sort((a, b) => a.fromVersion - b.fromVersion);

  if (applicable.length === 0) return data;

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
