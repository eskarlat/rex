import { describe, it, expect } from 'vitest';

import {
  getStandardPackageJson,
  getStandardManifest,
  getStandardEntryPoint,
  getStandardCommandHandler,
  getStandardTsconfig,
  getStandardBuildJs,
  getStandardSkillMd,
} from './standard.js';

describe('standard templates', () => {
  describe('getStandardPackageJson', () => {
    it('returns valid JSON with correct name', () => {
      const result = JSON.parse(getStandardPackageJson('my-ext')) as Record<string, unknown>;
      expect(result['name']).toBe('my-ext');
      expect(result['version']).toBe('0.0.1');
      expect(result['type']).toBe('module');
      expect(result['main']).toBe('./dist/index.js');
    });

    it('includes esbuild and extension-sdk dependencies', () => {
      const result = JSON.parse(getStandardPackageJson('my-ext')) as Record<string, unknown>;
      const deps = result['dependencies'] as Record<string, string>;
      const devDeps = result['devDependencies'] as Record<string, string>;
      expect(deps['@renre-kit/extension-sdk']).toBe('>=0.0.1');
      expect(devDeps['esbuild']).toBe('^0.21.0');
    });

    it('uses node build.js as build script', () => {
      const result = JSON.parse(getStandardPackageJson('my-ext')) as Record<string, unknown>;
      const scripts = result['scripts'] as Record<string, string>;
      expect(scripts['build']).toBe('node build.js');
    });
  });

  describe('getStandardManifest', () => {
    it('returns valid JSON with correct structure', () => {
      const result = JSON.parse(getStandardManifest('my-ext')) as Record<string, unknown>;
      expect(result['name']).toBe('my-ext');
      expect(result['type']).toBe('standard');
      expect(result['engines']).toBeDefined();
    });
  });

  describe('getStandardEntryPoint', () => {
    it('includes lifecycle hooks with extension name', () => {
      const result = getStandardEntryPoint('my-ext');
      expect(result).toContain('export function onInit');
      expect(result).toContain('export function onDestroy');
      expect(result).toContain('my-ext');
    });
  });

  describe('getStandardCommandHandler', () => {
    it('generates a defineCommand export with name', () => {
      const result = getStandardCommandHandler('my-ext');
      expect(result).toContain('export default defineCommand');
      expect(result).toContain('Hello from my-ext!');
    });
  });

  describe('getStandardTsconfig', () => {
    it('returns valid JSON', () => {
      const result = JSON.parse(getStandardTsconfig()) as Record<string, unknown>;
      expect(result['compilerOptions']).toBeDefined();
    });
  });

  describe('getStandardBuildJs', () => {
    it('imports buildExtension and archiveDist from SDK', () => {
      const result = getStandardBuildJs();
      expect(result).toContain(
        "import { buildExtension, archiveDist } from '@renre-kit/extension-sdk/node'",
      );
    });

    it('cleans dist before building', () => {
      const result = getStandardBuildJs();
      expect(result).toContain("rmSync('dist', { recursive: true, force: true })");
    });

    it('reads manifest for version', () => {
      const result = getStandardBuildJs();
      expect(result).toContain("readFileSync('manifest.json', 'utf-8')");
    });

    it('includes index and commands/hello entry points', () => {
      const result = getStandardBuildJs();
      expect(result).toContain("{ in: 'src/index.ts', out: 'index' }");
      expect(result).toContain("{ in: 'src/commands/hello.ts', out: 'commands/hello' }");
    });

    it('enables code splitting', () => {
      const result = getStandardBuildJs();
      expect(result).toContain('splitting: true');
    });

    it('archives dist with version', () => {
      const result = getStandardBuildJs();
      expect(result).toContain('await archiveDist');
    });

    it('outputs to dist directory', () => {
      const result = getStandardBuildJs();
      expect(result).toContain("outdir: 'dist'");
    });
  });

  describe('getStandardSkillMd', () => {
    it('includes extension name', () => {
      const result = getStandardSkillMd('my-ext');
      expect(result).toContain('# my-ext');
    });
  });
});
