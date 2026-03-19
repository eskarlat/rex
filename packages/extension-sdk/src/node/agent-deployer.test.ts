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
    it('should deploy skill to .agents/skills/{ext}:{skill}/SKILL.md', () => {
      writeExtFile('skills/greet/SKILL.md', '---\nname: greet\n---\n# Greet Skill');
      writeManifest({
        ...baseManifest,
        agent: {
          skills: [{ name: 'greet', path: 'skills/greet/SKILL.md' }],
        },
      });

      deployAgentAssets(extensionDir, projectDir);

      const deployed = join(projectDir, '.agents', 'skills', 'test-ext.greet', 'SKILL.md');
      expect(existsSync(deployed)).toBe(true);
      const content = readFileSync(deployed, 'utf-8');
      expect(content).toContain('name: test-ext.greet');
    });

    it('should deploy multiple skills with prefixed folder names', () => {
      writeExtFile('skills/greet/SKILL.md', '---\nname: greet\n---\n# Greet');
      writeExtFile('skills/info/SKILL.md', '---\nname: info\n---\n# Info');
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

      expect(existsSync(join(projectDir, '.agents', 'skills', 'test-ext.greet', 'SKILL.md'))).toBe(
        true,
      );
      expect(existsSync(join(projectDir, '.agents', 'skills', 'test-ext.info', 'SKILL.md'))).toBe(
        true,
      );
    });

    it('should deploy prompt files flat with ext prefix', () => {
      writeExtFile('agent/prompts/style.prompt.md', '---\nname: style\n---\n# Style');
      writeManifest({
        ...baseManifest,
        agent: {
          prompts: ['agent/prompts/style.prompt.md'],
        },
      });

      deployAgentAssets(extensionDir, projectDir);

      const deployed = join(projectDir, '.agents', 'prompts', 'test-ext.style.prompt.md');
      expect(existsSync(deployed)).toBe(true);
      const content = readFileSync(deployed, 'utf-8');
      expect(content).toContain('name: test-ext.style');
    });

    it('should deploy context files flat with ext prefix', () => {
      writeExtFile('agent/context/docs.context.md', '# Docs');
      writeManifest({
        ...baseManifest,
        agent: {
          context: ['agent/context/docs.context.md'],
        },
      });

      deployAgentAssets(extensionDir, projectDir);

      const deployed = join(projectDir, '.agents', 'context', 'test-ext.docs.context.md');
      expect(existsSync(deployed)).toBe(true);
    });

    it('should deploy agent files flat with ext prefix', () => {
      writeExtFile('agent/agents/researcher.agent.md', '---\nname: researcher\n---\n# Researcher');
      writeManifest({
        ...baseManifest,
        agent: {
          agents: ['agent/agents/researcher.agent.md'],
        },
      });

      deployAgentAssets(extensionDir, projectDir);

      const deployed = join(projectDir, '.agents', 'agents', 'test-ext.researcher.agent.md');
      expect(existsSync(deployed)).toBe(true);
      const content = readFileSync(deployed, 'utf-8');
      expect(content).toContain('name: test-ext.researcher');
    });

    it('should deploy workflow files flat with ext prefix', () => {
      writeExtFile('agent/workflows/deploy.workflow.md', '# Deploy');
      writeManifest({
        ...baseManifest,
        agent: {
          workflows: ['agent/workflows/deploy.workflow.md'],
        },
      });

      deployAgentAssets(extensionDir, projectDir);

      const deployed = join(projectDir, '.agents', 'workflows', 'test-ext.deploy.workflow.md');
      expect(existsSync(deployed)).toBe(true);
    });

    it('should deploy hook files flat with ext prefix', () => {
      writeExtFile('agent/hooks/session.json', '{"hooks":{}}');
      writeManifest({
        ...baseManifest,
        agent: {
          hooks: ['agent/hooks/session.json'],
        },
      });

      deployAgentAssets(extensionDir, projectDir);

      const deployed = join(projectDir, '.agents', 'hooks', 'test-ext.session.json');
      expect(existsSync(deployed)).toBe(true);
    });

    it('should deploy all asset types together', () => {
      writeExtFile('agent/skills/greet/SKILL.md', '---\nname: greet\n---\n# Greet');
      writeExtFile('agent/prompts/style.prompt.md', '---\nname: style\n---\n# Style');
      writeExtFile('agent/context/docs.context.md', '# Docs');
      writeExtFile('agent/agents/researcher.agent.md', '---\nname: researcher\n---\n# Researcher');
      writeExtFile('agent/workflows/deploy.workflow.md', '# Deploy');
      writeExtFile('agent/hooks/session.json', '{}');
      writeManifest({
        ...baseManifest,
        agent: {
          skills: [{ name: 'greet', path: 'agent/skills/greet/SKILL.md' }],
          prompts: ['agent/prompts/style.prompt.md'],
          context: ['agent/context/docs.context.md'],
          agents: ['agent/agents/researcher.agent.md'],
          workflows: ['agent/workflows/deploy.workflow.md'],
          hooks: ['agent/hooks/session.json'],
        },
      });

      deployAgentAssets(extensionDir, projectDir);

      expect(
        existsSync(join(projectDir, '.agents', 'skills', 'test-ext.greet', 'SKILL.md')),
      ).toBe(true);
      expect(
        existsSync(join(projectDir, '.agents', 'prompts', 'test-ext.style.prompt.md')),
      ).toBe(true);
      expect(
        existsSync(join(projectDir, '.agents', 'context', 'test-ext.docs.context.md')),
      ).toBe(true);
      expect(
        existsSync(join(projectDir, '.agents', 'agents', 'test-ext.researcher.agent.md')),
      ).toBe(true);
      expect(
        existsSync(join(projectDir, '.agents', 'workflows', 'test-ext.deploy.workflow.md')),
      ).toBe(true);
      expect(
        existsSync(join(projectDir, '.agents', 'hooks', 'test-ext.session.json')),
      ).toBe(true);
    });

    it('should transform frontmatter name in skills', () => {
      writeExtFile(
        'skills/greet/SKILL.md',
        '---\nname: greet\ndescription: Greets\n---\n# Greet',
      );
      writeManifest({
        ...baseManifest,
        agent: {
          skills: [{ name: 'greet', path: 'skills/greet/SKILL.md' }],
        },
      });

      deployAgentAssets(extensionDir, projectDir);

      const content = readFileSync(
        join(projectDir, '.agents', 'skills', 'test-ext.greet', 'SKILL.md'),
        'utf-8',
      );
      expect(content).toContain('name: test-ext.greet');
      expect(content).toContain('description: Greets');
      expect(content).not.toMatch(/^name: greet$/m);
    });

    it('should transform frontmatter name in prompts', () => {
      writeExtFile(
        'agent/prompts/style.prompt.md',
        '---\nname: style\ndescription: Style guide\n---\n# Style',
      );
      writeManifest({
        ...baseManifest,
        agent: {
          prompts: ['agent/prompts/style.prompt.md'],
        },
      });

      deployAgentAssets(extensionDir, projectDir);

      const content = readFileSync(
        join(projectDir, '.agents', 'prompts', 'test-ext.style.prompt.md'),
        'utf-8',
      );
      expect(content).toContain('name: test-ext.style');
    });

    it('should transform frontmatter name in agents', () => {
      writeExtFile(
        'agent/agents/researcher.agent.md',
        '---\nname: researcher\n---\n# Researcher',
      );
      writeManifest({
        ...baseManifest,
        agent: {
          agents: ['agent/agents/researcher.agent.md'],
        },
      });

      deployAgentAssets(extensionDir, projectDir);

      const content = readFileSync(
        join(projectDir, '.agents', 'agents', 'test-ext.researcher.agent.md'),
        'utf-8',
      );
      expect(content).toContain('name: test-ext.researcher');
    });

    it('should not transform content without frontmatter', () => {
      writeExtFile('agent/context/docs.context.md', '# Just some docs\nNo frontmatter here');
      writeManifest({
        ...baseManifest,
        agent: {
          context: ['agent/context/docs.context.md'],
        },
      });

      deployAgentAssets(extensionDir, projectDir);

      const content = readFileSync(
        join(projectDir, '.agents', 'context', 'test-ext.docs.context.md'),
        'utf-8',
      );
      expect(content).toBe('# Just some docs\nNo frontmatter here');
    });

    it('should not double-prefix if name is already prefixed', () => {
      writeExtFile(
        'skills/greet/SKILL.md',
        '---\nname: test-ext.greet\n---\n# Greet',
      );
      writeManifest({
        ...baseManifest,
        agent: {
          skills: [{ name: 'greet', path: 'skills/greet/SKILL.md' }],
        },
      });

      deployAgentAssets(extensionDir, projectDir);

      const content = readFileSync(
        join(projectDir, '.agents', 'skills', 'test-ext.greet', 'SKILL.md'),
        'utf-8',
      );
      expect(content).toContain('name: test-ext.greet');
      expect(content).not.toContain('name: test-ext.test-ext.greet');
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

    it('should deploy to custom agent directory when specified', () => {
      writeExtFile('skills/greet/SKILL.md', '---\nname: greet\n---\n# Greet');
      writeExtFile('agent/prompts/style.prompt.md', '---\nname: style\n---\n# Style');
      writeManifest({
        ...baseManifest,
        agent: {
          skills: [{ name: 'greet', path: 'skills/greet/SKILL.md' }],
          prompts: ['agent/prompts/style.prompt.md'],
        },
      });

      deployAgentAssets(extensionDir, projectDir, '.github');

      expect(
        existsSync(join(projectDir, '.github', 'skills', 'test-ext.greet', 'SKILL.md')),
      ).toBe(true);
      expect(
        existsSync(join(projectDir, '.github', 'prompts', 'test-ext.style.prompt.md')),
      ).toBe(true);
      expect(existsSync(join(projectDir, '.agents'))).toBe(false);
    });
  });

  describe('cleanupAgentAssets', () => {
    it('should remove prefixed skill directories', () => {
      writeManifest({
        ...baseManifest,
        agent: {
          skills: [{ name: 'greet', path: 'skills/greet/SKILL.md' }],
        },
      });
      const agentDir = join(projectDir, '.agents');
      mkdirSync(join(agentDir, 'skills', 'test-ext.greet'), { recursive: true });
      writeFileSync(join(agentDir, 'skills', 'test-ext.greet', 'SKILL.md'), '# Greet');

      cleanupAgentAssets(extensionDir, projectDir);

      expect(existsSync(join(agentDir, 'skills', 'test-ext.greet'))).toBe(false);
    });

    it('should remove prefixed files for non-skill categories', () => {
      writeManifest({
        ...baseManifest,
        agent: {
          prompts: ['agent/prompts/style.prompt.md'],
          context: ['agent/context/docs.context.md'],
        },
      });
      const agentDir = join(projectDir, '.agents');
      mkdirSync(join(agentDir, 'prompts'), { recursive: true });
      mkdirSync(join(agentDir, 'context'), { recursive: true });
      writeFileSync(join(agentDir, 'prompts', 'test-ext.style.prompt.md'), '# Style');
      writeFileSync(join(agentDir, 'context', 'test-ext.docs.context.md'), '# Docs');

      cleanupAgentAssets(extensionDir, projectDir);

      expect(existsSync(join(agentDir, 'prompts', 'test-ext.style.prompt.md'))).toBe(false);
      expect(existsSync(join(agentDir, 'context', 'test-ext.docs.context.md'))).toBe(false);
    });

    it('should remove hook files during cleanup', () => {
      writeManifest({
        ...baseManifest,
        agent: {
          hooks: ['agent/hooks/session.json'],
        },
      });
      const agentDir = join(projectDir, '.agents');
      mkdirSync(join(agentDir, 'hooks'), { recursive: true });
      writeFileSync(join(agentDir, 'hooks', 'test-ext.session.json'), '{}');

      cleanupAgentAssets(extensionDir, projectDir);

      expect(existsSync(join(agentDir, 'hooks', 'test-ext.session.json'))).toBe(false);
    });

    it('should not remove other extensions files', () => {
      writeManifest({
        ...baseManifest,
        agent: {
          skills: [{ name: 'greet', path: 'skills/greet/SKILL.md' }],
          prompts: ['agent/prompts/style.prompt.md'],
        },
      });
      const agentDir = join(projectDir, '.agents');
      mkdirSync(join(agentDir, 'skills', 'test-ext.greet'), { recursive: true });
      mkdirSync(join(agentDir, 'skills', 'other-ext.hello'), { recursive: true });
      mkdirSync(join(agentDir, 'prompts'), { recursive: true });
      writeFileSync(join(agentDir, 'skills', 'other-ext.hello', 'SKILL.md'), '# Other');
      writeFileSync(join(agentDir, 'prompts', 'other-ext.other.prompt.md'), '# Other');

      cleanupAgentAssets(extensionDir, projectDir);

      expect(existsSync(join(agentDir, 'skills', 'test-ext.greet'))).toBe(false);
      expect(existsSync(join(agentDir, 'skills', 'other-ext.hello', 'SKILL.md'))).toBe(true);
      expect(existsSync(join(agentDir, 'prompts', 'other-ext.other.prompt.md'))).toBe(true);
    });

    it('should handle cleanup when deployed files are already missing', () => {
      writeManifest({
        ...baseManifest,
        agent: {
          prompts: ['agent/prompts/style.prompt.md'],
        },
      });

      expect(() => cleanupAgentAssets(extensionDir, projectDir)).not.toThrow();
    });

    it('should not error when .agents directory does not exist', () => {
      writeManifest(baseManifest);
      expect(() => cleanupAgentAssets(extensionDir, projectDir)).not.toThrow();
    });

    it('should throw when manifest.json is missing', () => {
      expect(() => cleanupAgentAssets(extensionDir, projectDir)).toThrow(/manifest\.json/);
    });

    it('should cleanup from custom agent directory when specified', () => {
      writeManifest({
        ...baseManifest,
        agent: {
          skills: [{ name: 'greet', path: 'skills/greet/SKILL.md' }],
          prompts: ['agent/prompts/style.prompt.md'],
        },
      });
      const agentDir = join(projectDir, '.github');
      mkdirSync(join(agentDir, 'skills', 'test-ext.greet'), { recursive: true });
      mkdirSync(join(agentDir, 'prompts'), { recursive: true });
      writeFileSync(join(agentDir, 'skills', 'test-ext.greet', 'SKILL.md'), '# Greet');
      writeFileSync(join(agentDir, 'prompts', 'test-ext.style.prompt.md'), '# Style');

      cleanupAgentAssets(extensionDir, projectDir, '.github');

      expect(existsSync(join(agentDir, 'skills', 'test-ext.greet'))).toBe(false);
      expect(existsSync(join(agentDir, 'prompts', 'test-ext.style.prompt.md'))).toBe(false);
    });
  });
});
