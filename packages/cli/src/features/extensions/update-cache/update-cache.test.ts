import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

vi.mock('../manager/extension-manager.js', () => ({
  listInstalled: vi.fn(),
}));

vi.mock('../../registry/registry-manager.js', () => ({
  resolve: vi.fn(),
}));

vi.mock('../engine/engine-compat.js', () => ({
  checkEngineConstraints: vi.fn(),
}));

vi.mock('../../../core/version.js', () => ({
  CLI_VERSION: '1.0.0',
  SDK_VERSION: '1.0.0',
}));

import { listInstalled } from '../manager/extension-manager.js';
import { resolve } from '../../registry/registry-manager.js';
import { checkEngineConstraints } from '../engine/engine-compat.js';
import {
  computeUpdates,
  writeUpdateCache,
  readUpdateCache,
  refreshUpdateCache,
  getUpdateForExtension,
} from './update-cache.js';

describe('update-cache', () => {
  let tmpDir: string;
  let originalHome: string | undefined;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'renre-cache-'));
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

  describe('computeUpdates', () => {
    it('returns empty array when no extensions installed', () => {
      vi.mocked(listInstalled).mockReturnValue([]);
      const result = computeUpdates({} as never, []);
      expect(result).toEqual([]);
    });

    it('returns empty when all extensions are up to date', () => {
      vi.mocked(listInstalled).mockReturnValue([
        { name: 'ext-a', version: '1.0.0', registry_source: 'default', installed_at: '', type: 'standard' },
      ]);
      vi.mocked(resolve).mockReturnValue({
        name: 'ext-a', gitUrl: '', latestVersion: '1.0.0', type: 'standard', registryName: 'default',
      });

      const result = computeUpdates({} as never, []);
      expect(result).toEqual([]);
    });

    it('detects when newer version is available', () => {
      vi.mocked(listInstalled).mockReturnValue([
        { name: 'ext-a', version: '1.0.0', registry_source: 'default', installed_at: '', type: 'standard' },
      ]);
      vi.mocked(resolve).mockReturnValue({
        name: 'ext-a', gitUrl: '', latestVersion: '1.1.0', type: 'standard', registryName: 'default',
      });
      vi.mocked(checkEngineConstraints).mockReturnValue({ compatible: true, issues: [] });

      const result = computeUpdates({} as never, []);
      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe('ext-a');
      expect(result[0]!.installedVersion).toBe('1.0.0');
      expect(result[0]!.availableVersion).toBe('1.1.0');
      expect(result[0]!.engineCompatible).toBe(true);
    });

    it('handles semver correctly (1.9.0 < 1.10.0)', () => {
      vi.mocked(listInstalled).mockReturnValue([
        { name: 'ext-a', version: '1.9.0', registry_source: 'default', installed_at: '', type: 'standard' },
      ]);
      vi.mocked(resolve).mockReturnValue({
        name: 'ext-a', gitUrl: '', latestVersion: '1.10.0', type: 'standard', registryName: 'default',
      });
      vi.mocked(checkEngineConstraints).mockReturnValue({ compatible: true, issues: [] });

      const result = computeUpdates({} as never, []);
      expect(result).toHaveLength(1);
      expect(result[0]!.availableVersion).toBe('1.10.0');
    });

    it('skips extensions with invalid semver', () => {
      vi.mocked(listInstalled).mockReturnValue([
        { name: 'ext-a', version: 'not-a-version', registry_source: 'default', installed_at: '', type: 'standard' },
      ]);
      vi.mocked(resolve).mockReturnValue({
        name: 'ext-a', gitUrl: '', latestVersion: '1.0.0', type: 'standard', registryName: 'default',
      });

      const result = computeUpdates({} as never, []);
      expect(result).toEqual([]);
    });

    it('marks engine incompatible updates', () => {
      vi.mocked(listInstalled).mockReturnValue([
        { name: 'ext-a', version: '1.0.0', registry_source: 'default', installed_at: '', type: 'standard' },
      ]);
      vi.mocked(resolve).mockReturnValue({
        name: 'ext-a', gitUrl: '', latestVersion: '2.0.0', type: 'standard', registryName: 'default',
        engines: { 'renre-kit': '>=5.0.0' },
      });
      vi.mocked(checkEngineConstraints).mockReturnValue({
        compatible: false,
        issues: ['Requires renre-kit >=5.0.0, current is 1.0.0'],
      });

      const result = computeUpdates({} as never, []);
      expect(result).toHaveLength(1);
      expect(result[0]!.engineCompatible).toBe(false);
      expect(result[0]!.engineIssues).toHaveLength(1);
    });

    it('skips when extension is not found in any registry', () => {
      vi.mocked(listInstalled).mockReturnValue([
        { name: 'ext-a', version: '1.0.0', registry_source: 'default', installed_at: '', type: 'standard' },
      ]);
      vi.mocked(resolve).mockReturnValue(null);

      const result = computeUpdates({} as never, []);
      expect(result).toEqual([]);
    });

    it('skips when registry latestVersion is invalid semver', () => {
      vi.mocked(listInstalled).mockReturnValue([
        { name: 'ext-a', version: '1.0.0', registry_source: 'default', installed_at: '', type: 'standard' },
      ]);
      vi.mocked(resolve).mockReturnValue({
        name: 'ext-a', gitUrl: '', latestVersion: 'not-semver', type: 'standard', registryName: 'default',
      });

      const result = computeUpdates({} as never, []);
      expect(result).toEqual([]);
    });

    it('handles extensions with no engines field', () => {
      vi.mocked(listInstalled).mockReturnValue([
        { name: 'ext-a', version: '1.0.0', registry_source: 'default', installed_at: '', type: 'standard' },
      ]);
      vi.mocked(resolve).mockReturnValue({
        name: 'ext-a', gitUrl: '', latestVersion: '2.0.0', type: 'standard', registryName: 'default',
      });
      vi.mocked(checkEngineConstraints).mockReturnValue({ compatible: true, issues: [] });

      const result = computeUpdates({} as never, []);
      expect(result).toHaveLength(1);
      expect(result[0]!.engineCompatible).toBe(true);
    });
  });

  describe('writeUpdateCache / readUpdateCache', () => {
    it('round-trips cache data', () => {
      const updates = [
        {
          name: 'ext-a',
          installedVersion: '1.0.0',
          availableVersion: '2.0.0',
          engineCompatible: true,
          engineIssues: [],
          registryName: 'default',
        },
      ];

      writeUpdateCache(updates);
      const cache = readUpdateCache();

      expect(cache).not.toBeNull();
      expect(cache!.updates).toHaveLength(1);
      expect(cache!.updates[0]!.name).toBe('ext-a');
      expect(cache!.checkedAt).toBeTruthy();
    });

    it('creates directory if it does not exist', () => {
      const nestedDir = path.join(tmpDir, 'nested', 'subdir');
      process.env['RENRE_KIT_HOME'] = nestedDir;

      writeUpdateCache([]);
      const cache = readUpdateCache();

      expect(cache).not.toBeNull();
      expect(cache!.updates).toEqual([]);

      process.env['RENRE_KIT_HOME'] = tmpDir;
    });

    it('returns null when cache file does not exist', () => {
      const cache = readUpdateCache();
      expect(cache).toBeNull();
    });

    it('returns null for malformed JSON', () => {
      const cachePath = path.join(tmpDir, 'update-cache.json');
      fs.writeFileSync(cachePath, 'not-json');
      const cache = readUpdateCache();
      expect(cache).toBeNull();
    });
  });

  describe('getUpdateForExtension', () => {
    it('returns update info for a known extension', () => {
      const updates = [
        {
          name: 'ext-a',
          installedVersion: '1.0.0',
          availableVersion: '2.0.0',
          engineCompatible: true,
          engineIssues: [],
          registryName: 'default',
        },
      ];
      writeUpdateCache(updates);

      const info = getUpdateForExtension('ext-a');
      expect(info).not.toBeNull();
      expect(info!.availableVersion).toBe('2.0.0');
    });

    it('returns null when extension not in cache', () => {
      const updates = [
        {
          name: 'ext-a',
          installedVersion: '1.0.0',
          availableVersion: '2.0.0',
          engineCompatible: true,
          engineIssues: [],
          registryName: 'default',
        },
      ];
      writeUpdateCache(updates);

      const info = getUpdateForExtension('ext-b');
      expect(info).toBeNull();
    });

    it('returns null when no cache exists', () => {
      const info = getUpdateForExtension('ext-a');
      expect(info).toBeNull();
    });
  });

  describe('refreshUpdateCache', () => {
    it('computes and writes cache', () => {
      vi.mocked(listInstalled).mockReturnValue([
        { name: 'ext-a', version: '1.0.0', registry_source: 'default', installed_at: '', type: 'standard' },
      ]);
      vi.mocked(resolve).mockReturnValue({
        name: 'ext-a', gitUrl: '', latestVersion: '2.0.0', type: 'standard', registryName: 'default',
      });
      vi.mocked(checkEngineConstraints).mockReturnValue({ compatible: true, issues: [] });

      refreshUpdateCache({} as never, []);

      const cache = readUpdateCache();
      expect(cache).not.toBeNull();
      expect(cache!.updates).toHaveLength(1);
    });
  });
});
