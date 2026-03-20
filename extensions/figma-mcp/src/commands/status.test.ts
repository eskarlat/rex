import { describe, it, expect } from 'vitest';
import status from './status.js';

describe('figma-mcp:status', () => {
  const context = {
    projectName: 'test-project',
    projectPath: '/tmp/test',
    args: {},
    config: {},
  };

  it('returns exit code 0', () => {
    const result = status(context);
    expect(result.exitCode).toBe(0);
  });

  it('returns a string output', () => {
    const result = status(context);
    expect(typeof result.output).toBe('string');
    expect(result.output.length).toBeGreaterThan(0);
  });

  it('includes version info', () => {
    const result = status(context);
    expect(result.output).toContain('figma-mcp v1.0.0');
  });

  it('includes transport type', () => {
    const result = status(context);
    expect(result.output).toContain('sse');
  });

  it('includes SSE URL', () => {
    const result = status(context);
    expect(result.output).toContain('http://localhost:3845/sse');
  });

  it('includes available tools', () => {
    const result = status(context);
    expect(result.output).toContain('get_file');
    expect(result.output).toContain('get_file_nodes');
    expect(result.output).toContain('get_images');
    expect(result.output).toContain('get_comments');
    expect(result.output).toContain('post_comment');
    expect(result.output).toContain('get_team_projects');
    expect(result.output).toContain('get_project_files');
  });

  it('includes status indicator', () => {
    const result = status(context);
    expect(result.output).toContain('Status: ready');
  });

  it('ignores context arguments', () => {
    const withArgs = { ...context, args: { verbose: true }, config: { key: 'val' } };
    const result = status(withArgs);
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('figma-mcp v1.0.0');
  });
});
