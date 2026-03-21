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
  SERVER_PID_PATH,
  UPDATE_CACHE_PATH,
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
  HOOKS_DIR,
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

    it('should define SERVER_PID_PATH inside GLOBAL_DIR', () => {
      expect(SERVER_PID_PATH).toBe(path.join(expectedGlobalDir, 'server.pid'));
    });

    it('should define UPDATE_CACHE_PATH inside GLOBAL_DIR', () => {
      expect(UPDATE_CACHE_PATH).toBe(path.join(expectedGlobalDir, 'update-cache.json'));
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
      expect(AGENT_DIR).toBe('.agents');
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

    it('should define HOOKS_DIR', () => {
      expect(HOOKS_DIR).toBe('hooks');
    });
  });

  describe('helper functions', () => {
    it('getProjectDir returns .renre-kit inside given path', () => {
      expect(getProjectDir('/my/project')).toBe(path.join('/my/project', '.renre-kit'));
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

    it('getSkillsDir returns skills dir in project', () => {
      expect(getSkillsDir('/my/project')).toBe(path.join('/my/project', '.agents', 'skills'));
    });

    it('getAgentDir returns agent type dir in project', () => {
      expect(getAgentDir('/my/project', 'prompts')).toBe(
        path.join('/my/project', '.agents', 'prompts'),
      );
      expect(getAgentDir('/my/project', 'agents')).toBe(
        path.join('/my/project', '.agents', 'agents'),
      );
      expect(getAgentDir('/my/project', 'workflows')).toBe(
        path.join('/my/project', '.agents', 'workflows'),
      );
      expect(getAgentDir('/my/project', 'context')).toBe(
        path.join('/my/project', '.agents', 'context'),
      );
      expect(getAgentDir('/my/project', 'hooks')).toBe(
        path.join('/my/project', '.agents', 'hooks'),
      );
    });
  });
});
