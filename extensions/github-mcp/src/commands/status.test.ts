import { describe, it, expect } from 'vitest';
import status from './status.js';

describe('github-mcp:status', () => {
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
    expect(result.output).toContain('github-mcp v1.0.0');
  });

  it('includes transport type', () => {
    const result = status(context);
    expect(result.output).toContain('stdio');
  });

  it('includes the npx command', () => {
    const result = status(context);
    expect(result.output).toContain('npx -y @modelcontextprotocol/server-github');
  });

  it('includes available tools', () => {
    const result = status(context);
    expect(result.output).toContain('search_repositories');
    expect(result.output).toContain('create_issue');
    expect(result.output).toContain('create_pull_request');
  });

  it('includes status indicator', () => {
    const result = status(context);
    expect(result.output).toContain('Status: ready');
  });

  it('includes token requirement note', () => {
    const result = status(context);
    expect(result.output).toContain('GITHUB_PERSONAL_ACCESS_TOKEN');
  });

  it('ignores context arguments', () => {
    const withArgs = { ...context, args: { verbose: true }, config: { key: 'val' } };
    const result = status(withArgs);
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('github-mcp v1.0.0');
  });
});
