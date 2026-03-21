export function getMcpPackageJson(name: string): string {
  const pkg = {
    name,
    version: '0.0.1',
    description: `A RenreKit MCP extension: ${name}`,
    type: 'module',
    main: './dist/server.js',
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

export function getMcpManifest(name: string): string {
  const manifest = {
    name,
    version: '0.0.1',
    description: 'A RenreKit MCP extension',
    type: 'mcp',
    main: 'dist/index.js',
    engines: {
      'renre-kit': '>=0.0.1',
      'extension-sdk': '>=0.0.1',
    },
    commands: {},
    mcp: {
      transport: 'stdio',
      command: 'node',
      args: ['dist/server.js'],
    },
  };
  return JSON.stringify(manifest, null, 2) + '\n';
}

export function getMcpServerEntryPoint(name: string): string {
  return `import { createInterface } from 'node:readline';

interface JsonRpcRequest {
  jsonrpc: string;
  id: number | string;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: string;
  id: number | string;
  result?: unknown;
  error?: { code: number; message: string };
}

function handleRequest(request: JsonRpcRequest): JsonRpcResponse {
  switch (request.method) {
    case 'hello':
      return {
        jsonrpc: '2.0',
        id: request.id,
        result: { output: 'Hello from ${name}!', exitCode: 0 },
      };
    default:
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: { code: -32601, message: \`Method not found: \${request.method}\` },
      };
  }
}

const rl = createInterface({ input: process.stdin });

rl.on('line', (line: string) => {
  try {
    const request = JSON.parse(line) as JsonRpcRequest;
    const response = handleRequest(request);
    process.stdout.write(JSON.stringify(response) + '\\n');
  } catch {
    const errorResponse: JsonRpcResponse = {
      jsonrpc: '2.0',
      id: 0,
      error: { code: -32700, message: 'Parse error' },
    };
    process.stdout.write(JSON.stringify(errorResponse) + '\\n');
  }
});
`;
}

export { getTsconfig as getMcpTsconfig } from './shared.js';

export function getMcpBuildJs(): string {
  return `import { buildExtension } from '@renre-kit/extension-sdk/node';

await buildExtension({
  entryPoints: [
    { in: 'src/server.ts', out: 'server' },
  ],
  outdir: 'dist',
});
`;
}

export function getMcpSkillMd(name: string): string {
  return `---
name: hello
description: This tool should be used when the user wants to say hello or test the ${name} MCP extension
---

# ${name}

## Description

A RenreKit MCP extension that communicates via JSON-RPC over stdio.

## Commands

### hello

Say hello from the MCP extension.

**Usage:**
\`\`\`
renre ${name} hello
\`\`\`

## Configuration

No configuration required.
`;
}
