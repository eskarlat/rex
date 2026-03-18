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
import { handleRegistryAdd } from './registry-add.command.js';

describe('registry:add command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds a new registry to config', () => {
    mockLoadGlobalConfig.mockReturnValue({
      registries: [],
      settings: {},
      extensionConfigs: {},
    });

    handleRegistryAdd({ name: 'internal', url: 'https://github.com/company/registry.git' });

    expect(mockSaveGlobalConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        registries: [
          expect.objectContaining({
            name: 'internal',
            url: 'https://github.com/company/registry.git',
            priority: 100,
            cacheTTL: 3600,
          }),
        ],
      }),
    );
    expect(clack.log.success).toHaveBeenCalledWith("Registry 'internal' added.");
  });

  it('uses custom priority and cacheTTL when provided', () => {
    mockLoadGlobalConfig.mockReturnValue({
      registries: [],
      settings: {},
      extensionConfigs: {},
    });

    handleRegistryAdd({ name: 'custom', url: 'https://example.com/reg.git', priority: 10, cacheTTL: 7200 });

    const saved = mockSaveGlobalConfig.mock.calls[0]?.[0];
    expect(saved.registries[0]).toMatchObject({ priority: 10, cacheTTL: 7200 });
  });

  it('warns and does not save when registry name already exists', () => {
    mockLoadGlobalConfig.mockReturnValue({
      registries: [{ name: 'internal', url: 'https://old.com/reg.git', priority: 50, cacheTTL: 3600 }],
      settings: {},
      extensionConfigs: {},
    });

    handleRegistryAdd({ name: 'internal', url: 'https://new.com/reg.git' });

    expect(clack.log.warn).toHaveBeenCalledWith("Registry 'internal' already exists.");
    expect(mockSaveGlobalConfig).not.toHaveBeenCalled();
  });
});
