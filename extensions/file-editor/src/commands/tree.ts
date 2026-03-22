import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';

import { z, defineCommand } from '@renre-kit/extension-sdk/node';

interface TreeEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  extension?: string;
}

function loadGitignorePatterns(projectPath: string): string[] {
  try {
    const content = readFileSync(join(projectPath, '.gitignore'), 'utf-8');
    return content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'));
  } catch {
    return [];
  }
}

function matchesGlobPattern(name: string, pattern: string): boolean {
  // Convert simple glob pattern to regex
  const escaped = pattern
    .replace(/[$()+.[\\\]^{|}]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${escaped}$`).test(name);
}

function isIgnored(name: string, relPath: string, patterns: string[]): boolean {
  const alwaysIgnore = ['node_modules', '.git', 'dist', '.DS_Store', 'coverage'];
  if (alwaysIgnore.includes(name)) return true;

  for (const pattern of patterns) {
    const clean = pattern.replace(/\/$/, '');
    if (name === clean || relPath === clean || relPath.startsWith(clean + '/')) {
      return true;
    }
    // Glob pattern matching (e.g., *.log, *.js)
    if ((clean.includes('*') || clean.includes('?')) && matchesGlobPattern(name, clean)) {
      return true;
    }
  }
  return false;
}

function listDirectory(dirPath: string, projectPath: string, patterns: string[]): TreeEntry[] {
  const entries: TreeEntry[] = [];

  let dirEntries;
  try {
    dirEntries = readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return entries;
  }

  for (const entry of dirEntries) {
    if (entry.isSymbolicLink()) continue;

    const fullPath = join(dirPath, entry.name);
    const relPath = relative(projectPath, fullPath);

    if (isIgnored(entry.name, relPath, patterns)) continue;

    if (entry.isDirectory()) {
      entries.push({
        name: entry.name,
        path: relPath,
        type: 'directory',
      });
    } else if (entry.isFile()) {
      const stat = statSync(fullPath);
      const dotIdx = entry.name.lastIndexOf('.');
      entries.push({
        name: entry.name,
        path: relPath,
        type: 'file',
        size: stat.size,
        extension: dotIdx > 0 ? entry.name.slice(dotIdx + 1) : undefined,
      });
    }
  }

  // Directories first, then files, alphabetical within each group
  entries.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return entries;
}

export default defineCommand({
  args: {
    path: z.string().optional().default(''),
  },
  handler: (ctx) => {
    const projectPath = ctx.projectPath;
    const requestedPath = ctx.args.path || '';
    const targetDir = resolve(projectPath, requestedPath);

    // Security: ensure target is within project
    if (!targetDir.startsWith(resolve(projectPath))) {
      return { output: JSON.stringify({ error: 'Path outside project directory' }), exitCode: 1 };
    }

    const patterns = loadGitignorePatterns(projectPath);
    const entries = listDirectory(targetDir, projectPath, patterns);

    return {
      output: JSON.stringify(entries),
      exitCode: 0,
    };
  },
});
