import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { aggregateSkills } from './capabilities-aggregator.js';

describe('capabilities-aggregator', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'renre-skills-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns empty string with message when no skills directory exists', () => {
    const result = aggregateSkills(tmpDir);
    expect(result).toBe('No skills found.');
  });

  it('returns empty string with message when skills directory is empty', () => {
    const skillsDir = path.join(tmpDir, '.agent', 'skills');
    fs.mkdirSync(skillsDir, { recursive: true });
    const result = aggregateSkills(tmpDir);
    expect(result).toBe('No skills found.');
  });

  it('returns empty string with message when skill dirs exist but no SKILL.md', () => {
    const extDir = path.join(tmpDir, '.agent', 'skills', 'my-ext');
    fs.mkdirSync(extDir, { recursive: true });
    const result = aggregateSkills(tmpDir);
    expect(result).toBe('No skills found.');
  });

  it('aggregates a single skill file', () => {
    const extDir = path.join(tmpDir, '.agent', 'skills', 'my-ext');
    fs.mkdirSync(extDir, { recursive: true });
    fs.writeFileSync(path.join(extDir, 'SKILL.md'), '# My Skill\nDoes things.');

    const result = aggregateSkills(tmpDir);
    expect(result).toContain('## my-ext');
    expect(result).toContain('# My Skill');
    expect(result).toContain('Does things.');
  });

  it('aggregates multiple skill files with delimiters', () => {
    const ext1Dir = path.join(tmpDir, '.agent', 'skills', 'alpha-ext');
    const ext2Dir = path.join(tmpDir, '.agent', 'skills', 'beta-ext');
    fs.mkdirSync(ext1Dir, { recursive: true });
    fs.mkdirSync(ext2Dir, { recursive: true });
    fs.writeFileSync(path.join(ext1Dir, 'SKILL.md'), 'Alpha skill content');
    fs.writeFileSync(path.join(ext2Dir, 'SKILL.md'), 'Beta skill content');

    const result = aggregateSkills(tmpDir);
    expect(result).toContain('## alpha-ext');
    expect(result).toContain('Alpha skill content');
    expect(result).toContain('## beta-ext');
    expect(result).toContain('Beta skill content');
  });

  it('skips directories without SKILL.md', () => {
    const ext1Dir = path.join(tmpDir, '.agent', 'skills', 'has-skill');
    const ext2Dir = path.join(tmpDir, '.agent', 'skills', 'no-skill');
    fs.mkdirSync(ext1Dir, { recursive: true });
    fs.mkdirSync(ext2Dir, { recursive: true });
    fs.writeFileSync(path.join(ext1Dir, 'SKILL.md'), 'Has skill content');
    fs.writeFileSync(path.join(ext2Dir, 'README.md'), 'Not a skill');

    const result = aggregateSkills(tmpDir);
    expect(result).toContain('## has-skill');
    expect(result).toContain('Has skill content');
    expect(result).not.toContain('no-skill');
  });

  it('ignores files in the skills directory (not dirs)', () => {
    const skillsDir = path.join(tmpDir, '.agent', 'skills');
    fs.mkdirSync(skillsDir, { recursive: true });
    // Create a file directly in skills dir (not a subdirectory)
    fs.writeFileSync(path.join(skillsDir, 'some-file.txt'), 'not a dir');
    // Create a valid skill dir too
    const extDir = path.join(skillsDir, 'valid-ext');
    fs.mkdirSync(extDir, { recursive: true });
    fs.writeFileSync(path.join(extDir, 'SKILL.md'), 'Valid skill');

    const result = aggregateSkills(tmpDir);
    expect(result).toContain('valid-ext');
    expect(result).not.toContain('some-file');
  });

  it('uses separator between multiple skills', () => {
    const ext1Dir = path.join(tmpDir, '.agent', 'skills', 'first');
    const ext2Dir = path.join(tmpDir, '.agent', 'skills', 'second');
    fs.mkdirSync(ext1Dir, { recursive: true });
    fs.mkdirSync(ext2Dir, { recursive: true });
    fs.writeFileSync(path.join(ext1Dir, 'SKILL.md'), 'First content');
    fs.writeFileSync(path.join(ext2Dir, 'SKILL.md'), 'Second content');

    const result = aggregateSkills(tmpDir);
    // Should have separator between entries
    const parts = result.split('---');
    expect(parts.length).toBeGreaterThanOrEqual(2);
  });
});
