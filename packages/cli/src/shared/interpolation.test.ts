import { describe, it, expect } from 'vitest';
import { interpolate } from './interpolation.js';
import { ErrorCode } from '../core/errors/extension-error.js';

describe('interpolation', () => {
  describe('interpolate', () => {
    it('should replace a simple config variable', () => {
      const result = interpolate('Hello ${config.name}', { name: 'World' });
      expect(result).toBe('Hello World');
    });

    it('should replace multiple config variables', () => {
      const result = interpolate(
        '${config.proto}://${config.host}:${config.port}',
        { proto: 'https', host: 'localhost', port: 8080 },
      );
      expect(result).toBe('https://localhost:8080');
    });

    it('should handle nested config access', () => {
      const result = interpolate('Key: ${config.nested.field}', {
        nested: { field: 'deep-value' },
      });
      expect(result).toBe('Key: deep-value');
    });

    it('should handle deeply nested config access', () => {
      const result = interpolate('${config.a.b.c}', {
        a: { b: { c: 'found' } },
      });
      expect(result).toBe('found');
    });

    it('should convert number values to string', () => {
      const result = interpolate('Port: ${config.port}', { port: 3000 });
      expect(result).toBe('Port: 3000');
    });

    it('should convert boolean values to string', () => {
      const result = interpolate('Enabled: ${config.enabled}', {
        enabled: true,
      });
      expect(result).toBe('Enabled: true');
    });

    it('should return template unchanged when no variables present', () => {
      const result = interpolate('no variables here', { key: 'value' });
      expect(result).toBe('no variables here');
    });

    it('should throw on missing config key', () => {
      expect(() =>
        interpolate('${config.missing}', { other: 'value' }),
      ).toThrow();
      try {
        interpolate('${config.missing}', { other: 'value' });
      } catch (err: unknown) {
        const error = err as { code: string };
        expect(error.code).toBe(ErrorCode.INTERPOLATION_FAILED);
      }
    });

    it('should throw on missing nested config key', () => {
      expect(() =>
        interpolate('${config.a.b.c}', { a: { b: {} } }),
      ).toThrow();
    });

    it('should throw when intermediate path is not an object', () => {
      expect(() =>
        interpolate('${config.a.b}', { a: 'string' }),
      ).toThrow();
    });

    it('should handle empty template', () => {
      const result = interpolate('', { key: 'value' });
      expect(result).toBe('');
    });

    it('should handle template with only a variable', () => {
      const result = interpolate('${config.key}', { key: 'value' });
      expect(result).toBe('value');
    });

    it('should not replace non-config variables', () => {
      const result = interpolate('${env.PATH}', { PATH: '/usr/bin' });
      expect(result).toBe('${env.PATH}');
    });

    it('should handle dollar sign without braces', () => {
      const result = interpolate('$config.key', { key: 'value' });
      expect(result).toBe('$config.key');
    });
  });
});
