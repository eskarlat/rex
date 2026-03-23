import { mkdirSync, existsSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import createCommand from './create.js';

function createTempProject(): string {
  const dir = join(tmpdir(), `file-editor-test-create-${Date.now()}`);
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

describe('create command', () => {
  let projectDir: string;

  beforeEach(() => {
    projectDir = createTempProject();
  });

  afterEach(() => {
    rmSync(projectDir, { recursive: true, force: true });
  });

  it('creates a new file', async () => {
    const result = await createCommand.handler(
      makeContext(projectDir, { path: 'new-file.ts', type: 'file' }),
    );
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(0);
    expect(existsSync(join(projectDir, 'new-file.ts'))).toBe(true);
  });

  it('creates a new directory', async () => {
    const result = await createCommand.handler(
      makeContext(projectDir, { path: 'new-dir', type: 'directory' }),
    );
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(0);
    expect(statSync(join(projectDir, 'new-dir')).isDirectory()).toBe(true);
  });

  it('creates nested directories', async () => {
    const result = await createCommand.handler(
      makeContext(projectDir, { path: 'a/b/c', type: 'directory' }),
    );
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(0);
    expect(statSync(join(projectDir, 'a', 'b', 'c')).isDirectory()).toBe(true);
  });

  it('creates file with nested parent directories', async () => {
    const result = await createCommand.handler(
      makeContext(projectDir, { path: 'deep/nested/file.txt', type: 'file' }),
    );
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(0);
    expect(existsSync(join(projectDir, 'deep', 'nested', 'file.txt'))).toBe(true);
  });

  it('rejects if path already exists', async () => {
    writeFileSync(join(projectDir, 'exists.txt'), '');

    const result = await createCommand.handler(
      makeContext(projectDir, { path: 'exists.txt', type: 'file' }),
    );
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(1);
    expect(output.output).toContain('already exists');
  });

  it('rejects paths outside project directory', async () => {
    const result = await createCommand.handler(
      makeContext(projectDir, { path: '../../evil', type: 'file' }),
    );
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(1);
    expect(output.output).toContain('error');
  });

  it('returns type in response', async () => {
    const result = await createCommand.handler(
      makeContext(projectDir, { path: 'test-dir', type: 'directory' }),
    );
    const output = result as { output: string; exitCode: number };
    const data = JSON.parse(output.output) as { type: string };

    expect(data.type).toBe('directory');
  });
});
