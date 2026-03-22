import { mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import deleteCommand from './delete.js';

function createTempProject(): string {
  const dir = join(tmpdir(), `file-editor-test-delete-${Date.now()}`);
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

describe('delete command', () => {
  let projectDir: string;

  beforeEach(() => {
    projectDir = createTempProject();
  });

  afterEach(() => {
    rmSync(projectDir, { recursive: true, force: true });
  });

  it('deletes a file', async () => {
    writeFileSync(join(projectDir, 'to-delete.txt'), 'bye');

    const result = await deleteCommand.handler(
      makeContext(projectDir, { path: 'to-delete.txt' }),
    );
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(0);
    expect(existsSync(join(projectDir, 'to-delete.txt'))).toBe(false);
  });

  it('deletes a directory recursively', async () => {
    mkdirSync(join(projectDir, 'dir', 'sub'), { recursive: true });
    writeFileSync(join(projectDir, 'dir', 'sub', 'file.txt'), '');

    const result = await deleteCommand.handler(
      makeContext(projectDir, { path: 'dir' }),
    );
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(0);
    expect(existsSync(join(projectDir, 'dir'))).toBe(false);
  });

  it('rejects non-existent paths', async () => {
    const result = await deleteCommand.handler(
      makeContext(projectDir, { path: 'ghost.txt' }),
    );
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(1);
    expect(output.output).toContain('does not exist');
  });

  it('rejects paths outside project directory', async () => {
    const result = await deleteCommand.handler(
      makeContext(projectDir, { path: '../../etc' }),
    );
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(1);
    expect(output.output).toContain('error');
  });

  it('rejects deleting project root', async () => {
    const result = await deleteCommand.handler(
      makeContext(projectDir, { path: '' }),
    );
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(1);
    expect(output.output).toContain('Cannot delete project root');
  });

  it('returns success with path', async () => {
    writeFileSync(join(projectDir, 'file.txt'), '');

    const result = await deleteCommand.handler(
      makeContext(projectDir, { path: 'file.txt' }),
    );
    const output = result as { output: string; exitCode: number };
    const data = JSON.parse(output.output) as { success: boolean; path: string };

    expect(data.success).toBe(true);
    expect(data.path).toBe('file.txt');
  });
});
