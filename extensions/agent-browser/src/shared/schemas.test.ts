import { describe, it, expect } from 'vitest';

import {
  refSchema,
  urlSchema,
  scrollDirectionSchema,
  storageTypeSchema,
  storageActionSchema,
  findActionSchema,
} from './schemas.js';

describe('refSchema', () => {
  it('accepts valid refs', () => {
    expect(refSchema.parse('@e1')).toBe('@e1');
    expect(refSchema.parse('#my-element')).toBe('#my-element');
  });

  it('rejects empty string', () => {
    expect(() => refSchema.parse('')).toThrow();
  });
});

describe('urlSchema', () => {
  it('accepts valid URLs', () => {
    expect(urlSchema.parse('https://example.com')).toBe('https://example.com');
  });

  it('rejects empty string', () => {
    expect(() => urlSchema.parse('')).toThrow();
  });
});

describe('scrollDirectionSchema', () => {
  it('accepts valid directions', () => {
    expect(scrollDirectionSchema.parse('up')).toBe('up');
    expect(scrollDirectionSchema.parse('down')).toBe('down');
    expect(scrollDirectionSchema.parse('left')).toBe('left');
    expect(scrollDirectionSchema.parse('right')).toBe('right');
  });

  it('rejects invalid direction', () => {
    expect(() => scrollDirectionSchema.parse('diagonal')).toThrow();
  });
});

describe('storageTypeSchema', () => {
  it('accepts local and session', () => {
    expect(storageTypeSchema.parse('local')).toBe('local');
    expect(storageTypeSchema.parse('session')).toBe('session');
  });

  it('rejects invalid type', () => {
    expect(() => storageTypeSchema.parse('cookie')).toThrow();
  });
});

describe('storageActionSchema', () => {
  it('accepts get, set, and clear', () => {
    expect(storageActionSchema.parse('get')).toBe('get');
    expect(storageActionSchema.parse('set')).toBe('set');
    expect(storageActionSchema.parse('clear')).toBe('clear');
  });
});

describe('findActionSchema', () => {
  it('accepts valid actions', () => {
    expect(findActionSchema.parse('click')).toBe('click');
    expect(findActionSchema.parse('fill')).toBe('fill');
    expect(findActionSchema.parse('hover')).toBe('hover');
  });

  it('rejects invalid action', () => {
    expect(() => findActionSchema.parse('delete')).toThrow();
  });
});
