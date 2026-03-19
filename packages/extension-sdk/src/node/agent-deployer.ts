import { readFileSync, existsSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';

interface SkillRef {
  name: string;
  path: string;
}

interface AgentAssets {
  skills?: SkillRef[];
  prompts?: string[];
  agents?: string[];
  workflows?: string[];
  context?: string[];
}

interface Manifest {
  name: string;
  agent?: AgentAssets;
}

const AGENT_CATEGORIES = ['skills', 'prompts', 'agents', 'workflows', 'context'] as const;

function readManifestName(extensionDir: string): Manifest {
  const manifestPath = join(extensionDir, 'manifest.json');
  if (!existsSync(manifestPath)) {
    throw new Error(`manifest.json not found in ${extensionDir}`);
  }
  const raw = readFileSync(manifestPath, 'utf-8');
  return JSON.parse(raw) as Manifest;
}

function copyFile(src: string, dest: string): void {
  if (!existsSync(src)) {
    return;
  }
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
}

function removeDir(dir: string): void {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Computes the relative path within a category directory.
 * Given a manifest path like "agent/prompts/api/style.prompt.md",
 * extracts the portion after "agent/{category}/" → "api/style.prompt.md".
 * This preserves subdirectory structure to prevent basename collisions.
 */
function getCategoryRelativePath(filePath: string, category: string): string {
  const categoryPrefix = `agent/${category}/`;
  const idx = filePath.indexOf(categoryPrefix);
  if (idx >= 0) {
    return filePath.substring(idx + categoryPrefix.length);
  }
  // Fallback: use path relative to first "agent/" occurrence
  const agentIdx = filePath.indexOf('agent/');
  if (agentIdx >= 0) {
    const afterAgent = filePath.substring(agentIdx + 6);
    // Strip category prefix if present (e.g., "prompts/file.md" → "file.md")
    const slashIdx = afterAgent.indexOf('/');
    if (slashIdx >= 0) {
      return afterAgent.substring(slashIdx + 1);
    }
    return afterAgent;
  }
  // Last resort: just the filename
  return relative('.', filePath).split('/').pop() ?? filePath;
}

/**
 * Deploys agent assets (skills, prompts, agents, workflows, context)
 * from an extension directory to the project's `.agents/` directory.
 *
 * Skills are deployed to `.agents/skills/{ext}/{skillName}/SKILL.md`.
 * Other assets preserve their relative path structure within the category:
 *   `.agents/{category}/{ext}/{relativePath}`
 *
 * File naming conventions:
 *   - Skills: `SKILL.md` (in named folder)
 *   - Prompts: `*.prompt.md`
 *   - Agents: `*.agent.md`
 *   - Workflows: `*.workflow.md`
 *   - Context: `*.context.md`
 */
export function deployAgentAssets(extensionDir: string, projectDir: string): void {
  const manifest = readManifestName(extensionDir);
  const agent = manifest.agent;
  if (!agent) {
    return;
  }

  const agentDir = join(projectDir, '.agents');
  const extName = manifest.name;

  if (agent.skills) {
    for (const skill of agent.skills) {
      copyFile(
        join(extensionDir, skill.path),
        join(agentDir, 'skills', extName, skill.name, 'SKILL.md'),
      );
    }
  }

  const fileArrayCategories = ['prompts', 'agents', 'workflows', 'context'] as const;
  for (const category of fileArrayCategories) {
    const paths = agent[category];
    if (!paths) {
      continue;
    }
    for (const filePath of paths) {
      const relativePath = getCategoryRelativePath(filePath, category);
      copyFile(
        join(extensionDir, filePath),
        join(agentDir, category, extName, relativePath),
      );
    }
  }
}

/**
 * Removes all agent assets deployed by an extension from the project's `.agents/` directory.
 */
export function cleanupAgentAssets(extensionDir: string, projectDir: string): void {
  const manifest = readManifestName(extensionDir);
  const agentDir = join(projectDir, '.agents');

  for (const category of AGENT_CATEGORIES) {
    removeDir(join(agentDir, category, manifest.name));
  }
}
