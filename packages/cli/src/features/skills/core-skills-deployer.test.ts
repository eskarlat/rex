import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { deployCoreSkills, cleanupCoreSkills, CORE_SKILL_CONTENT } from './core-skills-deployer.js';

describe('core-skills-deployer', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'renre-core-skills-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('deployCoreSkills', () => {
    it('creates .agents/skills/cli/SKILL.md', () => {
      deployCoreSkills(tmpDir);

      const skillPath = path.join(tmpDir, '.agents', 'skills', 'cli', 'SKILL.md');
      expect(fs.existsSync(skillPath)).toBe(true);
    });

    it('writes valid SKILL.md content with frontmatter', () => {
      deployCoreSkills(tmpDir);

      const skillPath = path.join(tmpDir, '.agents', 'skills', 'cli', 'SKILL.md');
      const content = fs.readFileSync(skillPath, 'utf-8');

      expect(content).toContain('---');
      expect(content).toContain('name: cli');
      expect(content).toContain('description:');
    });

    it('includes all command categories in the skill content', () => {
      expect(CORE_SKILL_CONTENT).toContain('## Project Commands');
      expect(CORE_SKILL_CONTENT).toContain('## Extension Commands');
      expect(CORE_SKILL_CONTENT).toContain('## Registry Commands');
      expect(CORE_SKILL_CONTENT).toContain('## Vault Commands');
      expect(CORE_SKILL_CONTENT).toContain('## Scheduler Commands');
      expect(CORE_SKILL_CONTENT).toContain('## Dashboard Commands');
    });

    it('documents key built-in commands', () => {
      expect(CORE_SKILL_CONTENT).toContain('renre-kit init');
      expect(CORE_SKILL_CONTENT).toContain('renre-kit destroy');
      expect(CORE_SKILL_CONTENT).toContain('ext:add');
      expect(CORE_SKILL_CONTENT).toContain('ext:remove');
      expect(CORE_SKILL_CONTENT).toContain('ext:list');
      expect(CORE_SKILL_CONTENT).toContain('ext:activate');
      expect(CORE_SKILL_CONTENT).toContain('ext:deactivate');
      expect(CORE_SKILL_CONTENT).toContain('registry:search');
      expect(CORE_SKILL_CONTENT).toContain('registry:sync');
      expect(CORE_SKILL_CONTENT).toContain('vault:set');
      expect(CORE_SKILL_CONTENT).toContain('vault:list');
      expect(CORE_SKILL_CONTENT).toContain('capabilities');
    });

    it('is idempotent — calling twice does not fail', () => {
      deployCoreSkills(tmpDir);
      deployCoreSkills(tmpDir);

      const skillPath = path.join(tmpDir, '.agents', 'skills', 'cli', 'SKILL.md');
      expect(fs.existsSync(skillPath)).toBe(true);
    });

    it('creates directories recursively when .agents does not exist', () => {
      expect(fs.existsSync(path.join(tmpDir, '.agents'))).toBe(false);
      deployCoreSkills(tmpDir);
      expect(fs.existsSync(path.join(tmpDir, '.agents', 'skills', 'cli'))).toBe(true);
    });
  });

  describe('cleanupCoreSkills', () => {
    it('removes the renre-kit skills directory', () => {
      deployCoreSkills(tmpDir);
      const renreKitDir = path.join(tmpDir, '.agents', 'skills', 'cli');
      expect(fs.existsSync(renreKitDir)).toBe(true);

      cleanupCoreSkills(tmpDir);
      expect(fs.existsSync(renreKitDir)).toBe(false);
    });

    it('does not fail when .agents directory does not exist', () => {
      expect(() => cleanupCoreSkills(tmpDir)).not.toThrow();
    });

    it('does not fail when renre-kit directory does not exist', () => {
      fs.mkdirSync(path.join(tmpDir, '.agents', 'skills'), { recursive: true });
      expect(() => cleanupCoreSkills(tmpDir)).not.toThrow();
    });

    it('does not remove other extension skill directories', () => {
      deployCoreSkills(tmpDir);

      const otherExtDir = path.join(tmpDir, '.agents', 'skills', 'other-ext');
      fs.mkdirSync(otherExtDir, { recursive: true });
      fs.writeFileSync(path.join(otherExtDir, 'SKILL.md'), 'Other skill');

      cleanupCoreSkills(tmpDir);

      expect(fs.existsSync(otherExtDir)).toBe(true);
      expect(fs.readFileSync(path.join(otherExtDir, 'SKILL.md'), 'utf-8')).toBe('Other skill');
    });
  });
});
