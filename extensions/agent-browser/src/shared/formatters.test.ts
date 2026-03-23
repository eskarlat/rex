import { describe, it, expect } from 'vitest';

import { toOutput, errorOutput } from './formatters.js';

describe('toOutput', () => {
  it('returns string data as-is', () => {
    const result = toOutput('hello world');
    expect(result).toEqual({ output: 'hello world', exitCode: 0 });
  });

  it('JSON-stringifies object data', () => {
    const result = toOutput({ url: 'https://example.com', title: 'Example' });
    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.output)).toEqual({
      url: 'https://example.com',
      title: 'Example',
    });
  });

  it('JSON-stringifies array data', () => {
    const result = toOutput([1, 2, 3]);
    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.output)).toEqual([1, 2, 3]);
  });

  it('handles null and boolean', () => {
    expect(toOutput(null).output).toBe('null');
    expect(toOutput(true).output).toBe('true');
  });
});

describe('errorOutput', () => {
  it('extracts message from Error instance', () => {
    const result = errorOutput(new Error('something failed'));
    expect(result).toEqual({ output: 'something failed', exitCode: 1 });
  });

  it('converts non-Error to string', () => {
    const result = errorOutput('raw string error');
    expect(result).toEqual({ output: 'raw string error', exitCode: 1 });
  });

  it('converts number to string', () => {
    const result = errorOutput(42);
    expect(result).toEqual({ output: '42', exitCode: 1 });
  });
});
