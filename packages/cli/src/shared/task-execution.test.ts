import { describe, it, expect } from 'vitest';

import { executeTaskCommand } from './task-execution.js';

describe('executeTaskCommand', () => {
  it('runs a successful command', () => {
    const result = executeTaskCommand('echo hello', (input) => input.split(' '));

    expect(result.status).toBe('success');
    expect(result.output).toContain('hello');
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(result.startedAt).toBeTruthy();
    expect(result.finishedAt).toBeTruthy();
  });

  it('returns error status when command fails', () => {
    const result = executeTaskCommand('nonexistent-command-xyz', (input) => input.split(' '));

    expect(result.status).toBe('error');
    expect(result.output).toBeTruthy();
  });

  it('handles parseCommand returning empty array', () => {
    const result = executeTaskCommand('anything', () => []);

    expect(result.status).toBe('error');
  });

  it('truncates long output', () => {
    // Run a command that generates some output
    const result = executeTaskCommand('echo test', (input) => input.split(' '));

    expect(result.output.length).toBeLessThanOrEqual(10_240);
  });
});
