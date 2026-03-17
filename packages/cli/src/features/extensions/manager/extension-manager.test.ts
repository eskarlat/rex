import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import BetterSqlite3 from 'better-sqlite3';
import type Database from 'better-sqlite3';

vi.mock('../../config/config-manager.js', () => ({
  getExtensionConfigMappings: vi.fn().mockReturnValue({}),
}));
vi.mock('../../vault/vault-manager.js', () => ({
  getEntry: vi.fn().mockReturnValue(undefined),
  getDecryptedValue: vi.fn().mockReturnValue(undefined),
}));

import {
  install,
  remove,
  listInstalled,
  activate,
  deactivate,
  getActivated,
  status,
  validateVaultKeys,
} from './extension-manager.js';
import { getExtensionConfigMappings } from '../../config/config-manager.js';
import { getEntry } from '../../vault/vault-manager.js';

describe('extension-manager', () => {
  let db: Database.Database;
  let tmpDir: string;
  let projectDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'renre-extmgr-'));
    projectDir = path.join(tmpDir, 'my-project');
    fs.mkdirSync(path.join(projectDir, '.renre-kit'), { recursive: true });

    db = new BetterSqlite3(':memory:');
    db.exec(`
      CREATE TABLE IF NOT EXISTS installed_extensions (
        name TEXT NOT NULL,
        version TEXT NOT NULL,
        registry_source TEXT,
        installed_at TEXT NOT NULL DEFAULT (datetime('now')),
        type TEXT NOT NULL DEFAULT 'standard',
        PRIMARY KEY (name, version)
      );
    `);
  });

  afterEach(() => {
    db.close();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('install', () => {
    it('inserts extension into database', () => {
      install('my-ext', '1.0.0', 'default', 'standard', db);
      const rows = db.prepare('SELECT * FROM installed_extensions').all() as Array<{ name: string; version: string }>;
      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe('my-ext');
      expect(rows[0]!.version).toBe('1.0.0');
    });

    it('stores registry_source and type', () => {
      install('mcp-ext', '2.0.0', 'community', 'mcp', db);
      const row = db.prepare('SELECT * FROM installed_extensions WHERE name = ?').get('mcp-ext') as { registry_source: string; type: string };
      expect(row.registry_source).toBe('community');
      expect(row.type).toBe('mcp');
    });
  });

  describe('remove', () => {
    it('deletes extension from database', () => {
      install('my-ext', '1.0.0', 'default', 'standard', db);
      remove('my-ext', '1.0.0', db);
      const rows = db.prepare('SELECT * FROM installed_extensions').all();
      expect(rows).toHaveLength(0);
    });

    it('does not throw when removing nonexistent extension', () => {
      expect(() => remove('nonexistent', '1.0.0', db)).not.toThrow();
    });
  });

  describe('listInstalled', () => {
    it('returns empty array when no extensions installed', () => {
      expect(listInstalled(db)).toEqual([]);
    });

    it('returns all installed extensions', () => {
      install('ext-a', '1.0.0', 'default', 'standard', db);
      install('ext-b', '2.0.0', 'community', 'mcp', db);
      const result = listInstalled(db);
      expect(result).toHaveLength(2);
      expect(result.map((e) => e.name)).toContain('ext-a');
      expect(result.map((e) => e.name)).toContain('ext-b');
    });
  });

  describe('activate', () => {
    it('adds extension to plugins.json', async () => {
      const extDir = path.join(tmpDir, 'ext-a@1.0.0');
      fs.mkdirSync(extDir, { recursive: true });
      fs.writeFileSync(
        path.join(extDir, 'manifest.json'),
        JSON.stringify({
          name: 'ext-a',
          version: '1.0.0',
          description: 'Test',
          type: 'standard',
          commands: {},
        }),
      );

      await activate('ext-a', '1.0.0', projectDir, extDir);

      const pluginsPath = path.join(projectDir, '.renre-kit', 'plugins.json');
      const plugins = JSON.parse(fs.readFileSync(pluginsPath, 'utf-8'));
      expect(plugins['ext-a']).toBe('1.0.0');
    });

    it('creates .renre-kit dir if it does not exist', async () => {
      const freshProject = path.join(tmpDir, 'fresh-project');
      fs.mkdirSync(freshProject, { recursive: true });
      // No .renre-kit dir

      const extDir = path.join(tmpDir, 'ext-fresh@1.0.0');
      fs.mkdirSync(extDir, { recursive: true });
      fs.writeFileSync(
        path.join(extDir, 'manifest.json'),
        JSON.stringify({
          name: 'ext-fresh',
          version: '1.0.0',
          description: 'Test',
          type: 'standard',
          commands: {},
        }),
      );

      await activate('ext-fresh', '1.0.0', freshProject, extDir);

      const pluginsPath = path.join(freshProject, '.renre-kit', 'plugins.json');
      expect(fs.existsSync(pluginsPath)).toBe(true);
    });

    it('handles non-existent hook file gracefully', async () => {
      const extDir = path.join(tmpDir, 'ext-nohook@1.0.0');
      fs.mkdirSync(extDir, { recursive: true });
      fs.writeFileSync(
        path.join(extDir, 'manifest.json'),
        JSON.stringify({
          name: 'ext-nohook',
          version: '1.0.0',
          description: 'Test',
          type: 'standard',
          commands: {},
          hooks: { onInit: './nonexistent-hook.js' },
        }),
      );

      // Should not throw even with missing hook
      await expect(
        activate('ext-nohook', '1.0.0', projectDir, extDir),
      ).resolves.toBeDefined();
    });

    it('runs onInit hook when defined', async () => {
      const extDir = path.join(tmpDir, 'ext-hook@1.0.0');
      fs.mkdirSync(extDir, { recursive: true });
      fs.writeFileSync(
        path.join(extDir, 'manifest.json'),
        JSON.stringify({
          name: 'ext-hook',
          version: '1.0.0',
          description: 'Hook test',
          type: 'standard',
          commands: {},
          hooks: { onInit: './init.js' },
        }),
      );
      fs.writeFileSync(
        path.join(extDir, 'init.js'),
        `import fs from 'node:fs'; import path from 'node:path'; export default function(ctx) { fs.writeFileSync(path.join(ctx.projectDir, '.init-ran'), 'yes'); }`,
      );

      await activate('ext-hook', '1.0.0', projectDir, extDir);

      const pluginsPath = path.join(projectDir, '.renre-kit', 'plugins.json');
      const plugins = JSON.parse(fs.readFileSync(pluginsPath, 'utf-8'));
      expect(plugins['ext-hook']).toBeDefined();
    });

    it('emits ext:activate event when bus is provided', async () => {
      const extDir = path.join(tmpDir, 'ext-bus@1.0.0');
      fs.mkdirSync(extDir, { recursive: true });
      fs.writeFileSync(
        path.join(extDir, 'manifest.json'),
        JSON.stringify({
          name: 'ext-bus',
          version: '1.0.0',
          description: 'Test',
          type: 'standard',
          commands: {},
        }),
      );

      const mockBus = { emit: vi.fn().mockResolvedValue(undefined) };
      await activate('ext-bus', '1.0.0', projectDir, extDir, mockBus as unknown as import('../../../core/event-bus/event-bus.js').EventBus);

      expect(mockBus.emit).toHaveBeenCalledWith('ext:activate', {
        type: 'ext:activate',
        extensionName: 'ext-bus',
        version: '1.0.0',
        projectPath: projectDir,
      });
    });

    it('preserves existing plugins when activating new one', async () => {
      const pluginsPath = path.join(projectDir, '.renre-kit', 'plugins.json');
      fs.writeFileSync(
        pluginsPath,
        JSON.stringify({ existing: '1.0.0' }),
      );

      const extDir = path.join(tmpDir, 'new-ext@2.0.0');
      fs.mkdirSync(extDir, { recursive: true });
      fs.writeFileSync(
        path.join(extDir, 'manifest.json'),
        JSON.stringify({
          name: 'new-ext',
          version: '2.0.0',
          description: 'New',
          type: 'mcp',
          commands: {},
          mcp: { transport: 'stdio', command: 'node', args: ['index.js'] },
        }),
      );

      await activate('new-ext', '2.0.0', projectDir, extDir);

      const plugins = JSON.parse(fs.readFileSync(pluginsPath, 'utf-8'));
      expect(plugins['existing']).toBe('1.0.0');
      expect(plugins['new-ext']).toBe('2.0.0');
    });
  });

  describe('deactivate', () => {
    it('removes extension from plugins.json', async () => {
      const pluginsPath = path.join(projectDir, '.renre-kit', 'plugins.json');
      fs.writeFileSync(
        pluginsPath,
        JSON.stringify({ 'ext-a': '1.0.0', 'ext-b': '2.0.0' }),
      );

      const extDir = path.join(tmpDir, 'ext-a@1.0.0');
      fs.mkdirSync(extDir, { recursive: true });
      fs.writeFileSync(
        path.join(extDir, 'manifest.json'),
        JSON.stringify({
          name: 'ext-a',
          version: '1.0.0',
          description: 'Test',
          type: 'standard',
          commands: {},
        }),
      );

      await deactivate('ext-a', projectDir, extDir);

      const plugins = JSON.parse(fs.readFileSync(pluginsPath, 'utf-8'));
      expect(plugins['ext-a']).toBeUndefined();
      expect(plugins['ext-b']).toBe('2.0.0');
    });

    it('emits ext:deactivate event when bus is provided', async () => {
      const pluginsPath = path.join(projectDir, '.renre-kit', 'plugins.json');
      fs.writeFileSync(pluginsPath, JSON.stringify({ 'ext-bus': '1.0.0' }));

      const extDir = path.join(tmpDir, 'ext-bus@1.0.0');
      fs.mkdirSync(extDir, { recursive: true });
      fs.writeFileSync(
        path.join(extDir, 'manifest.json'),
        JSON.stringify({
          name: 'ext-bus',
          version: '1.0.0',
          description: 'Test',
          type: 'standard',
          commands: {},
        }),
      );

      const mockBus = { emit: vi.fn().mockResolvedValue(undefined) };
      await deactivate('ext-bus', projectDir, extDir, mockBus as unknown as import('../../../core/event-bus/event-bus.js').EventBus);

      expect(mockBus.emit).toHaveBeenCalledWith('ext:deactivate', {
        type: 'ext:deactivate',
        extensionName: 'ext-bus',
        projectPath: projectDir,
      });
    });

    it('handles deactivating when plugins.json does not exist', async () => {
      const extDir = path.join(tmpDir, 'ext-a@1.0.0');
      fs.mkdirSync(extDir, { recursive: true });
      fs.writeFileSync(
        path.join(extDir, 'manifest.json'),
        JSON.stringify({
          name: 'ext-a',
          version: '1.0.0',
          description: 'Test',
          type: 'standard',
          commands: {},
        }),
      );

      await expect(
        deactivate('ext-a', projectDir, extDir),
      ).resolves.toBeUndefined();
    });
  });

  describe('getActivated', () => {
    it('returns empty object when no plugins.json', () => {
      const nonProjectDir = path.join(tmpDir, 'no-project');
      fs.mkdirSync(nonProjectDir, { recursive: true });
      const result = getActivated(nonProjectDir);
      expect(result).toEqual({});
    });

    it('reads and returns plugins.json content', () => {
      const pluginsPath = path.join(projectDir, '.renre-kit', 'plugins.json');
      fs.writeFileSync(
        pluginsPath,
        JSON.stringify({ 'my-ext': '1.0.0' }),
      );

      const result = getActivated(projectDir);
      expect(result['my-ext']).toBe('1.0.0');
    });
  });

  describe('validateVaultKeys', () => {
    it('returns empty array when no vault mappings exist', () => {
      vi.mocked(getExtensionConfigMappings).mockReturnValue({});
      expect(validateVaultKeys('my-ext')).toEqual([]);
    });

    it('returns missing vault keys', () => {
      vi.mocked(getExtensionConfigMappings).mockReturnValue({
        apiToken: { source: 'vault', value: 'missing-key' },
        baseUrl: { source: 'direct', value: 'https://example.com' },
      });
      vi.mocked(getEntry).mockReturnValue(undefined);

      const missing = validateVaultKeys('my-ext');
      expect(missing).toEqual(['apiToken → vault:missing-key']);
    });

    it('returns empty when all vault keys exist', () => {
      vi.mocked(getExtensionConfigMappings).mockReturnValue({
        apiToken: { source: 'vault', value: 'my-token' },
      });
      vi.mocked(getEntry).mockReturnValue({ value: 'secret', secret: true, tags: [] });

      expect(validateVaultKeys('my-ext')).toEqual([]);
    });
  });

  describe('status', () => {
    it('returns status for all installed extensions', () => {
      install('ext-a', '1.0.0', 'default', 'standard', db);
      install('ext-b', '2.0.0', 'community', 'mcp', db);

      const pluginsPath = path.join(projectDir, '.renre-kit', 'plugins.json');
      fs.writeFileSync(
        pluginsPath,
        JSON.stringify({ 'ext-a': '1.0.0' }),
      );

      const result = status(projectDir, db);
      expect(result).toHaveLength(2);

      const extA = result.find((e) => e.name === 'ext-a');
      expect(extA!.activatedInProject).toBe(true);
      expect(extA!.activatedVersion).toBe('1.0.0');

      const extB = result.find((e) => e.name === 'ext-b');
      expect(extB!.activatedInProject).toBe(false);
      expect(extB!.activatedVersion).toBeNull();
    });

    it('returns empty array when no extensions installed', () => {
      expect(status(projectDir, db)).toEqual([]);
    });

    it('handles missing plugins.json in status check', () => {
      install('ext-c', '3.0.0', 'default', 'standard', db);
      const noPluginsDir = path.join(tmpDir, 'no-plugins');
      fs.mkdirSync(noPluginsDir, { recursive: true });

      const result = status(noPluginsDir, db);
      expect(result).toHaveLength(1);
      expect(result[0]!.activatedInProject).toBe(false);
      expect(result[0]!.activatedVersion).toBeNull();
    });
  });
});
