import { readFileSync, statSync } from 'node:fs';
import { resolve, extname } from 'node:path';

import { isInsideProject } from './path-guard.js';

import { z, defineCommand } from '@renre-kit/extension-sdk/node';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.json': 'json',
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.less': 'less',
  '.md': 'markdown',
  '.mdx': 'markdown',
  '.py': 'python',
  '.rb': 'ruby',
  '.rs': 'rust',
  '.go': 'go',
  '.java': 'java',
  '.kt': 'kotlin',
  '.swift': 'swift',
  '.c': 'c',
  '.cpp': 'cpp',
  '.h': 'c',
  '.hpp': 'cpp',
  '.cs': 'csharp',
  '.php': 'php',
  '.sql': 'sql',
  '.sh': 'shell',
  '.bash': 'shell',
  '.zsh': 'shell',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.toml': 'toml',
  '.xml': 'xml',
  '.svg': 'xml',
  '.graphql': 'graphql',
  '.gql': 'graphql',
  '.dockerfile': 'dockerfile',
  '.lua': 'lua',
  '.r': 'r',
  '.vue': 'html',
  '.svelte': 'html',
};

function detectLanguage(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  if (EXTENSION_TO_LANGUAGE[ext]) return EXTENSION_TO_LANGUAGE[ext];

  const name = filePath.split('/').pop()?.toLowerCase() ?? '';
  if (name === 'dockerfile') return 'dockerfile';
  if (name === 'makefile') return 'makefile';
  if (name === '.gitignore' || name === '.env') return 'plaintext';

  return 'plaintext';
}

export default defineCommand({
  args: {
    path: z.string(),
  },
  handler: (ctx) => {
    const projectPath = ctx.projectPath;
    const filePath = resolve(projectPath, ctx.args.path);

    if (!isInsideProject(projectPath, filePath)) {
      return { output: JSON.stringify({ error: 'Path outside project directory' }), exitCode: 1 };
    }

    try {
      const stat = statSync(filePath);
      if (stat.size > MAX_FILE_SIZE) {
        return {
          output: JSON.stringify({ error: 'File too large (max 5MB)' }),
          exitCode: 1,
        };
      }

      const content = readFileSync(filePath, 'utf-8');
      const language = detectLanguage(filePath);

      return {
        output: JSON.stringify({ content, language }),
        exitCode: 0,
      };
    } catch {
      return {
        output: JSON.stringify({ error: 'Failed to read file' }),
        exitCode: 1,
      };
    }
  },
});
