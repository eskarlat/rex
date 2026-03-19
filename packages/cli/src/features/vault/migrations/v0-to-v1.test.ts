import { describe, it, expect } from 'vitest';
import { vaultV0toV1 } from './v0-to-v1.js';

describe('vault v0-to-v1 migration', () => {
  it('should wrap flat entries in envelope with schemaVersion', () => {
    const input = {
      api_token: { value: 'encrypted-data', secret: true, tags: ['auth'] },
      api_url: { value: 'https://example.com', secret: false, tags: [] },
    };

    const result = vaultV0toV1.migrate(input);

    expect(result['schemaVersion']).toBe(1);
    expect(result['entries']).toEqual(input);
  });

  it('should handle empty vault', () => {
    const result = vaultV0toV1.migrate({});
    expect(result).toEqual({ schemaVersion: 1, entries: {} });
  });

  it('should not include schemaVersion in entries if somehow present in v0', () => {
    const input = {
      schemaVersion: 0 as unknown,
      api_url: { value: 'https://example.com', secret: false, tags: [] },
    } as Record<string, unknown>;

    const result = vaultV0toV1.migrate(input);
    expect(result['schemaVersion']).toBe(1);
    const entries = result['entries'] as Record<string, unknown>;
    expect(entries['schemaVersion']).toBeUndefined();
  });

  it('should have correct fromVersion and toVersion', () => {
    expect(vaultV0toV1.fromVersion).toBe(0);
    expect(vaultV0toV1.toVersion).toBe(1);
  });
});
