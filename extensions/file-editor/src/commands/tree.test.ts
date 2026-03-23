import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import treeCommand from './tree.js';

function createTempProject(): string {
  const dir = join(tmpdir(), `file-editor-test-tree-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function makeContext(projectPath: string, args: Record<string, unknown> = {}) {
  return {
    projectName: 'test',
    projectPath,
    args: { path: '', ...args },
    config: {},
  };
}

describe('tree command', () => {
  let projectDir: string;

  beforeEach(() => {
    projectDir = createTempProject();
  });

  afterEach(() => {
    rmSync(projectDir, { recursive: true, force: true });
  });

  it('lists files and directories in the root', async () => {
    writeFileSync(join(projectDir, 'file.txt'), 'hello');
    mkdirSync(join(projectDir, 'src'));

    const result = await treeCommand.handler(makeContext(projectDir));
    const output = result as { output: string; exitCode: number };
    const entries = JSON.parse(output.output) as Array<{ name: string; type: string }>;

    expect(output.exitCode).toBe(0);
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({ name: 'src', type: 'directory' });
    expect(entries[1]).toMatchObject({ name: 'file.txt', type: 'file' });
  });

  it('sorts directories before files', async () => {
    writeFileSync(join(projectDir, 'a.txt'), '');
    mkdirSync(join(projectDir, 'z-dir'));
    writeFileSync(join(projectDir, 'b.txt'), '');

    const result = await treeCommand.handler(makeContext(projectDir));
    const output = result as { output: string; exitCode: number };
    const entries = JSON.parse(output.output) as Array<{ name: string; type: string }>;

    expect(entries[0]?.type).toBe('directory');
    expect(entries[1]?.type).toBe('file');
  });

  it('ignores node_modules and .git', async () => {
    mkdirSync(join(projectDir, 'node_modules'));
    mkdirSync(join(projectDir, '.git'));
    writeFileSync(join(projectDir, 'file.txt'), '');

    const result = await treeCommand.handler(makeContext(projectDir));
    const output = result as { output: string; exitCode: number };
    const entries = JSON.parse(output.output) as Array<{ name: string }>;

    expect(entries).toHaveLength(1);
    expect(entries[0]?.name).toBe('file.txt');
  });

  it('respects .gitignore patterns', async () => {
    writeFileSync(join(projectDir, '.gitignore'), 'build\n*.log\n');
    mkdirSync(join(projectDir, 'build'));
    writeFileSync(join(projectDir, 'app.log'), '');
    writeFileSync(join(projectDir, 'index.ts'), '');

    const result = await treeCommand.handler(makeContext(projectDir));
    const output = result as { output: string; exitCode: number };
    const entries = JSON.parse(output.output) as Array<{ name: string }>;

    const names = entries.map((e) => e.name);
    expect(names).not.toContain('build');
    expect(names).not.toContain('app.log');
    expect(names).toContain('index.ts');
  });

  it('lists subdirectory contents', async () => {
    mkdirSync(join(projectDir, 'src'));
    writeFileSync(join(projectDir, 'src', 'index.ts'), '');

    const result = await treeCommand.handler(makeContext(projectDir, { path: 'src' }));
    const output = result as { output: string; exitCode: number };
    const entries = JSON.parse(output.output) as Array<{ name: string }>;

    expect(entries).toHaveLength(1);
    expect(entries[0]?.name).toBe('index.ts');
  });

  it('rejects paths outside project directory', async () => {
    const result = await treeCommand.handler(makeContext(projectDir, { path: '../../etc' }));
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(1);
    expect(output.output).toContain('error');
  });

  it('returns empty array for non-existent directory', async () => {
    const result = await treeCommand.handler(makeContext(projectDir, { path: 'nonexistent' }));
    const output = result as { output: string; exitCode: number };
    const entries = JSON.parse(output.output) as Array<unknown>;

    expect(entries).toHaveLength(0);
  });

  it('includes file extension and size', async () => {
    writeFileSync(join(projectDir, 'main.ts'), 'const x = 1;');

    const result = await treeCommand.handler(makeContext(projectDir));
    const output = result as { output: string; exitCode: number };
    const entries = JSON.parse(output.output) as Array<{ extension?: string; size?: number }>;

    expect(entries[0]?.extension).toBe('ts');
    expect(entries[0]?.size).toBeGreaterThan(0);
  });

  it('handles empty directory', async () => {
    const result = await treeCommand.handler(makeContext(projectDir));
    const output = result as { output: string; exitCode: number };
    const entries = JSON.parse(output.output) as Array<unknown>;

    expect(output.exitCode).toBe(0);
    expect(entries).toHaveLength(0);
  });
});
