import { mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import renameCommand from './rename.js';

function createTempProject(): string {
  const dir = join(tmpdir(), `file-editor-test-rename-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function makeContext(projectPath: string, args: Record<string, unknown>) {
  return {
    projectName: 'test',
    projectPath,
    args,
    config: {},
  };
}

describe('rename command', () => {
  let projectDir: string;

  beforeEach(() => {
    projectDir = createTempProject();
  });

  afterEach(() => {
    rmSync(projectDir, { recursive: true, force: true });
  });

  it('renames a file', async () => {
    writeFileSync(join(projectDir, 'old.txt'), 'content');

    const result = await renameCommand.handler(
      makeContext(projectDir, { oldPath: 'old.txt', newPath: 'new.txt' }),
    );
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(0);
    expect(existsSync(join(projectDir, 'old.txt'))).toBe(false);
    expect(readFileSync(join(projectDir, 'new.txt'), 'utf-8')).toBe('content');
  });

  it('moves a file to a subdirectory', async () => {
    writeFileSync(join(projectDir, 'file.ts'), 'code');
    mkdirSync(join(projectDir, 'src'));

    const result = await renameCommand.handler(
      makeContext(projectDir, { oldPath: 'file.ts', newPath: 'src/file.ts' }),
    );
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(0);
    expect(existsSync(join(projectDir, 'src', 'file.ts'))).toBe(true);
  });

  it('creates parent directories for destination', async () => {
    writeFileSync(join(projectDir, 'file.txt'), 'data');

    const result = await renameCommand.handler(
      makeContext(projectDir, { oldPath: 'file.txt', newPath: 'deep/nested/file.txt' }),
    );
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(0);
    expect(readFileSync(join(projectDir, 'deep', 'nested', 'file.txt'), 'utf-8')).toBe('data');
  });

  it('renames a directory', async () => {
    mkdirSync(join(projectDir, 'old-dir'));
    writeFileSync(join(projectDir, 'old-dir', 'child.txt'), '');

    const result = await renameCommand.handler(
      makeContext(projectDir, { oldPath: 'old-dir', newPath: 'new-dir' }),
    );
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(0);
    expect(existsSync(join(projectDir, 'new-dir', 'child.txt'))).toBe(true);
  });

  it('rejects when source does not exist', async () => {
    const result = await renameCommand.handler(
      makeContext(projectDir, { oldPath: 'ghost.txt', newPath: 'new.txt' }),
    );
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(1);
    expect(output.output).toContain('does not exist');
  });

  it('rejects when destination already exists', async () => {
    writeFileSync(join(projectDir, 'a.txt'), '');
    writeFileSync(join(projectDir, 'b.txt'), '');

    const result = await renameCommand.handler(
      makeContext(projectDir, { oldPath: 'a.txt', newPath: 'b.txt' }),
    );
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(1);
    expect(output.output).toContain('already exists');
  });

  it('rejects source path outside project', async () => {
    const result = await renameCommand.handler(
      makeContext(projectDir, { oldPath: '../../etc/passwd', newPath: 'passwd' }),
    );
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(1);
  });

  it('rejects destination path outside project', async () => {
    writeFileSync(join(projectDir, 'file.txt'), '');

    const result = await renameCommand.handler(
      makeContext(projectDir, { oldPath: 'file.txt', newPath: '../../etc/evil' }),
    );
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(1);
  });

  it('returns old and new paths in response', async () => {
    writeFileSync(join(projectDir, 'before.txt'), '');

    const result = await renameCommand.handler(
      makeContext(projectDir, { oldPath: 'before.txt', newPath: 'after.txt' }),
    );
    const output = result as { output: string; exitCode: number };
    const data = JSON.parse(output.output) as { oldPath: string; newPath: string };

    expect(data.oldPath).toBe('before.txt');
    expect(data.newPath).toBe('after.txt');
  });
});
