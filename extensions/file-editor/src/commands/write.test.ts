import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import writeCommand from './write.js';

function createTempProject(): string {
  const dir = join(tmpdir(), `file-editor-test-write-${Date.now()}`);
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

describe('write command', () => {
  let projectDir: string;

  beforeEach(() => {
    projectDir = createTempProject();
  });

  afterEach(() => {
    rmSync(projectDir, { recursive: true, force: true });
  });

  it('writes content to a file', async () => {
    const result = await writeCommand.handler(
      makeContext(projectDir, { path: 'test.txt', content: 'hello world' }),
    );
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(0);

    const content = readFileSync(join(projectDir, 'test.txt'), 'utf-8');
    expect(content).toBe('hello world');
  });

  it('creates parent directories if needed', async () => {
    const result = await writeCommand.handler(
      makeContext(projectDir, { path: 'deep/nested/file.ts', content: 'const x = 1;' }),
    );
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(0);

    const content = readFileSync(join(projectDir, 'deep', 'nested', 'file.ts'), 'utf-8');
    expect(content).toBe('const x = 1;');
  });

  it('overwrites existing file', async () => {
    const filePath = join(projectDir, 'existing.txt');
    const { writeFileSync } = await import('node:fs');
    writeFileSync(filePath, 'old content');

    const result = await writeCommand.handler(
      makeContext(projectDir, { path: 'existing.txt', content: 'new content' }),
    );
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(0);

    const content = readFileSync(filePath, 'utf-8');
    expect(content).toBe('new content');
  });

  it('rejects paths outside project directory', async () => {
    const result = await writeCommand.handler(
      makeContext(projectDir, { path: '../../etc/hacked', content: 'bad' }),
    );
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(1);
    expect(output.output).toContain('error');
  });

  it('returns success with path in response', async () => {
    const result = await writeCommand.handler(
      makeContext(projectDir, { path: 'output.json', content: '{}' }),
    );
    const output = result as { output: string; exitCode: number };
    const data = JSON.parse(output.output) as { success: boolean; path: string };

    expect(data.success).toBe(true);
    expect(data.path).toBe('output.json');
  });
});
