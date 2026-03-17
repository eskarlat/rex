import { readFileSync, existsSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';

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
 * Deploys agent assets (skills, prompts, agents, workflows, context)
 * from an extension directory to the project's `.agent/` directory.
 *
 * Reads the extension's `manifest.json` to discover which assets to deploy.
 *
 * @param extensionDir - Root directory of the extension (contains manifest.json)
 * @param projectDir - Root directory of the project (`.agent/` will be created here)
 */
export function deployAgentAssets(extensionDir: string, projectDir: string): void {
  const manifest = readManifestName(extensionDir);
  const agent = manifest.agent;
  if (!agent) {
    return;
  }

  const agentDir = join(projectDir, '.agent');
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
      copyFile(
        join(extensionDir, filePath),
        join(agentDir, category, extName, basename(filePath)),
      );
    }
  }
}

/**
 * Removes all agent assets deployed by an extension from the project's `.agent/` directory.
 *
 * Reads the extension's `manifest.json` to get the extension name,
 * then removes `{category}/{extensionName}/` for each agent category.
 *
 * @param extensionDir - Root directory of the extension (contains manifest.json)
 * @param projectDir - Root directory of the project
 */
export function cleanupAgentAssets(extensionDir: string, projectDir: string): void {
  const manifest = readManifestName(extensionDir);
  const agentDir = join(projectDir, '.agent');

  for (const category of AGENT_CATEGORIES) {
    removeDir(join(agentDir, category, manifest.name));
  }
}
