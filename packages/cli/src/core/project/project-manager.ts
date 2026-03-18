import fs from 'node:fs';
import path from 'node:path';
import type { ProjectRecord, ProjectManifest, PluginsJson } from '../types/index.js';
import { getDb } from '../database/database.js';
import type { EventBus } from '../event-bus/event-bus.js';
import {
  PROJECT_DIR,
  MANIFEST_JSON,
  PLUGINS_JSON,
} from '../paths/paths.js';
import { ProjectAlreadyInitializedError } from '../types/errors.types.js';

export class ProjectManager {
  private bus: EventBus;

  constructor(bus: EventBus) {
    this.bus = bus;
  }

  init(name: string, projectPath: string): ProjectRecord {
    const projectDir = path.join(projectPath, PROJECT_DIR);

    if (fs.existsSync(path.join(projectDir, MANIFEST_JSON))) {
      throw new ProjectAlreadyInitializedError(projectPath);
    }

    fs.mkdirSync(projectDir, { recursive: true });

    const now = new Date().toISOString();

    const manifest: ProjectManifest = {
      name,
      version: '1.0.0',
      created_at: now,
    };
    fs.writeFileSync(
      path.join(projectDir, MANIFEST_JSON),
      JSON.stringify(manifest, null, 2),
      'utf-8',
    );

    const plugins: PluginsJson = {};
    fs.writeFileSync(
      path.join(projectDir, PLUGINS_JSON),
      JSON.stringify(plugins, null, 2),
      'utf-8',
    );

    const db = getDb();
    const result = db
      .prepare(
        'INSERT INTO projects (name, path, created_at, last_accessed_at) VALUES (?, ?, ?, ?)',
      )
      .run(name, projectPath, now, now);

    const record: ProjectRecord = {
      id: result.lastInsertRowid as number,
      name,
      path: projectPath,
      created_at: now,
      last_accessed_at: now,
    };

    // Fire-and-forget async event
    void this.bus.emit('project:init', {
      type: 'project:init',
      projectName: name,
      projectPath,
    });

    return record;
  }

  destroy(projectPath: string, force: boolean): void {
    if (!force) {
      throw new Error('Use force=true to confirm project destruction');
    }

    void this.bus.emit('project:destroy', {
      type: 'project:destroy',
      projectPath,
    });

    const projectDir = path.join(projectPath, PROJECT_DIR);
    if (fs.existsSync(projectDir)) {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }

    const db = getDb();
    db.prepare('DELETE FROM projects WHERE path = ?').run(projectPath);
  }

  list(): ProjectRecord[] {
    const db = getDb();
    return db.prepare('SELECT * FROM projects').all() as ProjectRecord[];
  }

  get(projectPath: string): ProjectRecord | null {
    const db = getDb();
    const now = new Date().toISOString();
    db.prepare('UPDATE projects SET last_accessed_at = ? WHERE path = ?').run(
      now,
      projectPath,
    );
    const row = db
      .prepare('SELECT * FROM projects WHERE path = ?')
      .get(projectPath) as ProjectRecord | undefined;
    return row ?? null;
  }

  detect(startPath?: string): string | null {
    let current = startPath ?? process.cwd();
    const root = path.parse(current).root;

    while (current !== root) {
      const manifestPath = path.join(current, PROJECT_DIR, MANIFEST_JSON);
      if (fs.existsSync(manifestPath)) {
        return current;
      }
      const parent = path.dirname(current);
      if (parent === current) {
        break;
      }
      current = parent;
    }

    return null;
  }
}
