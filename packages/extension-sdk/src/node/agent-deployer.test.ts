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
    it('should deploy skill files to .agents/skills/{ext}/{skill}/SKILL.md', () => {
      writeExtFile('skills/greet/SKILL.md', '# Greet Skill');
      writeManifest({
        ...baseManifest,
        agent: {
          skills: [{ name: 'greet', path: 'skills/greet/SKILL.md' }],
        },
      });

      deployAgentAssets(extensionDir, projectDir);

      const deployed = join(projectDir, '.agents', 'skills', 'test-ext', 'greet', 'SKILL.md');
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

      expect(existsSync(join(projectDir, '.agents', 'skills', 'test-ext', 'greet', 'SKILL.md'))).toBe(true);
      expect(existsSync(join(projectDir, '.agents', 'skills', 'test-ext', 'info', 'SKILL.md'))).toBe(true);
    });

    it('should deploy prompt files to .agents/prompts/{ext}/', () => {
      writeExtFile('agent/prompts/style.prompt.md', '# Style');
      writeManifest({
        ...baseManifest,
        agent: {
          prompts: ['agent/prompts/style.prompt.md'],
        },
      });

      deployAgentAssets(extensionDir, projectDir);

      const deployed = join(projectDir, '.agents', 'prompts', 'test-ext', 'style.prompt.md');
      expect(existsSync(deployed)).toBe(true);
      expect(readFileSync(deployed, 'utf-8')).toBe('# Style');
    });

    it('should deploy context files to .agents/context/{ext}/', () => {
      writeExtFile('agent/context/docs.context.md', '# Docs');
      writeManifest({
        ...baseManifest,
        agent: {
          context: ['agent/context/docs.context.md'],
        },
      });

      deployAgentAssets(extensionDir, projectDir);

      const deployed = join(projectDir, '.agents', 'context', 'test-ext', 'docs.context.md');
      expect(existsSync(deployed)).toBe(true);
    });

    it('should deploy agent files to .agents/agents/{ext}/', () => {
      writeExtFile('agent/agents/researcher.agent.md', '# Researcher');
      writeManifest({
        ...baseManifest,
        agent: {
          agents: ['agent/agents/researcher.agent.md'],
        },
      });

      deployAgentAssets(extensionDir, projectDir);

      const deployed = join(projectDir, '.agents', 'agents', 'test-ext', 'researcher.agent.md');
      expect(existsSync(deployed)).toBe(true);
    });

    it('should deploy workflow files to .agents/workflows/{ext}/', () => {
      writeExtFile('agent/workflows/deploy.workflow.md', '# Deploy');
      writeManifest({
        ...baseManifest,
        agent: {
          workflows: ['agent/workflows/deploy.workflow.md'],
        },
      });

      deployAgentAssets(extensionDir, projectDir);

      const deployed = join(projectDir, '.agents', 'workflows', 'test-ext', 'deploy.workflow.md');
      expect(existsSync(deployed)).toBe(true);
    });

    it('should preserve subdirectory structure to prevent collisions', () => {
      writeExtFile('agent/context/api/docs.context.md', '# API Docs');
      writeExtFile('agent/context/guides/docs.context.md', '# Guide Docs');
      writeManifest({
        ...baseManifest,
        agent: {
          context: [
            'agent/context/api/docs.context.md',
            'agent/context/guides/docs.context.md',
          ],
        },
      });

      deployAgentAssets(extensionDir, projectDir);

      const apiDocs = join(projectDir, '.agents', 'context', 'test-ext', 'api', 'docs.context.md');
      const guideDocs = join(projectDir, '.agents', 'context', 'test-ext', 'guides', 'docs.context.md');
      expect(existsSync(apiDocs)).toBe(true);
      expect(existsSync(guideDocs)).toBe(true);
      expect(readFileSync(apiDocs, 'utf-8')).toBe('# API Docs');
      expect(readFileSync(guideDocs, 'utf-8')).toBe('# Guide Docs');
    });

    it('should deploy all asset types together', () => {
      writeExtFile('agent/skills/greet/SKILL.md', '# Greet');
      writeExtFile('agent/prompts/style.prompt.md', '# Style');
      writeExtFile('agent/context/docs.context.md', '# Docs');
      writeExtFile('agent/agents/researcher.agent.md', '# Researcher');
      writeExtFile('agent/workflows/deploy.workflow.md', '# Deploy');
      writeManifest({
        ...baseManifest,
        agent: {
          skills: [{ name: 'greet', path: 'agent/skills/greet/SKILL.md' }],
          prompts: ['agent/prompts/style.prompt.md'],
          context: ['agent/context/docs.context.md'],
          agents: ['agent/agents/researcher.agent.md'],
          workflows: ['agent/workflows/deploy.workflow.md'],
        },
      });

      deployAgentAssets(extensionDir, projectDir);

      expect(existsSync(join(projectDir, '.agents', 'skills', 'test-ext', 'greet', 'SKILL.md'))).toBe(true);
      expect(existsSync(join(projectDir, '.agents', 'prompts', 'test-ext', 'style.prompt.md'))).toBe(true);
      expect(existsSync(join(projectDir, '.agents', 'context', 'test-ext', 'docs.context.md'))).toBe(true);
      expect(existsSync(join(projectDir, '.agents', 'agents', 'test-ext', 'researcher.agent.md'))).toBe(true);
      expect(existsSync(join(projectDir, '.agents', 'workflows', 'test-ext', 'deploy.workflow.md'))).toBe(true);
    });

    it('should skip missing source files without error', () => {
      writeManifest({
        ...baseManifest,
        agent: {
          skills: [{ name: 'missing', path: 'skills/missing/SKILL.md' }],
          prompts: ['agent/prompts/nonexistent.prompt.md'],
        },
      });

      expect(() => deployAgentAssets(extensionDir, projectDir)).not.toThrow();
    });

    it('should do nothing when manifest has no agent field', () => {
      writeManifest(baseManifest);

      expect(() => deployAgentAssets(extensionDir, projectDir)).not.toThrow();
      expect(existsSync(join(projectDir, '.agents'))).toBe(false);
    });

    it('should throw when manifest.json is missing', () => {
      expect(() => deployAgentAssets(extensionDir, projectDir)).toThrow(/manifest\.json/);
    });
  });

  describe('cleanupAgentAssets', () => {
    it('should remove all extension directories from .agents/', () => {
      writeManifest(baseManifest);
      const agentDir = join(projectDir, '.agents');
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
      const agentDir = join(projectDir, '.agents');
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
