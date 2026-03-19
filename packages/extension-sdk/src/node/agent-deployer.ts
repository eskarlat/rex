import {
  readFileSync,
  readdirSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  unlinkSync,
  copyFileSync,
} from 'node:fs';
import { join, dirname, basename } from 'node:path';

interface SkillRef {
  name: string;
  /** Path to skill directory relative to extension root. */
  path: string;
}

interface AgentAssets {
  skills?: SkillRef[];
  prompts?: string[];
  agents?: string[];
  workflows?: string[];
  context?: string[];
  hooks?: string[];
}

interface Manifest {
  name: string;
  agent?: AgentAssets;
}

/** Categories whose files may contain a YAML frontmatter `name` field to prefix. */
const FRONTMATTER_CATEGORIES = new Set(['prompts', 'agents']);

function readManifestName(extensionDir: string): Manifest {
  const manifestPath = join(extensionDir, 'manifest.json');
  if (!existsSync(manifestPath)) {
    throw new Error(`manifest.json not found in ${extensionDir}`);
  }
  const raw = readFileSync(manifestPath, 'utf-8');
  return JSON.parse(raw) as Manifest;
}

/**
 * Prefixes the `name` field in YAML frontmatter with `{extName}:`.
 * If no frontmatter or no `name` field exists, returns content unchanged.
 * Skips prefixing if the name is already prefixed with the extension name.
 */
function transformFrontmatterName(content: string, extName: string): string {
  const firstLineBreak = content.startsWith('---\r\n') ? '\r\n' : '\n';
  const fmEnd = content.indexOf(`${firstLineBreak}---`, 3 + firstLineBreak.length);
  if ((!content.startsWith('---\n') && !content.startsWith('---\r\n')) || fmEnd === -1) {
    return content;
  }

  const headerLen = 3 + firstLineBreak.length; // '---' + linebreak
  const frontmatter = content.substring(headerLen, fmEnd);
  const lines = frontmatter.split(/\r?\n/);
  let transformed = false;

  const updatedLines = lines.map((line) => {
    const namePrefix = 'name:';
    if (!line.startsWith(namePrefix)) {
      return line;
    }
    const value = line.substring(namePrefix.length).trim();
    if (value.startsWith(`${extName}.`)) {
      return line;
    }
    transformed = true;
    return `name: ${extName}.${value}`;
  });

  if (!transformed) {
    return content;
  }

  return `---${firstLineBreak}${updatedLines.join(firstLineBreak)}${content.substring(fmEnd)}`;
}

/**
 * Deploys a file with optional frontmatter name transformation.
 * For categories in FRONTMATTER_CATEGORIES (and skills), the `name` field
 * in YAML frontmatter gets prefixed with `{extName}:`.
 */
function deployFile(
  src: string,
  dest: string,
  extName: string,
  transformName: boolean,
): void {
  if (!existsSync(src)) {
    return;
  }
  mkdirSync(dirname(dest), { recursive: true });

  if (transformName) {
    const content = readFileSync(src, 'utf-8');
    const transformed = transformFrontmatterName(content, extName);
    writeFileSync(dest, transformed);
  } else {
    copyFileSync(src, dest);
  }
}

/**
 * Recursively deploys a skill directory.
 * SKILL.md gets frontmatter name transform; all other files are plain-copied.
 */
function deploySkillDirectory(srcDir: string, destDir: string, extName: string): void {
  if (!existsSync(srcDir)) {
    return;
  }
  const entries = readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name);
    const destPath = join(destDir, entry.name);
    if (entry.isDirectory()) {
      deploySkillDirectory(srcPath, destPath, extName);
    } else if (entry.name === 'SKILL.md') {
      deployFile(srcPath, destPath, extName, true);
    } else {
      mkdirSync(dirname(destPath), { recursive: true });
      copyFileSync(srcPath, destPath);
    }
  }
}

function removeDir(dir: string): void {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
}

function removeFile(filePath: string): void {
  if (existsSync(filePath)) {
    unlinkSync(filePath);
  }
}

/**
 * Gets the basename of a file from a manifest path.
 * e.g., "agent/prompts/style.prompt.md" → "style.prompt.md"
 */
function getFileBasename(filePath: string): string {
  return basename(filePath);
}

/**
 * Deploys agent assets (skills, prompts, agents, workflows, context, hooks)
 * from an extension directory to the project's `.agents/` directory.
 *
 * All filenames are prefixed with `{extensionName}.` for uniqueness.
 * Skills: `.agents/skills/{ext}.{skill}/SKILL.md`
 * Others: `.agents/{category}/{ext}.{basename}`
 *
 * Files in skills, prompts, and agents categories have their frontmatter
 * `name` field prefixed with `{extensionName}.`.
 */
export function deployAgentAssets(
  extensionDir: string,
  projectDir: string,
  agentDirName = '.agents',
): void {
  const manifest = readManifestName(extensionDir);
  const agent = manifest.agent;
  if (!agent) {
    return;
  }

  const agentDir = join(projectDir, agentDirName);
  const extName = manifest.name;

  if (agent.skills) {
    for (const skill of agent.skills) {
      const srcDir = join(extensionDir, skill.path);
      const destDir = join(agentDir, 'skills', `${extName}.${skill.name}`);
      deploySkillDirectory(srcDir, destDir, extName);
    }
  }

  const fileArrayCategories = ['prompts', 'agents', 'workflows', 'context', 'hooks'] as const;
  for (const category of fileArrayCategories) {
    const paths = agent[category];
    if (!paths) {
      continue;
    }
    const shouldTransform = FRONTMATTER_CATEGORIES.has(category);
    for (const filePath of paths) {
      const fileName = getFileBasename(filePath);
      deployFile(
        join(extensionDir, filePath),
        join(agentDir, category, `${extName}.${fileName}`),
        extName,
        shouldTransform,
      );
    }
  }
}

/**
 * Removes all agent assets deployed by an extension from the project's `.agents/` directory.
 */
export function cleanupAgentAssets(
  extensionDir: string,
  projectDir: string,
  agentDirName = '.agents',
): void {
  const manifest = readManifestName(extensionDir);
  const agentDir = join(projectDir, agentDirName);
  const extName = manifest.name;

  if (manifest.agent?.skills) {
    for (const skill of manifest.agent.skills) {
      removeDir(join(agentDir, 'skills', `${extName}.${skill.name}`));
    }
  }

  const fileArrayCategories = ['prompts', 'agents', 'workflows', 'context', 'hooks'] as const;
  for (const category of fileArrayCategories) {
    const paths = manifest.agent?.[category];
    if (!paths) {
      continue;
    }
    for (const filePath of paths) {
      const fileName = getFileBasename(filePath);
      removeFile(join(agentDir, category, `${extName}.${fileName}`));
    }
  }
}
