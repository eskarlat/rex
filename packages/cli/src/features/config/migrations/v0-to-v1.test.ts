import { describe, it, expect } from 'vitest';
import { configV0toV1 } from './v0-to-v1.js';

describe('config v0-to-v1 migration', () => {
  it('should add schemaVersion 1 to existing config data', () => {
    const input = {
      registries: [{ name: 'default', url: 'https://example.com', priority: 0, cacheTTL: 3600 }],
      settings: { theme: 'dark' },
      extensionConfigs: {},
    };

    const result = configV0toV1.migrate(input);

    expect(result['schemaVersion']).toBe(1);
    expect(result['registries']).toEqual(input.registries);
    expect(result['settings']).toEqual(input.settings);
  });

  it('should preserve all existing fields', () => {
    const input = { registries: [], settings: {}, extensionConfigs: {}, custom: 'field' };
    const result = configV0toV1.migrate(input);
    expect(result['custom']).toBe('field');
    expect(result['schemaVersion']).toBe(1);
  });

  it('should have correct fromVersion and toVersion', () => {
    expect(configV0toV1.fromVersion).toBe(0);
    expect(configV0toV1.toVersion).toBe(1);
  });
});
