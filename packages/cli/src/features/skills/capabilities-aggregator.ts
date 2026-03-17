import fs from 'node:fs';
import path from 'node:path';

const SKILLS_SUBDIR = path.join('.agent', 'skills');
const SKILL_FILE = 'SKILL.md';

export function aggregateSkills(projectPath: string): string {
  const skillsDir = path.join(projectPath, SKILLS_SUBDIR);

  if (!fs.existsSync(skillsDir)) {
    return 'No skills found.';
  }

  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  const sections: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const skillPath = path.join(skillsDir, entry.name, SKILL_FILE);
    if (!fs.existsSync(skillPath)) {
      continue;
    }
    const content = fs.readFileSync(skillPath, 'utf-8');
    sections.push(`## ${entry.name}\n\n${content}`);
  }

  if (sections.length === 0) {
    return 'No skills found.';
  }

  return sections.join('\n\n---\n\n');
}
