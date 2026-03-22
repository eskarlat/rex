import type { CommandContext } from '../shared/types.js';
import jiraHelp from './jira-help.js';

function makeContext(): CommandContext {
  return {
    projectName: 'test',
    projectPath: '/tmp/test',
    args: {},
    config: { domain: 'test.atlassian.net', email: 'test@test.com', apiToken: 'token' },
  };
}

describe('jira-help', () => {
  it('should return exitCode 0', () => {
    const result = jiraHelp.handler(makeContext());
    expect(result.exitCode).toBe(0);
  });

  it('should contain "Jira Commands Reference" in output', () => {
    const result = jiraHelp.handler(makeContext());
    expect(result.output).toContain('Jira Commands Reference');
  });

  it('should contain key command names', () => {
    const result = jiraHelp.handler(makeContext());
    expect(result.output).toContain('jira-get-issue');
    expect(result.output).toContain('jira-search');
    expect(result.output).toContain('jira-create-issue');
    expect(result.output).toContain('jira-get-transitions');
    expect(result.output).toContain('jira-get-all-projects');
  });
});
