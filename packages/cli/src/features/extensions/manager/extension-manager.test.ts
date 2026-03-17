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
  hasEntry: vi.fn().mockReturnValue(false),
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
import { hasEntry } from '../../vault/vault-manager.js';

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

  describe('activate — Layer 1 skill deployment', () => {
    it('copies single SKILL.md (string form) to .agent/skills/{name}/SKILL.md', async () => {
      const extDir = path.join(tmpDir, 'skill-ext@1.0.0');
      fs.mkdirSync(extDir, { recursive: true });
      fs.writeFileSync(
        path.join(extDir, 'manifest.json'),
        JSON.stringify({
          name: 'skill-ext',
          version: '1.0.0',
          description: 'Has a skill',
          type: 'standard',
          commands: {},
          skills: 'SKILL.md',
        }),
      );
      fs.writeFileSync(path.join(extDir, 'SKILL.md'), '# My Skill\nDoes stuff.');

      await activate('skill-ext', '1.0.0', projectDir, extDir);

      const deployed = path.join(projectDir, '.agent', 'skills', 'skill-ext', 'SKILL.md');
      expect(fs.existsSync(deployed)).toBe(true);
      expect(fs.readFileSync(deployed, 'utf-8')).toBe('# My Skill\nDoes stuff.');
    });

    it('copies multiple skills (array form) to .agent/skills/{name}/{skillName}/SKILL.md', async () => {
      const extDir = path.join(tmpDir, 'multi-skill@1.0.0');
      fs.mkdirSync(path.join(extDir, 'skills', 'greet'), { recursive: true });
      fs.mkdirSync(path.join(extDir, 'skills', 'analyze'), { recursive: true });
      fs.writeFileSync(path.join(extDir, 'skills', 'greet', 'SKILL.md'), '# Greet');
      fs.writeFileSync(path.join(extDir, 'skills', 'analyze', 'SKILL.md'), '# Analyze');
      fs.writeFileSync(
        path.join(extDir, 'manifest.json'),
        JSON.stringify({
          name: 'multi-skill',
          version: '1.0.0',
          description: 'Multiple skills',
          type: 'standard',
          commands: {},
          skills: [
            { name: 'greet', path: 'skills/greet/SKILL.md' },
            { name: 'analyze', path: 'skills/analyze/SKILL.md' },
          ],
        }),
      );

      await activate('multi-skill', '1.0.0', projectDir, extDir);

      const greetPath = path.join(projectDir, '.agent', 'skills', 'multi-skill', 'greet', 'SKILL.md');
      const analyzePath = path.join(projectDir, '.agent', 'skills', 'multi-skill', 'analyze', 'SKILL.md');
      expect(fs.existsSync(greetPath)).toBe(true);
      expect(fs.readFileSync(greetPath, 'utf-8')).toBe('# Greet');
      expect(fs.existsSync(analyzePath)).toBe(true);
      expect(fs.readFileSync(analyzePath, 'utf-8')).toBe('# Analyze');
    });

    it('does not fail when skills file does not exist in extension', async () => {
      const extDir = path.join(tmpDir, 'no-skill-file@1.0.0');
      fs.mkdirSync(extDir, { recursive: true });
      fs.writeFileSync(
        path.join(extDir, 'manifest.json'),
        JSON.stringify({
          name: 'no-skill-file',
          version: '1.0.0',
          description: 'Missing skill file',
          type: 'standard',
          commands: {},
          skills: 'SKILL.md',
        }),
      );

      await expect(
        activate('no-skill-file', '1.0.0', projectDir, extDir),
      ).resolves.toBeDefined();
    });

    it('copies agent assets (object form) to .agent/{type}/{name}/', async () => {
      const extDir = path.join(tmpDir, 'agent-ext@1.0.0');
      fs.mkdirSync(path.join(extDir, 'agent', 'prompts'), { recursive: true });
      fs.mkdirSync(path.join(extDir, 'agent', 'agents'), { recursive: true });
      fs.writeFileSync(path.join(extDir, 'agent', 'prompts', 'default.md'), '# Default prompt');
      fs.writeFileSync(path.join(extDir, 'agent', 'agents', 'researcher.md'), '# Researcher');
      fs.writeFileSync(
        path.join(extDir, 'manifest.json'),
        JSON.stringify({
          name: 'agent-ext',
          version: '1.0.0',
          description: 'Has agent assets',
          type: 'standard',
          commands: {},
          agent: {
            prompts: ['agent/prompts/default.md'],
            agents: ['agent/agents/researcher.md'],
          },
        }),
      );

      await activate('agent-ext', '1.0.0', projectDir, extDir);

      const promptPath = path.join(projectDir, '.agent', 'prompts', 'agent-ext', 'default.md');
      const agentPath = path.join(projectDir, '.agent', 'agents', 'agent-ext', 'researcher.md');
      expect(fs.existsSync(promptPath)).toBe(true);
      expect(fs.readFileSync(promptPath, 'utf-8')).toBe('# Default prompt');
      expect(fs.existsSync(agentPath)).toBe(true);
      expect(fs.readFileSync(agentPath, 'utf-8')).toBe('# Researcher');
    });

    it('copies skills from agent.skills (unified field) to .agent/skills/', async () => {
      const extDir = path.join(tmpDir, 'unified-ext@1.0.0');
      fs.mkdirSync(path.join(extDir, 'skills', 'greet'), { recursive: true });
      fs.mkdirSync(path.join(extDir, 'skills', 'analyze'), { recursive: true });
      fs.writeFileSync(path.join(extDir, 'skills', 'greet', 'SKILL.md'), '# Greet');
      fs.writeFileSync(path.join(extDir, 'skills', 'analyze', 'SKILL.md'), '# Analyze');
      fs.mkdirSync(path.join(extDir, 'agent', 'prompts'), { recursive: true });
      fs.writeFileSync(path.join(extDir, 'agent', 'prompts', 'default.md'), '# Prompt');
      fs.writeFileSync(
        path.join(extDir, 'manifest.json'),
        JSON.stringify({
          name: 'unified-ext',
          version: '1.0.0',
          description: 'Unified agent field',
          type: 'standard',
          commands: {},
          agent: {
            skills: [
              { name: 'greet', path: 'skills/greet/SKILL.md' },
              { name: 'analyze', path: 'skills/analyze/SKILL.md' },
            ],
            prompts: ['agent/prompts/default.md'],
          },
        }),
      );

      await activate('unified-ext', '1.0.0', projectDir, extDir);

      // Skills deployed
      const greetPath = path.join(projectDir, '.agent', 'skills', 'unified-ext', 'greet', 'SKILL.md');
      const analyzePath = path.join(projectDir, '.agent', 'skills', 'unified-ext', 'analyze', 'SKILL.md');
      expect(fs.existsSync(greetPath)).toBe(true);
      expect(fs.readFileSync(greetPath, 'utf-8')).toBe('# Greet');
      expect(fs.existsSync(analyzePath)).toBe(true);

      // Prompts also deployed
      const promptPath = path.join(projectDir, '.agent', 'prompts', 'unified-ext', 'default.md');
      expect(fs.existsSync(promptPath)).toBe(true);
    });

    it('prefers agent.skills over top-level skills (deprecated)', async () => {
      const extDir = path.join(tmpDir, 'prefer-agent@1.0.0');
      fs.mkdirSync(path.join(extDir, 'skills', 'new'), { recursive: true });
      fs.writeFileSync(path.join(extDir, 'skills', 'new', 'SKILL.md'), '# New Skill');
      fs.writeFileSync(path.join(extDir, 'OLD-SKILL.md'), '# Old Skill');
      fs.writeFileSync(
        path.join(extDir, 'manifest.json'),
        JSON.stringify({
          name: 'prefer-agent',
          version: '1.0.0',
          description: 'Test preference',
          type: 'standard',
          commands: {},
          skills: 'OLD-SKILL.md',
          agent: {
            skills: [{ name: 'new', path: 'skills/new/SKILL.md' }],
          },
        }),
      );

      await activate('prefer-agent', '1.0.0', projectDir, extDir);

      // agent.skills should be used, not top-level skills
      const newPath = path.join(projectDir, '.agent', 'skills', 'prefer-agent', 'new', 'SKILL.md');
      expect(fs.existsSync(newPath)).toBe(true);
      expect(fs.readFileSync(newPath, 'utf-8')).toBe('# New Skill');

      // Old skill should NOT be deployed at root level
      const oldPath = path.join(projectDir, '.agent', 'skills', 'prefer-agent', 'SKILL.md');
      expect(fs.existsSync(oldPath)).toBe(false);
    });

    it('skips agent asset deployment when agent is a string (Layer 2 hook)', async () => {
      const extDir = path.join(tmpDir, 'agent-str@1.0.0');
      fs.mkdirSync(extDir, { recursive: true });
      fs.writeFileSync(
        path.join(extDir, 'manifest.json'),
        JSON.stringify({
          name: 'agent-str',
          version: '1.0.0',
          description: 'Agent as string',
          type: 'standard',
          commands: {},
          agent: 'agent/',
        }),
      );

      await activate('agent-str', '1.0.0', projectDir, extDir);

      // No automatic deployment for string form — handled by hooks
      const agentDir = path.join(projectDir, '.agent', 'prompts', 'agent-str');
      expect(fs.existsSync(agentDir)).toBe(false);
    });

    it('does not fail when agent asset file does not exist in extension', async () => {
      const extDir = path.join(tmpDir, 'missing-agent@1.0.0');
      fs.mkdirSync(extDir, { recursive: true });
      fs.writeFileSync(
        path.join(extDir, 'manifest.json'),
        JSON.stringify({
          name: 'missing-agent',
          version: '1.0.0',
          description: 'Missing files',
          type: 'standard',
          commands: {},
          agent: {
            prompts: ['agent/prompts/nonexistent.md'],
          },
        }),
      );

      await expect(
        activate('missing-agent', '1.0.0', projectDir, extDir),
      ).resolves.toBeDefined();
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

    it('removes deployed skills directory on deactivate', async () => {
      // Pre-deploy skills
      const skillsDir = path.join(projectDir, '.agent', 'skills', 'cleanup-ext');
      fs.mkdirSync(path.join(skillsDir, 'greet'), { recursive: true });
      fs.writeFileSync(path.join(skillsDir, 'greet', 'SKILL.md'), '# Greet');
      fs.writeFileSync(path.join(skillsDir, 'SKILL.md'), '# Main');

      const pluginsPath = path.join(projectDir, '.renre-kit', 'plugins.json');
      fs.writeFileSync(pluginsPath, JSON.stringify({ 'cleanup-ext': '1.0.0' }));

      const extDir = path.join(tmpDir, 'cleanup-ext@1.0.0');
      fs.mkdirSync(extDir, { recursive: true });
      fs.writeFileSync(
        path.join(extDir, 'manifest.json'),
        JSON.stringify({
          name: 'cleanup-ext',
          version: '1.0.0',
          description: 'Cleanup test',
          type: 'standard',
          commands: {},
        }),
      );

      await deactivate('cleanup-ext', projectDir, extDir);

      expect(fs.existsSync(skillsDir)).toBe(false);
    });

    it('removes deployed agent asset directories on deactivate', async () => {
      // Pre-deploy agent assets
      const promptsDir = path.join(projectDir, '.agent', 'prompts', 'cleanup-ext');
      const agentsDir = path.join(projectDir, '.agent', 'agents', 'cleanup-ext');
      const workflowsDir = path.join(projectDir, '.agent', 'workflows', 'cleanup-ext');
      const contextDir = path.join(projectDir, '.agent', 'context', 'cleanup-ext');
      fs.mkdirSync(promptsDir, { recursive: true });
      fs.mkdirSync(agentsDir, { recursive: true });
      fs.mkdirSync(workflowsDir, { recursive: true });
      fs.mkdirSync(contextDir, { recursive: true });
      fs.writeFileSync(path.join(promptsDir, 'default.md'), '# Prompt');
      fs.writeFileSync(path.join(agentsDir, 'research.md'), '# Agent');

      const pluginsPath = path.join(projectDir, '.renre-kit', 'plugins.json');
      fs.writeFileSync(pluginsPath, JSON.stringify({ 'cleanup-ext': '1.0.0' }));

      const extDir = path.join(tmpDir, 'cleanup-ext@1.0.0');
      fs.mkdirSync(extDir, { recursive: true });
      fs.writeFileSync(
        path.join(extDir, 'manifest.json'),
        JSON.stringify({
          name: 'cleanup-ext',
          version: '1.0.0',
          description: 'Cleanup test',
          type: 'standard',
          commands: {},
        }),
      );

      await deactivate('cleanup-ext', projectDir, extDir);

      expect(fs.existsSync(promptsDir)).toBe(false);
      expect(fs.existsSync(agentsDir)).toBe(false);
      expect(fs.existsSync(workflowsDir)).toBe(false);
      expect(fs.existsSync(contextDir)).toBe(false);
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
      vi.mocked(hasEntry).mockReturnValue(false);

      const missing = validateVaultKeys('my-ext');
      expect(missing).toEqual(['apiToken → vault:missing-key']);
    });

    it('returns empty when all vault keys exist', () => {
      vi.mocked(getExtensionConfigMappings).mockReturnValue({
        apiToken: { source: 'vault', value: 'my-token' },
      });
      vi.mocked(hasEntry).mockReturnValue(true);

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
