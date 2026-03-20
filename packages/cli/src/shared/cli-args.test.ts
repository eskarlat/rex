import { describe, it, expect } from 'vitest';
import { parseCliArgs } from './cli-args.js';

describe('parseCliArgs', () => {
  it('parses --key value pairs into an object', () => {
    const result = parseCliArgs(['--query', 'how to use hooks', '--libraryName', 'react']);
    expect(result).toEqual({ query: 'how to use hooks', libraryName: 'react' });
  });

  it('handles boolean flags (no following value)', () => {
    const result = parseCliArgs(['--verbose', '--name', 'test']);
    expect(result).toEqual({ verbose: true, name: 'test' });
  });

  it('handles boolean flag at the end', () => {
    const result = parseCliArgs(['--name', 'test', '--verbose']);
    expect(result).toEqual({ name: 'test', verbose: true });
  });

  it('handles consecutive boolean flags', () => {
    const result = parseCliArgs(['--verbose', '--debug']);
    expect(result).toEqual({ verbose: true, debug: true });
  });

  it('collects positional args into _positional', () => {
    const result = parseCliArgs(['hello', 'world']);
    expect(result).toEqual({ _positional: ['hello', 'world'] });
  });

  it('handles mixed positional and named args', () => {
    const result = parseCliArgs(['positional', '--key', 'value']);
    expect(result).toEqual({ _positional: ['positional'], key: 'value' });
  });

  it('returns empty object for empty input', () => {
    const result = parseCliArgs([]);
    expect(result).toEqual({});
  });

  it('handles single --key value pair', () => {
    const result = parseCliArgs(['--libraryId', '/react/docs']);
    expect(result).toEqual({ libraryId: '/react/docs' });
  });

  it('handles values that look like paths', () => {
    const result = parseCliArgs(['--libraryId', '/reactjs/react.dev', '--query', 'hooks']);
    expect(result).toEqual({ libraryId: '/reactjs/react.dev', query: 'hooks' });
  });
});
