import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockLoadGlobalConfig = vi.fn();
const mockSaveGlobalConfig = vi.fn();

vi.mock('@clack/prompts', () => ({
  log: { warn: vi.fn(), success: vi.fn() },
}));

vi.mock('../../config/config-manager.js', () => ({
  loadGlobalConfig: (...args: unknown[]) => mockLoadGlobalConfig(...args),
  saveGlobalConfig: (...args: unknown[]) => mockSaveGlobalConfig(...args),
}));

import * as clack from '@clack/prompts';
import { handleRegistryRemove } from './registry-remove.command.js';

describe('registry:remove command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('removes an existing registry from config', () => {
    mockLoadGlobalConfig.mockReturnValue({
      registries: [
        {
          name: 'default',
          url: 'https://github.com/eskarlat/rex.git',
          priority: 0,
          cacheTTL: 3600,
        },
        { name: 'internal', url: 'https://company.com/reg.git', priority: 50, cacheTTL: 3600 },
      ],
      settings: {},
      extensionConfigs: {},
    });

    handleRegistryRemove({ name: 'internal' });

    expect(mockSaveGlobalConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        registries: [expect.objectContaining({ name: 'default' })],
      }),
    );
    expect(clack.log.success).toHaveBeenCalledWith("Registry 'internal' removed.");
  });

  it('warns when registry not found', () => {
    mockLoadGlobalConfig.mockReturnValue({
      registries: [
        {
          name: 'default',
          url: 'https://github.com/eskarlat/rex.git',
          priority: 0,
          cacheTTL: 3600,
        },
      ],
      settings: {},
      extensionConfigs: {},
    });

    handleRegistryRemove({ name: 'nonexistent' });

    expect(clack.log.warn).toHaveBeenCalledWith("Registry 'nonexistent' not found.");
    expect(mockSaveGlobalConfig).not.toHaveBeenCalled();
  });
});
