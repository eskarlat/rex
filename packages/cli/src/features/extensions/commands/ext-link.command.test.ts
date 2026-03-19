import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

vi.mock('@clack/prompts', () => ({
  log: { info: vi.fn(), success: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

vi.mock('../manager/extension-manager.js', () => ({
  install: vi.fn(),
  activate: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../../core/database/database.js', () => ({
  getDb: vi.fn().mockReturnValue({}),
}));

const mockExtensionsDir = path.join(os.tmpdir(), `renre-link-exts-${Date.now()}`);

vi.mock('../../../core/paths/paths.js', () => ({
  get EXTENSIONS_DIR() { return mockExtensionsDir; },
  getExtensionDir: (name: string, version: string) => path.join(mockExtensionsDir, `${name}@${version}`),
}));

import * as clack from '@clack/prompts';
import { handleExtLink } from './ext-link.command.js';
import * as extensionManager from '../manager/extension-manager.js';

describe('ext-link command', () => {
  let tmpDir: string;
  let extDir: string;

  beforeEach(() => {
    vi.clearAllMocks();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'renre-link-'));
    extDir = path.join(tmpDir, 'my-ext');
    fs.mkdirSync(extDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    if (fs.existsSync(mockExtensionsDir)) {
      fs.rmSync(mockExtensionsDir, { recursive: true, force: true });
    }
  });

  it('errors when path does not exist', async () => {
    await handleExtLink({
      localPath: '/nonexistent/path',
      projectPath: null,
    });

    expect(clack.log.error).toHaveBeenCalledWith(
      expect.stringContaining('does not exist'),
    );
  });

  it('errors when manifest.json is missing', async () => {
    await handleExtLink({
      localPath: extDir,
      projectPath: null,
    });

    expect(clack.log.error).toHaveBeenCalledWith(
      expect.stringContaining('manifest.json'),
    );
  });

  it('creates symlink and records in database', async () => {
    fs.writeFileSync(
      path.join(extDir, 'manifest.json'),
      JSON.stringify({
        name: 'my-ext',
        version: '1.0.0',
        description: 'Test',
        type: 'standard',
        commands: {},
        engines: { 'renre-kit': '>=0.0.1', 'extension-sdk': '>=0.0.1' },
      }),
    );

    await handleExtLink({
      localPath: extDir,
      projectPath: null,
    });

    const linkPath = path.join(mockExtensionsDir, 'my-ext@dev');
    expect(fs.lstatSync(linkPath).isSymbolicLink()).toBe(true);
    expect(fs.readlinkSync(linkPath)).toBe(extDir);

    expect(extensionManager.install).toHaveBeenCalledWith(
      'my-ext', 'dev', 'local', 'standard', expect.anything(),
    );
    expect(clack.log.success).toHaveBeenCalledWith(
      expect.stringContaining('my-ext'),
    );
  });

  it('activates in project when projectPath provided', async () => {
    fs.writeFileSync(
      path.join(extDir, 'manifest.json'),
      JSON.stringify({
        name: 'my-ext',
        version: '1.0.0',
        description: 'Test',
        type: 'standard',
        commands: {},
        engines: { 'renre-kit': '>=0.0.1', 'extension-sdk': '>=0.0.1' },
      }),
    );

    await handleExtLink({
      localPath: extDir,
      projectPath: '/tmp/project',
    });

    expect(extensionManager.activate).toHaveBeenCalledWith(
      'my-ext', 'dev', '/tmp/project', expect.any(String),
    );
    expect(clack.log.success).toHaveBeenCalledWith(
      expect.stringContaining('Activated'),
    );
  });
});
