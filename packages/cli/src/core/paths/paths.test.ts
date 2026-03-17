import { describe, it, expect } from 'vitest';
import os from 'node:os';
import path from 'node:path';
import {
  GLOBAL_DIR,
  DB_PATH,
  EXTENSIONS_DIR,
  REGISTRIES_DIR,
  VAULT_PATH,
  CONFIG_PATH,
  LOGS_DIR,
  PROJECT_DIR,
  PLUGINS_JSON,
  MANIFEST_JSON,
  STORAGE_DIR,
  AGENT_DIR,
  SKILLS_DIR,
  PROMPTS_DIR,
  AGENTS_DIR,
  WORKFLOWS_DIR,
  CONTEXT_DIR,
  getProjectDir,
  getPluginsPath,
  getManifestPath,
  getExtensionDir,
  getSkillsDir,
  getAgentDir,
} from './paths.js';

describe('paths', () => {
  const home = os.homedir();
  const expectedGlobalDir = process.env['RENRE_KIT_HOME'] ?? path.join(home, '.renre-kit');

  describe('global paths', () => {
    it('should define GLOBAL_DIR under home or RENRE_KIT_HOME', () => {
      expect(GLOBAL_DIR).toBe(expectedGlobalDir);
    });

    it('should define DB_PATH inside GLOBAL_DIR', () => {
      expect(DB_PATH).toBe(path.join(expectedGlobalDir, 'db.sqlite'));
    });

    it('should define EXTENSIONS_DIR inside GLOBAL_DIR', () => {
      expect(EXTENSIONS_DIR).toBe(path.join(expectedGlobalDir, 'extensions'));
    });

    it('should define REGISTRIES_DIR inside GLOBAL_DIR', () => {
      expect(REGISTRIES_DIR).toBe(path.join(expectedGlobalDir, 'registries'));
    });

    it('should define VAULT_PATH inside GLOBAL_DIR', () => {
      expect(VAULT_PATH).toBe(path.join(expectedGlobalDir, 'vault.json'));
    });

    it('should define CONFIG_PATH inside GLOBAL_DIR', () => {
      expect(CONFIG_PATH).toBe(path.join(expectedGlobalDir, 'config.json'));
    });

    it('should define LOGS_DIR inside GLOBAL_DIR', () => {
      expect(LOGS_DIR).toBe(path.join(expectedGlobalDir, 'logs'));
    });
  });

  describe('per-project constants', () => {
    it('should define PROJECT_DIR', () => {
      expect(PROJECT_DIR).toBe('.renre-kit');
    });

    it('should define PLUGINS_JSON', () => {
      expect(PLUGINS_JSON).toBe('plugins.json');
    });

    it('should define MANIFEST_JSON', () => {
      expect(MANIFEST_JSON).toBe('manifest.json');
    });

    it('should define STORAGE_DIR', () => {
      expect(STORAGE_DIR).toBe('storage');
    });
  });

  describe('agent constants', () => {
    it('should define AGENT_DIR', () => {
      expect(AGENT_DIR).toBe('.agent');
    });

    it('should define SKILLS_DIR', () => {
      expect(SKILLS_DIR).toBe('skills');
    });

    it('should define PROMPTS_DIR', () => {
      expect(PROMPTS_DIR).toBe('prompts');
    });

    it('should define AGENTS_DIR', () => {
      expect(AGENTS_DIR).toBe('agents');
    });

    it('should define WORKFLOWS_DIR', () => {
      expect(WORKFLOWS_DIR).toBe('workflows');
    });

    it('should define CONTEXT_DIR', () => {
      expect(CONTEXT_DIR).toBe('context');
    });
  });

  describe('helper functions', () => {
    it('getProjectDir returns .renre-kit inside given path', () => {
      expect(getProjectDir('/my/project')).toBe(
        path.join('/my/project', '.renre-kit'),
      );
    });

    it('getPluginsPath returns plugins.json inside project dir', () => {
      expect(getPluginsPath('/my/project')).toBe(
        path.join('/my/project', '.renre-kit', 'plugins.json'),
      );
    });

    it('getManifestPath returns manifest.json inside project dir', () => {
      expect(getManifestPath('/my/project')).toBe(
        path.join('/my/project', '.renre-kit', 'manifest.json'),
      );
    });

    it('getExtensionDir returns versioned extension path', () => {
      expect(getExtensionDir('my-ext', '1.0.0')).toBe(
        path.join(expectedGlobalDir, 'extensions', 'my-ext@1.0.0'),
      );
    });

    it('getSkillsDir returns skills dir for extension in project', () => {
      expect(getSkillsDir('/my/project', 'my-ext')).toBe(
        path.join('/my/project', '.agent', 'skills', 'my-ext'),
      );
    });

    it('getAgentDir returns agent type dir for extension in project', () => {
      expect(getAgentDir('/my/project', 'prompts', 'my-ext')).toBe(
        path.join('/my/project', '.agent', 'prompts', 'my-ext'),
      );
      expect(getAgentDir('/my/project', 'agents', 'my-ext')).toBe(
        path.join('/my/project', '.agent', 'agents', 'my-ext'),
      );
      expect(getAgentDir('/my/project', 'workflows', 'my-ext')).toBe(
        path.join('/my/project', '.agent', 'workflows', 'my-ext'),
      );
      expect(getAgentDir('/my/project', 'context', 'my-ext')).toBe(
        path.join('/my/project', '.agent', 'context', 'my-ext'),
      );
    });
  });
});
