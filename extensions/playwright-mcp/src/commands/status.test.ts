import { describe, it, expect } from 'vitest';
import status from './status.js';

describe('playwright-mcp:status', () => {
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
    expect(result.output).toContain('playwright-mcp v1.0.0');
  });

  it('includes transport type', () => {
    const result = status(context);
    expect(result.output).toContain('stdio');
  });

  it('includes the npx command', () => {
    const result = status(context);
    expect(result.output).toContain('npx -y @anthropic-ai/playwright-mcp@latest');
  });

  it('includes available tools', () => {
    const result = status(context);
    expect(result.output).toContain('browser_navigate');
    expect(result.output).toContain('browser_screenshot');
    expect(result.output).toContain('browser_click');
    expect(result.output).toContain('browser_snapshot');
  });

  it('includes status indicator', () => {
    const result = status(context);
    expect(result.output).toContain('Status: ready');
  });

  it('ignores context arguments', () => {
    const withArgs = { ...context, args: { verbose: true }, config: { key: 'val' } };
    const result = status(withArgs);
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('playwright-mcp v1.0.0');
  });
});
