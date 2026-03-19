import { describe, it, expect } from 'vitest';
import type { ExtensionManifest } from '../types/extension.types.js';
import { checkEngineCompat } from './engine-compat.js';

function makeManifest(engines: ExtensionManifest['engines']): ExtensionManifest {
  return {
    name: 'test-ext',
    version: '1.0.0',
    description: 'Test',
    type: 'standard',
    commands: {},
    engines,
  };
}

const defaultEngines = { 'renre-kit': '>=0.0.1', 'extension-sdk': '>=0.0.1' };

describe('checkEngineCompat', () => {
  it('returns compatible when versions satisfy constraints', () => {
    const result = checkEngineCompat(
      makeManifest(defaultEngines),
      '1.0.0',
      '1.0.0',
    );
    expect(result.compatible).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('returns incompatible when core version is below minimum', () => {
    const result = checkEngineCompat(
      makeManifest({ 'renre-kit': '>=2.0.0', 'extension-sdk': '>=0.0.1' }),
      '1.0.0',
      '1.0.0',
    );
    expect(result.compatible).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]).toContain('renre-kit');
    expect(result.issues[0]).toContain('>=2.0.0');
  });

  it('returns incompatible when sdk version is below minimum', () => {
    const result = checkEngineCompat(
      makeManifest({ 'renre-kit': '>=0.0.1', 'extension-sdk': '>=2.0.0' }),
      '1.0.0',
      '1.0.0',
    );
    expect(result.compatible).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]).toContain('extension-sdk');
  });

  it('returns compatible on exact boundary match', () => {
    const result = checkEngineCompat(
      makeManifest({ 'renre-kit': '>=1.0.0', 'extension-sdk': '>=0.0.1' }),
      '1.0.0',
      '0.0.1',
    );
    expect(result.compatible).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('reports both issues when both engines are incompatible', () => {
    const result = checkEngineCompat(
      makeManifest({ 'renre-kit': '>=5.0.0', 'extension-sdk': '>=3.0.0' }),
      '1.0.0',
      '1.0.0',
    );
    expect(result.compatible).toBe(false);
    expect(result.issues).toHaveLength(2);
  });

  it('handles major version boundary correctly', () => {
    const result = checkEngineCompat(
      makeManifest({ 'renre-kit': '>=2.0.0', 'extension-sdk': '>=0.0.1' }),
      '1.99.99',
      '0.0.1',
    );
    expect(result.compatible).toBe(false);
  });

  it('compatible when constraints match exactly', () => {
    const result = checkEngineCompat(
      makeManifest({ 'renre-kit': '>=0.0.1', 'extension-sdk': '>=0.0.1' }),
      '0.0.1',
      '0.0.1',
    );
    expect(result.compatible).toBe(true);
    expect(result.issues).toEqual([]);
  });
});
