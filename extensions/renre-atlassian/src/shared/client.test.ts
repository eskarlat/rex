import { createClients } from './client.js';
import type { ExecutionContext } from './types.js';

vi.mock('../client/jira-client.js', () => ({
  JiraClient: vi.fn(),
}));

vi.mock('../client/confluence-client.js', () => ({
  ConfluenceClient: vi.fn(),
}));

function createMockContext(configOverrides: Record<string, unknown> = {}): ExecutionContext {
  return {
    projectName: 'test-project',
    projectPath: '/tmp/test-project',
    args: {},
    config: {
      domain: 'company.atlassian.net',
      email: 'user@example.com',
      apiToken: 'test-token-123',
      ...configOverrides,
    },
  };
}

describe('createClients', () => {
  it('throws error when domain is missing', () => {
    const context = createMockContext({ domain: undefined });

    expect(() => createClients(context)).toThrow('Missing Atlassian configuration');
  });

  it('throws error when domain is empty string', () => {
    const context = createMockContext({ domain: '' });

    expect(() => createClients(context)).toThrow('Missing Atlassian configuration');
  });

  it('throws error when email is missing', () => {
    const context = createMockContext({ email: undefined });

    expect(() => createClients(context)).toThrow('Missing Atlassian configuration');
  });

  it('throws error when email is empty string', () => {
    const context = createMockContext({ email: '' });

    expect(() => createClients(context)).toThrow('Missing Atlassian configuration');
  });

  it('throws error when apiToken is missing', () => {
    const context = createMockContext({ apiToken: undefined });

    expect(() => createClients(context)).toThrow('Missing Atlassian configuration');
  });

  it('throws error when apiToken is empty string', () => {
    const context = createMockContext({ apiToken: '' });

    expect(() => createClients(context)).toThrow('Missing Atlassian configuration');
  });

  it('returns { jira, confluence } when all config present', () => {
    const context = createMockContext();
    const clients = createClients(context);

    expect(clients).toHaveProperty('jira');
    expect(clients).toHaveProperty('confluence');
  });

  it('includes helpful setup instructions in error message', () => {
    const context = createMockContext({ domain: undefined });

    expect(() => createClients(context)).toThrow('renre-kit ext config renre-atlassian');
    expect(() => createClients(context)).toThrow('renre-kit vault set');
  });
});
