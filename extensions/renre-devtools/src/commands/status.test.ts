import { describe, it, expect } from 'vitest';
import status from './status.js';

describe('renre-devtools:status', () => {
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

  it('returns a non-empty string output', () => {
    const result = status(context);
    expect(typeof result.output).toBe('string');
    expect(result.output.length).toBeGreaterThan(0);
  });

  it('includes version info', () => {
    const result = status(context);
    expect(result.output).toContain('renre-devtools v1.0.0');
  });

  it('includes transport type', () => {
    const result = status(context);
    expect(result.output).toContain('stdio');
  });

  it('includes the npx command', () => {
    const result = status(context);
    expect(result.output).toContain('npx -y @modelcontextprotocol/server-puppeteer');
  });

  it('includes available tools', () => {
    const result = status(context);
    expect(result.output).toContain('puppeteer_navigate');
    expect(result.output).toContain('puppeteer_screenshot');
    expect(result.output).toContain('puppeteer_click');
    expect(result.output).toContain('puppeteer_evaluate');
  });

  it('includes browser mode', () => {
    const result = status(context);
    expect(result.output).toContain('headed');
  });

  it('includes resources', () => {
    const result = status(context);
    expect(result.output).toContain('console://logs');
    expect(result.output).toContain('screenshot://');
  });

  it('includes status indicator', () => {
    const result = status(context);
    expect(result.output).toContain('Status: ready');
  });

  it('ignores context arguments', () => {
    const withArgs = { ...context, args: { verbose: true }, config: { key: 'val' } };
    const result = status(withArgs);
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('renre-devtools v1.0.0');
  });
});
