import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { initDatabase, getDb, closeDatabase } from './database.js';
import type Database from 'better-sqlite3';

describe('database', () => {
  let tmpDir: string;
  let db: Database.Database;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'renre-kit-db-test-'));
    db = initDatabase(tmpDir);
  });

  afterEach(() => {
    closeDatabase();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should create db.sqlite in the given directory', () => {
    expect(fs.existsSync(path.join(tmpDir, 'db.sqlite'))).toBe(true);
  });

  it('should return the same instance via getDb', () => {
    expect(getDb()).toBe(db);
  });

  it('should create _migrations table', () => {
    const row = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='_migrations'",
      )
      .get() as { name: string } | undefined;
    expect(row?.name).toBe('_migrations');
  });

  it('should create projects table', () => {
    const row = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='projects'",
      )
      .get() as { name: string } | undefined;
    expect(row?.name).toBe('projects');
  });

  it('should create installed_extensions table', () => {
    const row = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='installed_extensions'",
      )
      .get() as { name: string } | undefined;
    expect(row?.name).toBe('installed_extensions');
  });

  it('should create scheduled_tasks table', () => {
    const row = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='scheduled_tasks'",
      )
      .get() as { name: string } | undefined;
    expect(row?.name).toBe('scheduled_tasks');
  });

  it('should create task_history table', () => {
    const row = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='task_history'",
      )
      .get() as { name: string } | undefined;
    expect(row?.name).toBe('task_history');
  });

  it('should track migration in _migrations table', () => {
    const rows = db.prepare('SELECT * FROM _migrations').all() as Array<{
      name: string;
    }>;
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows[0]?.name).toBe('001-initial-schema.sql');
  });

  it('should not re-run migrations on second init', () => {
    closeDatabase();
    const db2 = initDatabase(tmpDir);
    const rows = db2.prepare('SELECT * FROM _migrations').all();
    expect(rows.length).toBe(1);
  });

  it('should allow inserting into projects table', () => {
    db.prepare(
      'INSERT INTO projects (name, path, created_at, last_accessed_at) VALUES (?, ?, ?, ?)',
    ).run('test', '/tmp/test', '2024-01-01', '2024-01-01');
    const row = db.prepare('SELECT * FROM projects WHERE name = ?').get('test') as {
      name: string;
      path: string;
    };
    expect(row.name).toBe('test');
    expect(row.path).toBe('/tmp/test');
  });

  it('should enforce unique path constraint on projects', () => {
    db.prepare(
      'INSERT INTO projects (name, path, created_at, last_accessed_at) VALUES (?, ?, ?, ?)',
    ).run('test1', '/tmp/test', '2024-01-01', '2024-01-01');
    expect(() =>
      db
        .prepare(
          'INSERT INTO projects (name, path, created_at, last_accessed_at) VALUES (?, ?, ?, ?)',
        )
        .run('test2', '/tmp/test', '2024-01-01', '2024-01-01'),
    ).toThrow();
  });

  it('should enforce composite primary key on installed_extensions', () => {
    db.prepare(
      'INSERT INTO installed_extensions (name, version, registry_source, installed_at, type) VALUES (?, ?, ?, ?, ?)',
    ).run('ext-a', '1.0.0', 'default', '2024-01-01', 'standard');
    expect(() =>
      db
        .prepare(
          'INSERT INTO installed_extensions (name, version, registry_source, installed_at, type) VALUES (?, ?, ?, ?, ?)',
        )
        .run('ext-a', '1.0.0', 'default', '2024-01-01', 'standard'),
    ).toThrow();
  });

  it('should cascade delete task_history when scheduled_task is deleted', () => {
    db.prepare(
      'INSERT INTO scheduled_tasks (id, extension_name, project_path, cron, command, next_run_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ).run('task-1', 'ext-a', '/tmp', '* * * * *', 'run', '2024-01-01', '2024-01-01');
    db.prepare(
      'INSERT INTO task_history (task_id, started_at, status) VALUES (?, ?, ?)',
    ).run('task-1', '2024-01-01', 'success');

    db.prepare('DELETE FROM scheduled_tasks WHERE id = ?').run('task-1');
    const rows = db
      .prepare('SELECT * FROM task_history WHERE task_id = ?')
      .all('task-1');
    expect(rows.length).toBe(0);
  });

  it('should throw if getDb is called before init', () => {
    closeDatabase();
    expect(() => getDb()).toThrow('Database not initialized');
  });
});
