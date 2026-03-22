import type { CommandContext } from '../shared/types.js';
import confluenceHelp from './confluence-help.js';

function makeContext(): CommandContext {
  return {
    projectName: 'test',
    projectPath: '/tmp/test',
    args: {},
    config: { domain: 'test.atlassian.net', email: 'test@test.com', apiToken: 'token' },
  };
}

describe('confluence-help', () => {
  it('should return exitCode 0', () => {
    const result = confluenceHelp.handler(makeContext());
    expect(result.exitCode).toBe(0);
  });

  it('should contain "Confluence Commands Reference" in output', () => {
    const result = confluenceHelp.handler(makeContext());
    expect(result.output).toContain('Confluence Commands Reference');
  });

  it('should contain key command names', () => {
    const result = confluenceHelp.handler(makeContext());
    expect(result.output).toContain('confluence-search');
    expect(result.output).toContain('confluence-get-page');
    expect(result.output).toContain('confluence-create-page');
    expect(result.output).toContain('confluence-get-comments');
    expect(result.output).toContain('confluence-add-label');
  });
});
