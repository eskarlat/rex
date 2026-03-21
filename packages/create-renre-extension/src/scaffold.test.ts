import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fse from 'fs-extra';
import path from 'node:path';
import os from 'node:os';

import { scaffoldExtension } from './scaffold.js';

describe('scaffoldExtension', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fse.mkdtemp(path.join(os.tmpdir(), 'renre-test-'));
  });

  afterEach(async () => {
    await fse.remove(tmpDir);
  });

  describe('standard extension', () => {
    it('should create all required files', async () => {
      await scaffoldExtension('test-ext', 'standard', tmpDir);

      const extDir = path.join(tmpDir, 'test-ext');
      expect(await fse.pathExists(path.join(extDir, 'package.json'))).toBe(true);
      expect(await fse.pathExists(path.join(extDir, 'manifest.json'))).toBe(true);
      expect(await fse.pathExists(path.join(extDir, 'src', 'index.ts'))).toBe(true);
      expect(await fse.pathExists(path.join(extDir, 'commands', 'hello.ts'))).toBe(true);
      expect(await fse.pathExists(path.join(extDir, 'tsconfig.json'))).toBe(true);
      expect(await fse.pathExists(path.join(extDir, 'build.js'))).toBe(true);
      expect(await fse.pathExists(path.join(extDir, 'SKILL.md'))).toBe(true);
    });

    it('should generate correct package.json', async () => {
      await scaffoldExtension('my-plugin', 'standard', tmpDir);

      const pkgPath = path.join(tmpDir, 'my-plugin', 'package.json');
      const pkg = (await fse.readJson(pkgPath)) as Record<string, unknown>;
      expect(pkg['name']).toBe('my-plugin');
      expect(pkg['version']).toBe('0.0.1');
      expect(pkg['type']).toBe('module');
      expect(pkg['main']).toBe('./dist/index.js');
    });

    it('should generate correct manifest.json', async () => {
      await scaffoldExtension('my-plugin', 'standard', tmpDir);

      const manifestPath = path.join(tmpDir, 'my-plugin', 'manifest.json');
      const manifest = (await fse.readJson(manifestPath)) as Record<string, unknown>;
      expect(manifest['name']).toBe('my-plugin');
      expect(manifest['type']).toBe('standard');
      expect(manifest['main']).toBe('dist/index.js');
      const commands = manifest['commands'] as Record<string, Record<string, string>>;
      expect(commands['hello']!['handler']).toBe('dist/commands/hello.js');
    });

    it('should include engines field in manifest', async () => {
      await scaffoldExtension('my-plugin', 'standard', tmpDir);

      const manifestPath = path.join(tmpDir, 'my-plugin', 'manifest.json');
      const manifest = (await fse.readJson(manifestPath)) as Record<string, unknown>;
      const engines = manifest['engines'] as Record<string, string>;
      expect(engines).toBeDefined();
      expect(engines['renre-kit']).toBe('>=0.0.1');
      expect(engines['extension-sdk']).toBe('>=0.0.1');
    });

    it('should generate entry point with lifecycle hooks', async () => {
      await scaffoldExtension('my-plugin', 'standard', tmpDir);

      const entryPath = path.join(tmpDir, 'my-plugin', 'src', 'index.ts');
      const content = await fse.readFile(entryPath, 'utf-8');
      expect(content).toContain('export function onInit');
      expect(content).toContain('export function onDestroy');
    });

    it('should generate command handler file', async () => {
      await scaffoldExtension('my-plugin', 'standard', tmpDir);

      const cmdPath = path.join(tmpDir, 'my-plugin', 'commands', 'hello.ts');
      const content = await fse.readFile(cmdPath, 'utf-8');
      expect(content).toContain('Hello from my-plugin!');
      expect(content).toContain('export default function');
    });

    it('should generate SKILL.md with extension name', async () => {
      await scaffoldExtension('my-plugin', 'standard', tmpDir);

      const skillPath = path.join(tmpDir, 'my-plugin', 'SKILL.md');
      const content = await fse.readFile(skillPath, 'utf-8');
      expect(content).toContain('# my-plugin');
    });
  });

  describe('mcp extension', () => {
    it('should create all required files', async () => {
      await scaffoldExtension('mcp-ext', 'mcp', tmpDir);

      const extDir = path.join(tmpDir, 'mcp-ext');
      expect(await fse.pathExists(path.join(extDir, 'package.json'))).toBe(true);
      expect(await fse.pathExists(path.join(extDir, 'manifest.json'))).toBe(true);
      expect(await fse.pathExists(path.join(extDir, 'src', 'server.ts'))).toBe(true);
      expect(await fse.pathExists(path.join(extDir, 'tsconfig.json'))).toBe(true);
      expect(await fse.pathExists(path.join(extDir, 'build.js'))).toBe(true);
      expect(await fse.pathExists(path.join(extDir, 'SKILL.md'))).toBe(true);
    });

    it('should generate correct manifest with mcp type', async () => {
      await scaffoldExtension('mcp-ext', 'mcp', tmpDir);

      const manifestPath = path.join(tmpDir, 'mcp-ext', 'manifest.json');
      const manifest = (await fse.readJson(manifestPath)) as Record<string, unknown>;
      expect(manifest['name']).toBe('mcp-ext');
      expect(manifest['type']).toBe('mcp');
      expect(manifest['main']).toBe('dist/index.js');
      expect(manifest['mcp']).toBeDefined();
    });

    it('should include engines field in manifest', async () => {
      await scaffoldExtension('mcp-ext', 'mcp', tmpDir);

      const manifestPath = path.join(tmpDir, 'mcp-ext', 'manifest.json');
      const manifest = (await fse.readJson(manifestPath)) as Record<string, string>;
      const engines = manifest['engines'] as unknown as Record<string, string>;
      expect(engines).toBeDefined();
      expect(engines['renre-kit']).toBe('>=0.0.1');
      expect(engines['extension-sdk']).toBe('>=0.0.1');
    });

    it('should generate server entry point with JSON-RPC handler', async () => {
      await scaffoldExtension('mcp-ext', 'mcp', tmpDir);

      const serverPath = path.join(tmpDir, 'mcp-ext', 'src', 'server.ts');
      const content = await fse.readFile(serverPath, 'utf-8');
      expect(content).toContain('Hello from mcp-ext!');
      expect(content).toContain('JsonRpcRequest');
      expect(content).toContain('handleRequest');
      expect(content).toContain('createInterface');
    });

    it('should generate package.json with server as main', async () => {
      await scaffoldExtension('mcp-ext', 'mcp', tmpDir);

      const pkgPath = path.join(tmpDir, 'mcp-ext', 'package.json');
      const pkg = (await fse.readJson(pkgPath)) as Record<string, unknown>;
      expect(pkg['main']).toBe('./dist/server.js');
    });
  });

  describe('error handling', () => {
    it('should throw if directory already exists', async () => {
      await fse.ensureDir(path.join(tmpDir, 'existing-ext'));

      await expect(scaffoldExtension('existing-ext', 'standard', tmpDir)).rejects.toThrow(
        'Directory "existing-ext" already exists',
      );
    });
  });
});
