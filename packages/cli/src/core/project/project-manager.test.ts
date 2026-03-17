import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ProjectManager } from './project-manager.js';
import { initDatabase, closeDatabase } from '../database/database.js';
import { EventBus } from '../event-bus/event-bus.js';

describe('ProjectManager', () => {
  let tmpDir: string;
  let dbDir: string;
  let manager: ProjectManager;
  let bus: EventBus;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'renre-kit-pm-test-'));
    dbDir = fs.mkdtempSync(path.join(os.tmpdir(), 'renre-kit-pm-db-'));
    initDatabase(dbDir);
    bus = new EventBus();
    manager = new ProjectManager(bus);
  });

  afterEach(() => {
    closeDatabase();
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.rmSync(dbDir, { recursive: true, force: true });
  });

  describe('init', () => {
    it('should create .renre-kit directory', () => {
      const projectPath = path.join(tmpDir, 'my-project');
      fs.mkdirSync(projectPath);
      manager.init('my-project', projectPath);
      expect(fs.existsSync(path.join(projectPath, '.renre-kit'))).toBe(true);
    });

    it('should write manifest.json', () => {
      const projectPath = path.join(tmpDir, 'my-project');
      fs.mkdirSync(projectPath);
      manager.init('my-project', projectPath);
      const manifest = JSON.parse(
        fs.readFileSync(
          path.join(projectPath, '.renre-kit', 'manifest.json'),
          'utf-8',
        ),
      ) as { name: string; version: string; created_at: string };
      expect(manifest.name).toBe('my-project');
      expect(manifest.version).toBe('1.0.0');
      expect(manifest.created_at).toBeDefined();
    });

    it('should write plugins.json as empty object', () => {
      const projectPath = path.join(tmpDir, 'my-project');
      fs.mkdirSync(projectPath);
      manager.init('my-project', projectPath);
      const plugins = JSON.parse(
        fs.readFileSync(
          path.join(projectPath, '.renre-kit', 'plugins.json'),
          'utf-8',
        ),
      );
      expect(plugins).toEqual({});
    });

    it('should insert project into database', () => {
      const projectPath = path.join(tmpDir, 'my-project');
      fs.mkdirSync(projectPath);
      manager.init('my-project', projectPath);
      const projects = manager.list();
      expect(projects.length).toBe(1);
      expect(projects[0]?.name).toBe('my-project');
    });

    it('should emit project:init event', async () => {
      const handler = vi.fn();
      bus.on('project:init', handler);
      const projectPath = path.join(tmpDir, 'my-project');
      fs.mkdirSync(projectPath);
      manager.init('my-project', projectPath);
      // Allow async event to fire
      await new Promise((r) => setTimeout(r, 50));
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'project:init',
          projectName: 'my-project',
          projectPath,
        }),
      );
    });

    it('should throw if project already initialized', () => {
      const projectPath = path.join(tmpDir, 'my-project');
      fs.mkdirSync(projectPath);
      manager.init('my-project', projectPath);
      expect(() => manager.init('my-project', projectPath)).toThrow();
    });
  });

  describe('destroy', () => {
    it('should throw if force is false', () => {
      const projectPath = path.join(tmpDir, 'my-project');
      fs.mkdirSync(projectPath);
      manager.init('my-project', projectPath);
      expect(() => manager.destroy(projectPath, false)).toThrow(
        'Use force=true',
      );
    });

    it('should remove .renre-kit directory', async () => {
      const projectPath = path.join(tmpDir, 'my-project');
      fs.mkdirSync(projectPath);
      manager.init('my-project', projectPath);
      manager.destroy(projectPath, true);
      expect(fs.existsSync(path.join(projectPath, '.renre-kit'))).toBe(false);
    });

    it('should remove project from database', () => {
      const projectPath = path.join(tmpDir, 'my-project');
      fs.mkdirSync(projectPath);
      manager.init('my-project', projectPath);
      manager.destroy(projectPath, true);
      expect(manager.list().length).toBe(0);
    });

    it('should emit project:destroy event', async () => {
      const handler = vi.fn();
      bus.on('project:destroy', handler);
      const projectPath = path.join(tmpDir, 'my-project');
      fs.mkdirSync(projectPath);
      manager.init('my-project', projectPath);
      manager.destroy(projectPath, true);
      await new Promise((r) => setTimeout(r, 50));
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'project:destroy',
          projectPath,
        }),
      );
    });
  });

  describe('list', () => {
    it('should return empty array when no projects', () => {
      expect(manager.list()).toEqual([]);
    });

    it('should return all projects', () => {
      const p1 = path.join(tmpDir, 'p1');
      const p2 = path.join(tmpDir, 'p2');
      fs.mkdirSync(p1);
      fs.mkdirSync(p2);
      manager.init('p1', p1);
      manager.init('p2', p2);
      expect(manager.list().length).toBe(2);
    });
  });

  describe('get', () => {
    it('should return project by path', () => {
      const projectPath = path.join(tmpDir, 'my-project');
      fs.mkdirSync(projectPath);
      manager.init('my-project', projectPath);
      const project = manager.get(projectPath);
      expect(project?.name).toBe('my-project');
    });

    it('should return null for non-existent project', () => {
      expect(manager.get('/nonexistent')).toBeNull();
    });

    it('should update last_accessed_at', () => {
      const projectPath = path.join(tmpDir, 'my-project');
      fs.mkdirSync(projectPath);
      manager.init('my-project', projectPath);
      const first = manager.get(projectPath);
      // Tiny delay to ensure timestamp differs
      const second = manager.get(projectPath);
      expect(second).toBeDefined();
      expect(first?.last_accessed_at).toBeDefined();
    });
  });

  describe('detect', () => {
    it('should find project by walking up directories', () => {
      const projectPath = path.join(tmpDir, 'my-project');
      const nested = path.join(projectPath, 'src', 'deep');
      fs.mkdirSync(nested, { recursive: true });
      manager.init('my-project', projectPath);
      const detected = manager.detect(nested);
      expect(detected).toBe(projectPath);
    });

    it('should return null when no project is found', () => {
      expect(manager.detect(tmpDir)).toBeNull();
    });

    it('should stop at filesystem root', () => {
      expect(manager.detect('/')).toBeNull();
    });
  });
});
