import BetterSqlite3 from 'better-sqlite3';
import type Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

let db: Database.Database | null = null;

export function initDatabase(baseDir: string): Database.Database {
  fs.mkdirSync(baseDir, { recursive: true });
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

  runMigrations(db);
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

function runMigrations(database: Database.Database): void {
  const migrationsDir = path.resolve(
    import.meta.dirname,
    '..',
    '..',
    '..',
    'migrations',
  );

  let files: string[];
  try {
    files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return;
  }

  const applied = new Set(
    (
      database.prepare('SELECT name FROM _migrations').all() as Array<{
        name: string;
      }>
    ).map((r) => r.name),
  );

  for (const file of files) {
    if (applied.has(file)) {
      continue;
    }
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    database.exec(sql);
    database
      .prepare('INSERT INTO _migrations (name, applied_at) VALUES (?, ?)')
      .run(file, new Date().toISOString());
  }
}
