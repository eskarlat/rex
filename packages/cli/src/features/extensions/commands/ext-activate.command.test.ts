import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('../manager/extension-manager.js', () => ({
  activate: vi.fn().mockResolvedValue(undefined),
}));

import * as clack from '@clack/prompts';
import { handleExtActivate } from './ext-activate.command.js';
import * as extensionManager from '../manager/extension-manager.js';

describe('ext-activate command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('activates extension in project', async () => {
    await handleExtActivate({
      name: 'my-ext',
      version: '1.0.0',
      projectPath: '/tmp/project',
      extensionDir: '/path/to/ext',
    });

    expect(extensionManager.activate).toHaveBeenCalledWith('my-ext', '1.0.0', '/tmp/project', '/path/to/ext');
    expect(clack.log.success).toHaveBeenCalled();
  });

  it('handles activation failure gracefully', async () => {
    vi.mocked(extensionManager.activate).mockRejectedValue(new Error('Hook failed'));

    await handleExtActivate({
      name: 'my-ext',
      version: '1.0.0',
      projectPath: '/tmp/project',
      extensionDir: '/path/to/ext',
    });

    expect(clack.log.error).toHaveBeenCalled();
  });
});
