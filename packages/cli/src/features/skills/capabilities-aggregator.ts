import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_AGENT_DIR = '.agents';
const SKILL_FILE = 'SKILL.md';

/**
 * Collect all SKILL.md files from an extension's skills directory.
 * Handles both single-skill layout (SKILL.md at root) and
 * multi-skill layout (subdirectories each containing SKILL.md).
 */
function collectSkillFiles(
  extensionDir: string,
  extensionName: string,
): string[] {
  const sections: string[] = [];

  // Check for single SKILL.md at the extension directory root
  const rootSkillPath = path.join(extensionDir, SKILL_FILE);
  if (fs.existsSync(rootSkillPath)) {
    const content = fs.readFileSync(rootSkillPath, 'utf-8');
    sections.push(`## ${extensionName}\n\n${content}`);
  }

  // Check for nested skill directories (multi-skill)
  const subEntries = fs.readdirSync(extensionDir, { withFileTypes: true });
  for (const sub of subEntries) {
    if (!sub.isDirectory()) {
      continue;
    }
    const nestedSkillPath = path.join(extensionDir, sub.name, SKILL_FILE);
    if (!fs.existsSync(nestedSkillPath)) {
      continue;
    }
    const content = fs.readFileSync(nestedSkillPath, 'utf-8');
    sections.push(`## ${extensionName}/${sub.name}\n\n${content}`);
  }

  return sections;
}

export function aggregateSkills(projectPath: string, agentDir = DEFAULT_AGENT_DIR): string {
  const skillsDir = path.join(projectPath, agentDir, 'skills');

  if (!fs.existsSync(skillsDir)) {
    return 'No skills found.';
  }

  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  const sections: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const extSkillDir = path.join(skillsDir, entry.name);
    const collected = collectSkillFiles(extSkillDir, entry.name);
    sections.push(...collected);
  }

  if (sections.length === 0) {
    return 'No skills found.';
  }

  return sections.join('\n\n---\n\n');
}
