import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

vi.mock('simple-git', () => {
  const cloneFn = vi.fn().mockResolvedValue(undefined);
  const pullFn = vi.fn().mockResolvedValue(undefined);
  const mockGit = {
    clone: cloneFn,
    pull: pullFn,
  };
  const simpleGit = vi.fn(() => mockGit);
  return { default: simpleGit, simpleGit, __mockGit: mockGit };
});

import {
  sync,
  syncAll,
  list,
  resolve,
  listAvailable,
  searchAvailable,
  ensureSynced,
  installExtension,
  resolveRegistryIcon,
} from './registry-manager.js';
import type { RegistryConfig } from '../../core/types/index.js';
import * as registryCache from './registry-cache.js';

describe('registry-manager', () => {
  let tmpDir: string;
  let originalHome: string | undefined;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'renre-reg-'));
    originalHome = process.env['RENRE_KIT_HOME'];
    process.env['RENRE_KIT_HOME'] = tmpDir;
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (originalHome === undefined) {
      delete process.env['RENRE_KIT_HOME'];
    } else {
      process.env['RENRE_KIT_HOME'] = originalHome;
    }
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function makeConfig(
    name: string,
    url: string,
    priority: number,
  ): RegistryConfig {
    return { name, url, priority, cacheTTL: 3600 };
  }

  describe('sync', () => {
    it('clones registry on first sync (dir does not exist)', async () => {
      const simpleGitModule = await import('simple-git');
      const mockGit = (simpleGitModule as unknown as { __mockGit: { clone: ReturnType<typeof vi.fn>; pull: ReturnType<typeof vi.fn> } }).__mockGit;
      const config = makeConfig('default', 'https://git.example.com/registry.git', 1);

      await sync('default', config);

      expect(mockGit.clone).toHaveBeenCalledOnce();
      const cloneArgs = mockGit.clone.mock.calls[0] as string[];
      expect(cloneArgs[0]).toBe('https://git.example.com/registry.git');
    });

    it('pulls on subsequent sync (dir exists)', async () => {
      const simpleGitModule = await import('simple-git');
      const mockGit = (simpleGitModule as unknown as { __mockGit: { clone: ReturnType<typeof vi.fn>; pull: ReturnType<typeof vi.fn> } }).__mockGit;
      const config = makeConfig('default', 'https://git.example.com/registry.git', 1);

      const regDir = path.join(tmpDir, 'registries', 'default');
      fs.mkdirSync(regDir, { recursive: true });

      await sync('default', config);

      expect(mockGit.pull).toHaveBeenCalledOnce();
      expect(mockGit.clone).not.toHaveBeenCalled();
    });

    it('updates .fetched_at after sync', async () => {
      const spy = vi.spyOn(registryCache, 'updateTimestamp');
      const config = makeConfig('default', 'https://git.example.com/registry.git', 1);

      await sync('default', config);

      expect(spy).toHaveBeenCalledOnce();
      spy.mockRestore();
    });
  });

  describe('syncAll', () => {
    it('syncs all provided registries', async () => {
      const simpleGitModule = await import('simple-git');
      const mockGit = (simpleGitModule as unknown as { __mockGit: { clone: ReturnType<typeof vi.fn>; pull: ReturnType<typeof vi.fn> } }).__mockGit;
      const configs = [
        makeConfig('reg1', 'https://git.example.com/r1.git', 1),
        makeConfig('reg2', 'https://git.example.com/r2.git', 2),
      ];

      const errors = await syncAll(configs);

      expect(errors).toEqual([]);
      expect(mockGit.clone).toHaveBeenCalledTimes(2);
    });
  });

  describe('list', () => {
    it('returns registry statuses', () => {
      const configs = [
        makeConfig('reg1', 'https://git.example.com/r1.git', 1),
        makeConfig('reg2', 'https://git.example.com/r2.git', 2),
      ];

      const result = list(configs);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(
        expect.objectContaining({
          name: 'reg1',
          url: 'https://git.example.com/r1.git',
          priority: 1,
        }),
      );
    });

    it('includes lastFetched and isStale fields', () => {
      const configs = [makeConfig('reg1', 'https://git.example.com/r1.git', 1)];
      const result = list(configs);
      expect(result[0]).toHaveProperty('lastFetched');
      expect(result[0]).toHaveProperty('isStale');
    });

    it('uses per-registry cacheTTL', () => {
      // Create a registry dir with old timestamp
      const regDir = path.join(tmpDir, 'registries', 'manual');
      fs.mkdirSync(regDir, { recursive: true });
      const oldDate = new Date('2020-01-01');
      fs.writeFileSync(path.join(regDir, '.fetched_at'), oldDate.toISOString());

      // cacheTTL = -1 means manual only => never stale
      const configs: RegistryConfig[] = [
        { name: 'manual', url: 'https://git.example.com/manual.git', priority: 1, cacheTTL: -1 },
      ];
      const result = list(configs);
      expect(result[0]!.isStale).toBe(false);
    });
  });

  describe('resolve', () => {
    it('returns null when no registries have the extension', () => {
      const configs = [makeConfig('reg1', 'https://git.example.com/r1.git', 1)];
      const result = resolve('nonexistent-ext', configs);
      expect(result).toBeNull();
    });

    it('resolves extension from extensions.json', () => {
      const configs = [makeConfig('reg1', 'https://git.example.com/r1.git', 1)];
      const regDir = path.join(tmpDir, 'registries', 'reg1', '.renre-kit');
      fs.mkdirSync(regDir, { recursive: true });
      fs.writeFileSync(
        path.join(regDir, 'extensions.json'),
        JSON.stringify({
          extensions: [
            {
              name: 'my-ext',
              gitUrl: 'https://github.com/user/my-ext.git',
              latestVersion: '1.2.0',
              type: 'standard',
              description: 'A test extension',
              icon: '',
              author: 'test',
            },
          ],
        }),
      );

      const result = resolve('my-ext', configs);
      expect(result).toEqual({
        name: 'my-ext',
        gitUrl: 'https://github.com/user/my-ext.git',
        latestVersion: '1.2.0',
        type: 'standard',
        registryName: 'reg1',
        engines: undefined,
      });
    });

    it('passes engines field through when present in registry entry', () => {
      const configs = [makeConfig('reg1', 'https://git.example.com/r1.git', 1)];
      const regDir = path.join(tmpDir, 'registries', 'reg1', '.renre-kit');
      fs.mkdirSync(regDir, { recursive: true });
      fs.writeFileSync(
        path.join(regDir, 'extensions.json'),
        JSON.stringify({
          extensions: [
            {
              name: 'my-ext',
              gitUrl: 'https://github.com/user/my-ext.git',
              latestVersion: '1.2.0',
              type: 'standard',
              description: 'A test extension',
              icon: '',
              author: 'test',
              engines: { 'renre-kit': '>=1.0.0', 'extension-sdk': '>=0.5.0' },
            },
          ],
        }),
      );

      const result = resolve('my-ext', configs);
      expect(result).not.toBeNull();
      expect(result!.engines).toEqual({ 'renre-kit': '>=1.0.0', 'extension-sdk': '>=0.5.0' });
    });

    it('resolves from highest priority registry first', () => {
      const configs = [
        makeConfig('low', 'https://git.example.com/low.git', 10),
        makeConfig('high', 'https://git.example.com/high.git', 1),
      ];
      for (const cfg of configs) {
        const regDir = path.join(tmpDir, 'registries', cfg.name, '.renre-kit');
        fs.mkdirSync(regDir, { recursive: true });
        fs.writeFileSync(
          path.join(regDir, 'extensions.json'),
          JSON.stringify({
            extensions: [
              {
                name: 'shared-ext',
                gitUrl: `https://github.com/${cfg.name}/shared-ext.git`,
                latestVersion: '1.0.0',
                type: 'standard',
                description: '',
                icon: '',
                author: cfg.name,
              },
            ],
          }),
        );
      }

      const result = resolve('shared-ext', configs);
      expect(result).not.toBeNull();
      expect(result!.registryName).toBe('high');
    });
  });

  describe('resolveRegistryIcon', () => {
    it('returns icon path when icon exists in registry', () => {
      const configs = [makeConfig('reg1', 'https://git.example.com/r1.git', 1)];
      const regDir = path.join(tmpDir, 'registries', 'reg1', '.renre-kit');
      const iconsDir = path.join(regDir, 'icons');
      fs.mkdirSync(iconsDir, { recursive: true });
      fs.writeFileSync(
        path.join(regDir, 'extensions.json'),
        JSON.stringify({
          extensions: [{
            name: 'my-ext', description: '', gitUrl: '', latestVersion: '1.0.0',
            type: 'standard', icon: 'icons/my-ext.svg', author: 'test',
          }],
        }),
      );
      fs.writeFileSync(path.join(iconsDir, 'my-ext.svg'), '<svg></svg>');

      const result = resolveRegistryIcon('my-ext', configs);
      expect(result).not.toBeNull();
      expect(result).toContain('my-ext.svg');
    });

    it('returns null when extension has no icon field', () => {
      const configs = [makeConfig('reg1', 'https://git.example.com/r1.git', 1)];
      const regDir = path.join(tmpDir, 'registries', 'reg1', '.renre-kit');
      fs.mkdirSync(regDir, { recursive: true });
      fs.writeFileSync(
        path.join(regDir, 'extensions.json'),
        JSON.stringify({
          extensions: [{
            name: 'my-ext', description: '', gitUrl: '', latestVersion: '1.0.0',
            type: 'standard', icon: '', author: 'test',
          }],
        }),
      );

      const result = resolveRegistryIcon('my-ext', configs);
      expect(result).toBeNull();
    });

    it('returns null when extension not in any registry', () => {
      const configs = [makeConfig('reg1', 'https://git.example.com/r1.git', 1)];
      const result = resolveRegistryIcon('nonexistent', configs);
      expect(result).toBeNull();
    });
  });

  describe('listAvailable', () => {
    it('returns empty array when no registries have extensions', () => {
      const configs = [makeConfig('reg1', 'https://git.example.com/r1.git', 1)];
      const result = listAvailable(configs);
      expect(result).toEqual([]);
    });

    it('returns all extensions from a registry', () => {
      const configs = [makeConfig('reg1', 'https://git.example.com/r1.git', 1)];
      const regDir = path.join(tmpDir, 'registries', 'reg1', '.renre-kit');
      fs.mkdirSync(regDir, { recursive: true });
      fs.writeFileSync(
        path.join(regDir, 'extensions.json'),
        JSON.stringify({
          extensions: [
            { name: 'ext-a', description: 'A', gitUrl: 'https://example.com/a.git', latestVersion: '1.0.0', type: 'standard', icon: '', author: 'test' },
            { name: 'ext-b', description: 'B', gitUrl: 'https://example.com/b.git', latestVersion: '2.0.0', type: 'mcp', icon: 'star', author: 'test' },
          ],
        }),
      );

      const result = listAvailable(configs);
      expect(result).toHaveLength(2);
      expect(result[0]!.name).toBe('ext-a');
      expect(result[1]!.name).toBe('ext-b');
    });

    it('deduplicates extensions by name using highest priority registry', () => {
      const configs = [
        makeConfig('low', 'https://git.example.com/low.git', 10),
        makeConfig('high', 'https://git.example.com/high.git', 1),
      ];
      for (const cfg of configs) {
        const regDir = path.join(tmpDir, 'registries', cfg.name, '.renre-kit');
        fs.mkdirSync(regDir, { recursive: true });
        fs.writeFileSync(
          path.join(regDir, 'extensions.json'),
          JSON.stringify({
            extensions: [
              { name: 'shared-ext', description: `From ${cfg.name}`, gitUrl: `https://example.com/${cfg.name}.git`, latestVersion: '1.0.0', type: 'standard', icon: '', author: cfg.name },
            ],
          }),
        );
      }

      const result = listAvailable(configs);
      expect(result).toHaveLength(1);
      expect(result[0]!.author).toBe('high');
    });
  });

  describe('searchAvailable', () => {
    function setupRegistry(entries: Record<string, unknown>[]) {
      const configs = [makeConfig('reg1', 'https://git.example.com/r1.git', 1)];
      const regDir = path.join(tmpDir, 'registries', 'reg1', '.renre-kit');
      fs.mkdirSync(regDir, { recursive: true });
      fs.writeFileSync(
        path.join(regDir, 'extensions.json'),
        JSON.stringify({ extensions: entries }),
      );
      return configs;
    }

    const sampleEntries = [
      { name: 'hello-world', description: 'A simple hello extension', gitUrl: 'https://example.com/hw.git', latestVersion: '1.0.0', type: 'standard', icon: '', author: 'test', tags: ['example', 'greeting'] },
      { name: 'echo-mcp', description: 'An echo MCP server', gitUrl: 'https://example.com/echo.git', latestVersion: '1.0.0', type: 'mcp', icon: '', author: 'test', tags: ['example', 'mcp'] },
      { name: 'analytics', description: 'Track usage analytics', gitUrl: 'https://example.com/analytics.git', latestVersion: '2.0.0', type: 'standard', icon: '', author: 'test' },
    ];

    it('returns all extensions when no filters are provided', () => {
      const configs = setupRegistry(sampleEntries);
      const result = searchAvailable(configs, {});
      expect(result).toHaveLength(3);
    });

    it('filters by query matching name', () => {
      const configs = setupRegistry(sampleEntries);
      const result = searchAvailable(configs, { query: 'hello' });
      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe('hello-world');
    });

    it('filters by query matching description', () => {
      const configs = setupRegistry(sampleEntries);
      const result = searchAvailable(configs, { query: 'analytics' });
      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe('analytics');
    });

    it('query is case-insensitive', () => {
      const configs = setupRegistry(sampleEntries);
      const result = searchAvailable(configs, { query: 'HELLO' });
      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe('hello-world');
    });

    it('filters by type', () => {
      const configs = setupRegistry(sampleEntries);
      const result = searchAvailable(configs, { type: 'mcp' });
      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe('echo-mcp');
    });

    it('filters by tag', () => {
      const configs = setupRegistry(sampleEntries);
      const result = searchAvailable(configs, { tag: 'greeting' });
      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe('hello-world');
    });

    it('tag filter is case-insensitive', () => {
      const configs = setupRegistry(sampleEntries);
      const result = searchAvailable(configs, { tag: 'EXAMPLE' });
      expect(result).toHaveLength(2);
    });

    it('excludes extensions without tags when filtering by tag', () => {
      const configs = setupRegistry(sampleEntries);
      const result = searchAvailable(configs, { tag: 'example' });
      expect(result.find((e) => e.name === 'analytics')).toBeUndefined();
    });

    it('combines query and type filters', () => {
      const configs = setupRegistry(sampleEntries);
      const result = searchAvailable(configs, { query: 'echo', type: 'mcp' });
      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe('echo-mcp');
    });

    it('returns empty when no matches', () => {
      const configs = setupRegistry(sampleEntries);
      const result = searchAvailable(configs, { query: 'nonexistent' });
      expect(result).toHaveLength(0);
    });
  });

  describe('ensureSynced', () => {
    it('syncs registries that have not been fetched yet', async () => {
      const simpleGitModule = await import('simple-git');
      const mockGit = (simpleGitModule as unknown as { __mockGit: { clone: ReturnType<typeof vi.fn>; pull: ReturnType<typeof vi.fn> } }).__mockGit;
      const configs = [makeConfig('new-reg', 'https://git.example.com/reg.git', 1)];

      await ensureSynced(configs);

      expect(mockGit.clone).toHaveBeenCalledOnce();
    });

    it('skips registries that are already synced and fresh', async () => {
      const simpleGitModule = await import('simple-git');
      const mockGit = (simpleGitModule as unknown as { __mockGit: { clone: ReturnType<typeof vi.fn>; pull: ReturnType<typeof vi.fn> } }).__mockGit;

      // Create a fresh registry dir with recent timestamp
      const regDir = path.join(tmpDir, 'registries', 'fresh-reg');
      fs.mkdirSync(regDir, { recursive: true });
      fs.writeFileSync(path.join(regDir, '.fetched_at'), new Date().toISOString());

      const configs = [makeConfig('fresh-reg', 'https://git.example.com/reg.git', 1)];

      await ensureSynced(configs);

      expect(mockGit.clone).not.toHaveBeenCalled();
      expect(mockGit.pull).not.toHaveBeenCalled();
    });
  });

  describe('installExtension — local paths', () => {
    it('copies local extension directory instead of git clone', async () => {
      const simpleGitModule = await import('simple-git');
      const mockGit = (simpleGitModule as unknown as { __mockGit: { clone: ReturnType<typeof vi.fn>; pull: ReturnType<typeof vi.fn> } }).__mockGit;

      // Create a registry with a local extension
      const regDir = path.join(tmpDir, 'registries', 'local-reg');
      const extSrc = path.join(regDir, 'extensions', 'my-ext');
      fs.mkdirSync(extSrc, { recursive: true });
      fs.writeFileSync(path.join(extSrc, 'manifest.json'), '{"name":"my-ext"}');

      const result = await installExtension('my-ext', './extensions/my-ext', '1.0.0', 'local-reg');

      expect(mockGit.clone).not.toHaveBeenCalled();
      expect(result).toContain('my-ext@1.0.0');
      expect(fs.existsSync(path.join(result, 'manifest.json'))).toBe(true);
    });

    it('throws when local path does not exist', async () => {
      await expect(
        installExtension('missing', './nonexistent', '1.0.0', 'some-reg'),
      ).rejects.toThrow('Local extension path not found');
    });
  });

  describe('path fallbacks', () => {
    it('uses HOME for registries when RENRE_KIT_HOME is not set', async () => {
      delete process.env['RENRE_KIT_HOME'];
      const originalHome = process.env['HOME'];
      process.env['HOME'] = tmpDir;

      const simpleGitModule = await import('simple-git');
      const mockGit = (simpleGitModule as unknown as { __mockGit: { clone: ReturnType<typeof vi.fn>; pull: ReturnType<typeof vi.fn> } }).__mockGit;
      const config = makeConfig('fallback-reg', 'https://git.example.com/reg.git', 1);

      await sync('fallback-reg', config);

      expect(mockGit.clone).toHaveBeenCalledOnce();
      const cloneArgs = mockGit.clone.mock.calls[0] as [string, string];
      expect(cloneArgs[1]).toContain('.renre-kit');

      process.env['HOME'] = originalHome;
      process.env['RENRE_KIT_HOME'] = tmpDir;
    });

    it('uses HOME for extensions when RENRE_KIT_HOME is not set', async () => {
      delete process.env['RENRE_KIT_HOME'];
      const originalHome = process.env['HOME'];
      process.env['HOME'] = tmpDir;

      const simpleGitModule = await import('simple-git');
      const mockGit = (simpleGitModule as unknown as { __mockGit: { clone: ReturnType<typeof vi.fn>; pull: ReturnType<typeof vi.fn> } }).__mockGit;

      const resultPath = await installExtension(
        'fallback-ext',
        'https://github.com/user/ext.git',
        '1.0.0',
      );

      expect(mockGit.clone).toHaveBeenCalledOnce();
      expect(resultPath).toContain('.renre-kit');
      expect(resultPath).toContain('extensions');

      process.env['HOME'] = originalHome;
      process.env['RENRE_KIT_HOME'] = tmpDir;
    });

    it('falls back to empty string when HOME is also not set', () => {
      delete process.env['RENRE_KIT_HOME'];
      const originalHome = process.env['HOME'];
      delete process.env['HOME'];

      // list() triggers getRegistriesDir
      const configs = [makeConfig('x', 'https://example.com', 1)];
      const result = list(configs);
      expect(result).toHaveLength(1);

      process.env['HOME'] = originalHome;
      process.env['RENRE_KIT_HOME'] = tmpDir;
    });
  });

  describe('installExtension', () => {
    it('clones extension at specified version', async () => {
      const simpleGitModule = await import('simple-git');
      const mockGit = (simpleGitModule as unknown as { __mockGit: { clone: ReturnType<typeof vi.fn>; pull: ReturnType<typeof vi.fn> } }).__mockGit;

      const resultPath = await installExtension(
        'my-ext',
        'https://github.com/user/my-ext.git',
        '1.2.0',
      );

      expect(mockGit.clone).toHaveBeenCalledOnce();
      const callArgs = mockGit.clone.mock.calls[0] as [string, string, string[]];
      expect(callArgs[0]).toBe('https://github.com/user/my-ext.git');
      expect(callArgs[2]).toContain('--branch');
      expect(callArgs[2]).toContain('v1.2.0');
      expect(callArgs[2]).toContain('--depth');
      expect(callArgs[2]).toContain('1');
      expect(resultPath).toContain('my-ext@1.2.0');
    });
  });
});
