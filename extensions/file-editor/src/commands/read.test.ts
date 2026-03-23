import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import readCommand from './read.js';

function createTempProject(): string {
  const dir = join(tmpdir(), `file-editor-test-read-${Date.now()}`);
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

describe('read command', () => {
  let projectDir: string;

  beforeEach(() => {
    projectDir = createTempProject();
  });

  afterEach(() => {
    rmSync(projectDir, { recursive: true, force: true });
  });

  it('reads file content and detects TypeScript language', async () => {
    writeFileSync(join(projectDir, 'index.ts'), 'const x = 1;');

    const result = await readCommand.handler(makeContext(projectDir, { path: 'index.ts' }));
    const output = result as { output: string; exitCode: number };
    const data = JSON.parse(output.output) as { content: string; language: string };

    expect(output.exitCode).toBe(0);
    expect(data.content).toBe('const x = 1;');
    expect(data.language).toBe('typescript');
  });

  it('detects JavaScript language', async () => {
    writeFileSync(join(projectDir, 'app.js'), '');

    const result = await readCommand.handler(makeContext(projectDir, { path: 'app.js' }));
    const output = result as { output: string; exitCode: number };
    const data = JSON.parse(output.output) as { language: string };

    expect(data.language).toBe('javascript');
  });

  it('detects JSON language', async () => {
    writeFileSync(join(projectDir, 'data.json'), '{}');

    const result = await readCommand.handler(makeContext(projectDir, { path: 'data.json' }));
    const output = result as { output: string; exitCode: number };
    const data = JSON.parse(output.output) as { language: string };

    expect(data.language).toBe('json');
  });

  it('detects Python language', async () => {
    writeFileSync(join(projectDir, 'script.py'), 'print("hi")');

    const result = await readCommand.handler(makeContext(projectDir, { path: 'script.py' }));
    const output = result as { output: string; exitCode: number };
    const data = JSON.parse(output.output) as { language: string };

    expect(data.language).toBe('python');
  });

  it('returns plaintext for unknown extensions', async () => {
    writeFileSync(join(projectDir, 'data.xyz'), 'unknown');

    const result = await readCommand.handler(makeContext(projectDir, { path: 'data.xyz' }));
    const output = result as { output: string; exitCode: number };
    const data = JSON.parse(output.output) as { language: string };

    expect(data.language).toBe('plaintext');
  });

  it('detects Dockerfile', async () => {
    writeFileSync(join(projectDir, 'Dockerfile'), 'FROM node:20');

    const result = await readCommand.handler(makeContext(projectDir, { path: 'Dockerfile' }));
    const output = result as { output: string; exitCode: number };
    const data = JSON.parse(output.output) as { language: string };

    expect(data.language).toBe('dockerfile');
  });

  it('rejects paths outside project directory', async () => {
    const result = await readCommand.handler(makeContext(projectDir, { path: '../../etc/passwd' }));
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(1);
    expect(output.output).toContain('error');
  });

  it('rejects prefix-bypass paths (e.g. project-evil)', async () => {
    const result = await readCommand.handler(
      makeContext(projectDir, { path: `../${projectDir.split('/').pop()}-evil/secret` }),
    );
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(1);
    expect(output.output).toContain('error');
  });

  it('returns error for non-existent file', async () => {
    const result = await readCommand.handler(makeContext(projectDir, { path: 'missing.ts' }));
    const output = result as { output: string; exitCode: number };

    expect(output.exitCode).toBe(1);
    expect(output.output).toContain('error');
  });

  it('detects CSS language', async () => {
    writeFileSync(join(projectDir, 'style.css'), 'body {}');

    const result = await readCommand.handler(makeContext(projectDir, { path: 'style.css' }));
    const output = result as { output: string; exitCode: number };
    const data = JSON.parse(output.output) as { language: string };

    expect(data.language).toBe('css');
  });

  it('detects markdown language', async () => {
    writeFileSync(join(projectDir, 'README.md'), '# Hello');

    const result = await readCommand.handler(makeContext(projectDir, { path: 'README.md' }));
    const output = result as { output: string; exitCode: number };
    const data = JSON.parse(output.output) as { language: string };

    expect(data.language).toBe('markdown');
  });

  it('detects shell language', async () => {
    writeFileSync(join(projectDir, 'run.sh'), '#!/bin/bash');

    const result = await readCommand.handler(makeContext(projectDir, { path: 'run.sh' }));
    const output = result as { output: string; exitCode: number };
    const data = JSON.parse(output.output) as { language: string };

    expect(data.language).toBe('shell');
  });

  it('detects YAML language', async () => {
    writeFileSync(join(projectDir, 'config.yml'), 'key: value');

    const result = await readCommand.handler(makeContext(projectDir, { path: 'config.yml' }));
    const output = result as { output: string; exitCode: number };
    const data = JSON.parse(output.output) as { language: string };

    expect(data.language).toBe('yaml');
  });
});
