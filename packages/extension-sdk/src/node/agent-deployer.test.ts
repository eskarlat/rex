// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { deployAgentAssets, cleanupAgentAssets } from './agent-deployer.js';

describe('agent-deployer', () => {
  let extensionDir: string;
  let projectDir: string;

  beforeEach(() => {
    extensionDir = mkdtempSync(join(tmpdir(), 'ext-sdk-ext-'));
    projectDir = mkdtempSync(join(tmpdir(), 'ext-sdk-proj-'));
  });

  afterEach(() => {
    rmSync(extensionDir, { recursive: true, force: true });
    rmSync(projectDir, { recursive: true, force: true });
  });

  function writeExtFile(relativePath: string, content: string): void {
    const fullPath = join(extensionDir, relativePath);
    mkdirSync(join(fullPath, '..'), { recursive: true });
    writeFileSync(fullPath, content);
  }

  function writeManifest(manifest: Record<string, unknown>): void {
    writeFileSync(join(extensionDir, 'manifest.json'), JSON.stringify(manifest));
  }

  const baseManifest = {
    name: 'test-ext',
    version: '1.0.0',
    description: 'Test',
    type: 'standard',
    commands: {},
  };

  describe('deployAgentAssets', () => {
    it('should deploy skill files to .agent/skills/{ext}/{skill}/SKILL.md', () => {
      writeExtFile('skills/greet/SKILL.md', '# Greet Skill');
      writeManifest({
        ...baseManifest,
        agent: {
          skills: [{ name: 'greet', path: 'skills/greet/SKILL.md' }],
        },
      });

      deployAgentAssets(extensionDir, projectDir);

      const deployed = join(projectDir, '.agent', 'skills', 'test-ext', 'greet', 'SKILL.md');
      expect(existsSync(deployed)).toBe(true);
      expect(readFileSync(deployed, 'utf-8')).toBe('# Greet Skill');
    });

    it('should deploy multiple skills', () => {
      writeExtFile('skills/greet/SKILL.md', '# Greet');
      writeExtFile('skills/info/SKILL.md', '# Info');
      writeManifest({
        ...baseManifest,
        agent: {
          skills: [
            { name: 'greet', path: 'skills/greet/SKILL.md' },
            { name: 'info', path: 'skills/info/SKILL.md' },
          ],
        },
      });

      deployAgentAssets(extensionDir, projectDir);

      expect(existsSync(join(projectDir, '.agent', 'skills', 'test-ext', 'greet', 'SKILL.md'))).toBe(true);
      expect(existsSync(join(projectDir, '.agent', 'skills', 'test-ext', 'info', 'SKILL.md'))).toBe(true);
    });

    it('should deploy prompt files to .agent/prompts/{ext}/', () => {
      writeExtFile('agent/prompts/style.md', '# Style');
      writeManifest({
        ...baseManifest,
        agent: {
          prompts: ['agent/prompts/style.md'],
        },
      });

      deployAgentAssets(extensionDir, projectDir);

      const deployed = join(projectDir, '.agent', 'prompts', 'test-ext', 'style.md');
      expect(existsSync(deployed)).toBe(true);
      expect(readFileSync(deployed, 'utf-8')).toBe('# Style');
    });

    it('should deploy context files to .agent/context/{ext}/', () => {
      writeExtFile('agent/context/docs.md', '# Docs');
      writeManifest({
        ...baseManifest,
        agent: {
          context: ['agent/context/docs.md'],
        },
      });

      deployAgentAssets(extensionDir, projectDir);

      const deployed = join(projectDir, '.agent', 'context', 'test-ext', 'docs.md');
      expect(existsSync(deployed)).toBe(true);
    });

    it('should deploy agent files to .agent/agents/{ext}/', () => {
      writeExtFile('agent/agents/researcher.md', '# Researcher');
      writeManifest({
        ...baseManifest,
        agent: {
          agents: ['agent/agents/researcher.md'],
        },
      });

      deployAgentAssets(extensionDir, projectDir);

      const deployed = join(projectDir, '.agent', 'agents', 'test-ext', 'researcher.md');
      expect(existsSync(deployed)).toBe(true);
    });

    it('should deploy workflow files to .agent/workflows/{ext}/', () => {
      writeExtFile('agent/workflows/deploy.md', '# Deploy');
      writeManifest({
        ...baseManifest,
        agent: {
          workflows: ['agent/workflows/deploy.md'],
        },
      });

      deployAgentAssets(extensionDir, projectDir);

      const deployed = join(projectDir, '.agent', 'workflows', 'test-ext', 'deploy.md');
      expect(existsSync(deployed)).toBe(true);
    });

    it('should deploy all asset types together', () => {
      writeExtFile('skills/greet/SKILL.md', '# Greet');
      writeExtFile('agent/prompts/style.md', '# Style');
      writeExtFile('agent/context/docs.md', '# Docs');
      writeExtFile('agent/agents/researcher.md', '# Researcher');
      writeExtFile('agent/workflows/deploy.md', '# Deploy');
      writeManifest({
        ...baseManifest,
        agent: {
          skills: [{ name: 'greet', path: 'skills/greet/SKILL.md' }],
          prompts: ['agent/prompts/style.md'],
          context: ['agent/context/docs.md'],
          agents: ['agent/agents/researcher.md'],
          workflows: ['agent/workflows/deploy.md'],
        },
      });

      deployAgentAssets(extensionDir, projectDir);

      expect(existsSync(join(projectDir, '.agent', 'skills', 'test-ext', 'greet', 'SKILL.md'))).toBe(true);
      expect(existsSync(join(projectDir, '.agent', 'prompts', 'test-ext', 'style.md'))).toBe(true);
      expect(existsSync(join(projectDir, '.agent', 'context', 'test-ext', 'docs.md'))).toBe(true);
      expect(existsSync(join(projectDir, '.agent', 'agents', 'test-ext', 'researcher.md'))).toBe(true);
      expect(existsSync(join(projectDir, '.agent', 'workflows', 'test-ext', 'deploy.md'))).toBe(true);
    });

    it('should skip missing source files without error', () => {
      writeManifest({
        ...baseManifest,
        agent: {
          skills: [{ name: 'missing', path: 'skills/missing/SKILL.md' }],
          prompts: ['agent/prompts/nonexistent.md'],
        },
      });

      expect(() => deployAgentAssets(extensionDir, projectDir)).not.toThrow();
    });

    it('should do nothing when manifest has no agent field', () => {
      writeManifest(baseManifest);

      expect(() => deployAgentAssets(extensionDir, projectDir)).not.toThrow();
      expect(existsSync(join(projectDir, '.agent'))).toBe(false);
    });

    it('should throw when manifest.json is missing', () => {
      expect(() => deployAgentAssets(extensionDir, projectDir)).toThrow(/manifest\.json/);
    });
  });

  describe('cleanupAgentAssets', () => {
    it('should remove all extension directories from .agent/', () => {
      writeManifest(baseManifest);
      const agentDir = join(projectDir, '.agent');
      mkdirSync(join(agentDir, 'skills', 'test-ext', 'greet'), { recursive: true });
      mkdirSync(join(agentDir, 'prompts', 'test-ext'), { recursive: true });
      mkdirSync(join(agentDir, 'context', 'test-ext'), { recursive: true });
      writeFileSync(join(agentDir, 'skills', 'test-ext', 'greet', 'SKILL.md'), '# Greet');
      writeFileSync(join(agentDir, 'prompts', 'test-ext', 'style.md'), '# Style');

      cleanupAgentAssets(extensionDir, projectDir);

      expect(existsSync(join(agentDir, 'skills', 'test-ext'))).toBe(false);
      expect(existsSync(join(agentDir, 'prompts', 'test-ext'))).toBe(false);
      expect(existsSync(join(agentDir, 'context', 'test-ext'))).toBe(false);
    });

    it('should not remove other extensions directories', () => {
      writeManifest(baseManifest);
      const agentDir = join(projectDir, '.agent');
      mkdirSync(join(agentDir, 'skills', 'test-ext', 'greet'), { recursive: true });
      mkdirSync(join(agentDir, 'skills', 'other-ext'), { recursive: true });
      writeFileSync(join(agentDir, 'skills', 'other-ext', 'SKILL.md'), '# Other');

      cleanupAgentAssets(extensionDir, projectDir);

      expect(existsSync(join(agentDir, 'skills', 'test-ext'))).toBe(false);
      expect(existsSync(join(agentDir, 'skills', 'other-ext', 'SKILL.md'))).toBe(true);
    });

    it('should not error when .agent directory does not exist', () => {
      writeManifest(baseManifest);
      expect(() => cleanupAgentAssets(extensionDir, projectDir)).not.toThrow();
    });

    it('should throw when manifest.json is missing', () => {
      expect(() => cleanupAgentAssets(extensionDir, projectDir)).toThrow(/manifest\.json/);
    });
  });
});
