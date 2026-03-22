export function getStandardPackageJson(name: string): string {
  const pkg = {
    name,
    version: '0.0.1',
    description: `A RenreKit extension: ${name}`,
    type: 'module',
    main: './dist/index.js',
    scripts: {
      build: 'node build.js',
      dev: 'tsc --watch',
    },
    dependencies: {
      '@renre-kit/extension-sdk': '>=0.0.1',
    },
    devDependencies: {
      esbuild: '^0.21.0',
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
  return `import type { HookContext } from '@renre-kit/extension-sdk/node';

export function onInit(context: HookContext): void {
  context.sdk.deployAgentAssets();
  console.log('${name} initialized in', context.projectDir);
}

export function onDestroy(context: HookContext): void {
  context.sdk.cleanupAgentAssets();
  console.log('${name} destroyed in', context.projectDir);
}
`;
}

export function getStandardCommandHandler(name: string): string {
  return `import { defineCommand } from '@renre-kit/extension-sdk/node';

export default defineCommand({
  handler: () => {
    return { output: 'Hello from ${name}!', exitCode: 0 };
  },
});
`;
}

export { getTsconfig as getStandardTsconfig } from './shared.js';

export function getStandardBuildJs(): string {
  return `import { readFileSync, rmSync } from 'node:fs';

import { buildExtension, archiveDist } from '@renre-kit/extension-sdk/node';

rmSync('dist', { recursive: true, force: true });

const manifest = JSON.parse(readFileSync('manifest.json', 'utf-8'));

await buildExtension({
  entryPoints: [
    { in: 'src/index.ts', out: 'index' },
    { in: 'src/commands/hello.ts', out: 'commands/hello' },
  ],
  outdir: 'dist',
  external: [],
  splitting: true,
});

await archiveDist('dist', manifest.version);
`;
}

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
