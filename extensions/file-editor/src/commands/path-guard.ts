import { relative, resolve, sep } from 'node:path';

/**
 * Check if a target path is safely contained within a base directory.
 * Uses path.relative to avoid prefix-bypass attacks
 * (e.g., /proj vs /proj-evil both start with "/proj").
 */
export function isInsideProject(basePath: string, targetPath: string): boolean {
  const resolvedBase = resolve(basePath) + sep;
  const resolvedTarget = resolve(targetPath);

  // Exact match (target IS the base dir)
  if (resolvedTarget === resolve(basePath)) return true;

  const rel = relative(resolve(basePath), resolvedTarget);
  // If relative path starts with ".." or is absolute, it's outside
  return !rel.startsWith('..') && !rel.startsWith(sep);
}
