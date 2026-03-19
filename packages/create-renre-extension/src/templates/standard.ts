export function getStandardPackageJson(name: string): string {
  const pkg = {
    name,
    version: '0.0.1',
    description: `A RenreKit extension: ${name}`,
    type: 'module',
    main: './dist/index.js',
    types: './dist/index.d.ts',
    scripts: {
      build: 'tsc',
      dev: 'tsc --watch',
    },
    devDependencies: {
      typescript: '^5.7.0',
    },
  };
  return JSON.stringify(pkg, null, 2) + '\n';
}

export function getStandardManifest(name: string): string {
  const manifest = {
    name,
    version: '0.0.1',
    description: 'A RenreKit extension',
    type: 'standard',
    main: 'dist/index.js',
    engines: {
      'renre-kit': '>=0.0.1',
      'extension-sdk': '>=0.0.1',
    },
    commands: {
      hello: {
        handler: 'dist/commands/hello.js',
        description: 'Say hello',
      },
    },
  };
  return JSON.stringify(manifest, null, 2) + '\n';
}

export function getStandardEntryPoint(name: string): string {
  return `export function onInit(context: { projectDir: string }): void {
  console.log('${name} initialized in', context.projectDir);
}

export function onDestroy(context: { projectDir: string }): void {
  console.log('${name} destroyed in', context.projectDir);
}
`;
}

export function getStandardCommandHandler(name: string): string {
  return `interface ExecutionContext {
  projectName: string;
  projectPath: string;
  args: Record<string, unknown>;
  config: Record<string, unknown>;
}

export default function hello(_context: ExecutionContext): { output: string; exitCode: number } {
  return { output: 'Hello from ${name}!', exitCode: 0 };
}
`;
}

export { getTsconfig as getStandardTsconfig } from './shared.js';

export function getStandardSkillMd(name: string): string {
  return `---
name: hello
description: This tool should be used when the user wants to say hello or get a greeting from the ${name} extension
---

# ${name}

## Description

A RenreKit extension that provides additional functionality.

## Commands

### hello

Say hello from the extension.

**Usage:**
\`\`\`
renre ${name} hello
\`\`\`

## Configuration

No configuration required.
`;
}
