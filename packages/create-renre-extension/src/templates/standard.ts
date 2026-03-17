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
    commands: {
      hello: {
        handler: 'handleHello',
        description: 'Say hello',
      },
    },
    hooks: {
      onInit: 'src/index.js',
      onDestroy: 'src/index.js',
    },
    skills: 'SKILL.md',
  };
  return JSON.stringify(manifest, null, 2) + '\n';
}

export function getStandardEntryPoint(name: string): string {
  return `export function onInit(context: Record<string, unknown>): void {
  console.log('${name} initialized');
}

export function onDestroy(context: Record<string, unknown>): void {
  console.log('${name} destroyed');
}

export const commands = {
  hello: {
    handler: 'handleHello',
    description: 'Say hello',
  },
};

export function handleHello(_context: Record<string, unknown>): { output: string; exitCode: number } {
  return { output: 'Hello from ${name}!', exitCode: 0 };
}
`;
}

export { getTsconfig as getStandardTsconfig } from './shared.js';

export function getStandardSkillMd(name: string): string {
  return `# ${name}

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
