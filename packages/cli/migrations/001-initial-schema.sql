CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  path TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL,
  last_accessed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS installed_extensions (
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  registry_source TEXT,
  installed_at TEXT NOT NULL,
  type TEXT NOT NULL,
  PRIMARY KEY (name, version)
);

CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'manual',
  project_path TEXT,
  cron TEXT NOT NULL,
  command TEXT NOT NULL,
  enabled INTEGER DEFAULT 1,
  last_run_at TEXT,
  last_status TEXT,
  next_run_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS task_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  duration_ms INTEGER,
  status TEXT NOT NULL,
  output TEXT,
  FOREIGN KEY (task_id) REFERENCES scheduled_tasks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_task_history_task_id ON task_history(task_id);
