import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { info: vi.fn(), success: vi.fn() },
}));

vi.mock('../manager/extension-manager.js', () => ({
  status: vi.fn(),
}));

vi.mock('../../../core/database/database.js', () => ({
  getDb: vi.fn().mockReturnValue({}),
}));

vi.mock('../update-cache/update-cache.js', () => ({
  readUpdateCache: vi.fn(),
}));

import * as clack from '@clack/prompts';
import { handleExtList } from './ext-list.command.js';
import * as extensionManager from '../manager/extension-manager.js';
import { readUpdateCache } from '../update-cache/update-cache.js';

describe('ext-list command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(readUpdateCache).mockReturnValue(null);
  });

  it('displays installed extensions and status', () => {
    vi.mocked(extensionManager.status).mockReturnValue([
      {
        name: 'ext-a',
        version: '1.0.0',
        type: 'standard',
        activatedInProject: true,
        activatedVersion: '1.0.0',
      },
      {
        name: 'ext-b',
        version: '2.0.0',
        type: 'mcp',
        activatedInProject: false,
        activatedVersion: null,
      },
    ]);

    handleExtList({ projectPath: '/tmp/project' });

    expect(extensionManager.status).toHaveBeenCalledWith('/tmp/project', expect.anything());
    expect(clack.log.info).toHaveBeenCalled();
  });

  it('shows message when no extensions installed', () => {
    vi.mocked(extensionManager.status).mockReturnValue([]);

    handleExtList({ projectPath: '/tmp/project' });

    expect(clack.log.info).toHaveBeenCalledWith(expect.stringContaining('No extensions'));
  });

  it('shows update available badge when cache has update', () => {
    vi.mocked(extensionManager.status).mockReturnValue([
      {
        name: 'ext-a',
        version: '1.0.0',
        type: 'standard',
        activatedInProject: true,
        activatedVersion: '1.0.0',
      },
    ]);
    vi.mocked(readUpdateCache).mockReturnValue({
      checkedAt: '2026-01-01T00:00:00Z',
      updates: [
        {
          name: 'ext-a',
          installedVersion: '1.0.0',
          availableVersion: '2.0.0',
          engineCompatible: true,
          engineIssues: [],
          registryName: 'default',
        },
      ],
    });

    handleExtList({ projectPath: '/tmp/project' });

    const call = vi.mocked(clack.log.info).mock.calls[0]![0] as string;
    expect(call).toContain('-> 2.0.0 available');
  });

  it('shows incompatible engine badge when update is incompatible', () => {
    vi.mocked(extensionManager.status).mockReturnValue([
      {
        name: 'ext-a',
        version: '1.0.0',
        type: 'standard',
        activatedInProject: false,
        activatedVersion: null,
      },
    ]);
    vi.mocked(readUpdateCache).mockReturnValue({
      checkedAt: '2026-01-01T00:00:00Z',
      updates: [
        {
          name: 'ext-a',
          installedVersion: '1.0.0',
          availableVersion: '2.0.0',
          engineCompatible: false,
          engineIssues: ['Requires renre-kit >=5.0.0'],
          registryName: 'default',
        },
      ],
    });

    handleExtList({ projectPath: '/tmp/project' });

    const call = vi.mocked(clack.log.info).mock.calls[0]![0] as string;
    expect(call).toContain('-> 2.0.0 incompatible engine');
  });

  it('shows no badge when no cache exists', () => {
    vi.mocked(extensionManager.status).mockReturnValue([
      {
        name: 'ext-a',
        version: '1.0.0',
        type: 'standard',
        activatedInProject: true,
        activatedVersion: '1.0.0',
      },
    ]);
    vi.mocked(readUpdateCache).mockReturnValue(null);

    handleExtList({ projectPath: '/tmp/project' });

    const call = vi.mocked(clack.log.info).mock.calls[0]![0] as string;
    expect(call).not.toContain('available');
    expect(call).not.toContain('incompatible');
  });
});
