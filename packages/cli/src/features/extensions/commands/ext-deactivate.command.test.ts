import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('../manager/extension-manager.js', () => ({
  deactivate: vi.fn().mockResolvedValue(undefined),
}));

import * as clack from '@clack/prompts';
import { handleExtDeactivate } from './ext-deactivate.command.js';
import * as extensionManager from '../manager/extension-manager.js';

describe('ext-deactivate command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deactivates extension from project', async () => {
    await handleExtDeactivate({
      name: 'my-ext',
      projectPath: '/tmp/project',
      extensionDir: '/path/to/ext',
    });

    expect(extensionManager.deactivate).toHaveBeenCalledWith(
      'my-ext',
      '/tmp/project',
      '/path/to/ext',
    );
    expect(clack.log.success).toHaveBeenCalled();
  });

  it('handles deactivation failure gracefully', async () => {
    vi.mocked(extensionManager.deactivate).mockRejectedValue(new Error('Hook failed'));

    await handleExtDeactivate({
      name: 'my-ext',
      projectPath: '/tmp/project',
      extensionDir: '/path/to/ext',
    });

    expect(clack.log.error).toHaveBeenCalled();
  });

  it('handles non-Error thrown during deactivation', async () => {
    vi.mocked(extensionManager.deactivate).mockRejectedValue('string error');

    await handleExtDeactivate({
      name: 'my-ext',
      projectPath: '/tmp/project',
      extensionDir: '/path/to/ext',
    });

    expect(clack.log.error).toHaveBeenCalledWith(
      expect.stringContaining('string error'),
    );
  });
});
