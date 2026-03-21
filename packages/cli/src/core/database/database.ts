import BetterSqlite3 from 'better-sqlite3';
import type Database from 'better-sqlite3';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { getLogger } from '../logger/index.js';

let db: Database.Database | null = null;

export function initDatabase(baseDir: string): Database.Database {
  mkdirSync(baseDir, { recursive: true });
  const dbPath = path.join(baseDir, 'db.sqlite');
  db = new BetterSqlite3(dbPath);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `);

  const migrationsDir = findMigrationsDir();
  runMigrations(db, migrationsDir);
  return db;
}

export function getDb(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export function findMigrationsDir(): string {
  // In source: import.meta.dirname = src/core/database → ../../../migrations
  // In bundle: import.meta.dirname = dist → ../migrations
  const fromSource = path.resolve(import.meta.dirname, '..', '..', '..', 'migrations');
  if (existsSync(fromSource)) {
    return fromSource;
  }
  return path.resolve(import.meta.dirname, '..', 'migrations');
}

function readMigrationFiles(migrationsDir: string): string[] | null {
  try {
    return readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b));
  } catch (err) {
    getLogger().warn('database', 'Failed to read migrations directory', {
      migrationsDir,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

function backupDatabase(dbPath: string, backupPath: string): void {
  if (dbPath === ':memory:' || dbPath === '') return;
  try {
    copyFileSync(dbPath, backupPath);
  } catch (err) {
    getLogger().warn('database', 'Database backup failed before migration', {
      dbPath,
      backupPath,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export function runMigrations(database: Database.Database, migrationsDir: string): void {
  const files = readMigrationFiles(migrationsDir);
  if (!files) return;

  const applied = new Set(
    (
      database.prepare('SELECT name FROM _migrations').all() as Array<{
        name: string;
      }>
    ).map((r) => r.name),
  );

  const pending = files.filter((f) => !applied.has(f));
  if (pending.length === 0) return;

  const dbPath = database.name;
  const backupPath = `${dbPath}.bak`;
  backupDatabase(dbPath, backupPath);

  for (const file of pending) {
    const sql = readFileSync(path.join(migrationsDir, file), 'utf-8');
    try {
      const migrate = database.transaction(() => {
        database.exec(sql);
        database
          .prepare('INSERT INTO _migrations (name, applied_at) VALUES (?, ?)')
          .run(file, new Date().toISOString());
      });
      migrate();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(
        `Migration "${file}" failed: ${message}. ` +
          `Database has been rolled back. ` +
          `Pre-migration backup available at: ${backupPath}`,
      );
    }
  }
}
