import { join } from 'node:path';

import { isInsideProject } from './path-guard.js';

describe('isInsideProject', () => {
  it('allows paths inside the project', () => {
    expect(isInsideProject('/proj', '/proj/src/file.ts')).toBe(true);
  });

  it('allows the project root itself', () => {
    expect(isInsideProject('/proj', '/proj')).toBe(true);
  });

  it('rejects parent directory traversal', () => {
    expect(isInsideProject('/proj', '/proj/../etc/passwd')).toBe(false);
  });

  it('rejects prefix-bypass paths (e.g. /proj-evil)', () => {
    expect(isInsideProject('/proj', '/proj-evil/secret')).toBe(false);
  });

  it('rejects absolute paths outside project', () => {
    expect(isInsideProject('/proj', '/etc/passwd')).toBe(false);
  });

  it('allows nested subdirectories', () => {
    expect(isInsideProject('/proj', join('/proj', 'a', 'b', 'c.txt'))).toBe(true);
  });
});
