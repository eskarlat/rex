import { describe, it, expect } from 'vitest';

import {
  getMcpPackageJson,
  getMcpManifest,
  getMcpServerEntryPoint,
  getMcpTsconfig,
  getMcpBuildJs,
  getMcpSkillMd,
} from './mcp.js';

describe('mcp templates', () => {
  describe('getMcpPackageJson', () => {
    it('returns valid JSON with correct name and mcp description', () => {
      const result = JSON.parse(getMcpPackageJson('mcp-ext')) as Record<string, unknown>;
      expect(result['name']).toBe('mcp-ext');
      expect(result['version']).toBe('0.0.1');
      expect(result['type']).toBe('module');
      expect(result['main']).toBe('./dist/server.js');
    });

    it('includes esbuild and extension-sdk dependencies', () => {
      const result = JSON.parse(getMcpPackageJson('mcp-ext')) as Record<string, unknown>;
      const deps = result['dependencies'] as Record<string, string>;
      const devDeps = result['devDependencies'] as Record<string, string>;
      expect(deps['@renre-kit/extension-sdk']).toBe('>=0.0.1');
      expect(devDeps['esbuild']).toBe('^0.21.0');
    });

    it('uses node build.js as build script', () => {
      const result = JSON.parse(getMcpPackageJson('mcp-ext')) as Record<string, unknown>;
      const scripts = result['scripts'] as Record<string, string>;
      expect(scripts['build']).toBe('node build.js');
    });
  });

  describe('getMcpManifest', () => {
    it('returns valid JSON with mcp type and transport config', () => {
      const result = JSON.parse(getMcpManifest('mcp-ext')) as Record<string, unknown>;
      expect(result['name']).toBe('mcp-ext');
      expect(result['type']).toBe('mcp');
      expect(result['engines']).toBeDefined();
      const mcp = result['mcp'] as Record<string, unknown>;
      expect(mcp['transport']).toBe('stdio');
      expect(mcp['command']).toBe('node');
    });
  });

  describe('getMcpServerEntryPoint', () => {
    it('includes JSON-RPC handler with extension name', () => {
      const result = getMcpServerEntryPoint('mcp-ext');
      expect(result).toContain('JsonRpcRequest');
      expect(result).toContain('handleRequest');
      expect(result).toContain('Hello from mcp-ext!');
      expect(result).toContain('createInterface');
    });
  });

  describe('getMcpTsconfig', () => {
    it('returns valid JSON', () => {
      const result = JSON.parse(getMcpTsconfig()) as Record<string, unknown>;
      expect(result['compilerOptions']).toBeDefined();
    });
  });

  describe('getMcpBuildJs', () => {
    it('imports buildExtension and archiveDist from SDK', () => {
      const result = getMcpBuildJs();
      expect(result).toContain(
        "import { buildExtension, archiveDist } from '@renre-kit/extension-sdk/node'",
      );
    });

    it('cleans dist before building', () => {
      const result = getMcpBuildJs();
      expect(result).toContain("rmSync('dist', { recursive: true, force: true })");
    });

    it('reads manifest for version', () => {
      const result = getMcpBuildJs();
      expect(result).toContain("readFileSync('manifest.json', 'utf-8')");
    });

    it('includes server entry point', () => {
      const result = getMcpBuildJs();
      expect(result).toContain("{ in: 'src/server.ts', out: 'server' }");
    });

    it('enables code splitting', () => {
      const result = getMcpBuildJs();
      expect(result).toContain('splitting: true');
    });

    it('archives dist with version', () => {
      const result = getMcpBuildJs();
      expect(result).toContain('await archiveDist');
    });

    it('outputs to dist directory', () => {
      const result = getMcpBuildJs();
      expect(result).toContain("outdir: 'dist'");
    });
  });

  describe('getMcpSkillMd', () => {
    it('includes extension name and MCP description', () => {
      const result = getMcpSkillMd('mcp-ext');
      expect(result).toContain('# mcp-ext');
      expect(result).toContain('MCP');
    });
  });
});
