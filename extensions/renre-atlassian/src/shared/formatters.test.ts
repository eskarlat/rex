vi.mock('@renre-kit/extension-sdk/node', () => ({
  jsonToMarkdown: vi.fn((data: unknown) => `markdown:${JSON.stringify(data)}`),
}));

import { toOutput, errorOutput } from './formatters.js';
import { jsonToMarkdown } from '@renre-kit/extension-sdk/node';

describe('toOutput', () => {
  it('returns CommandResult with exitCode 0 and markdown output', () => {
    const data = { key: 'TEST-1', summary: 'Test issue' };
    const result = toOutput(data);

    expect(result.exitCode).toBe(0);
    expect(result.output).toBe(`markdown:${JSON.stringify(data)}`);
  });

  it('calls jsonToMarkdown with filterNoise: true', () => {
    const data = { id: 1 };
    toOutput(data);

    expect(jsonToMarkdown).toHaveBeenCalledWith(data, { filterNoise: true });
  });

  it('handles array data', () => {
    const data = [{ key: 'TEST-1' }, { key: 'TEST-2' }];
    const result = toOutput(data);

    expect(result.exitCode).toBe(0);
    expect(result.output).toBe(`markdown:${JSON.stringify(data)}`);
  });

  it('handles null data', () => {
    const result = toOutput(null);

    expect(result.exitCode).toBe(0);
    expect(jsonToMarkdown).toHaveBeenCalledWith(null, { filterNoise: true });
  });
});

describe('errorOutput', () => {
  it('returns exitCode 1 with Error message', () => {
    const err = new Error('Something went wrong');
    const result = errorOutput(err);

    expect(result.exitCode).toBe(1);
    expect(result.output).toBe('Something went wrong');
  });

  it('handles non-Error (string)', () => {
    const result = errorOutput('a string error');

    expect(result.exitCode).toBe(1);
    expect(result.output).toBe('a string error');
  });

  it('handles non-Error (number)', () => {
    const result = errorOutput(42);

    expect(result.exitCode).toBe(1);
    expect(result.output).toBe('42');
  });

  it('handles non-Error (undefined)', () => {
    const result = errorOutput(undefined);

    expect(result.exitCode).toBe(1);
    expect(result.output).toBe('undefined');
  });
});
