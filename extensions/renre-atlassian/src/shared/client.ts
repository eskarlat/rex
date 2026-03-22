import { ConfluenceClient } from '../client/confluence-client.js';
import { JiraClient } from '../client/jira-client.js';

import type { ExecutionContext } from './types.js';

export interface AtlassianClients {
  jira: JiraClient;
  confluence: ConfluenceClient;
}

export function createClients(context: ExecutionContext): AtlassianClients {
  const domain = context.config['domain'] as string | undefined;
  const email = context.config['email'] as string | undefined;
  const apiToken = context.config['apiToken'] as string | undefined;

  if (!domain || !email || !apiToken) {
    throw new Error(
      'Missing Atlassian configuration. Set domain, email, and apiToken via: ' +
        'renre-kit ext config renre-atlassian --set domain=<company>.atlassian.net && ' +
        'renre-kit ext config renre-atlassian --set email=<user@company.com> && ' +
        'renre-kit vault set renre-atlassian.apiToken',
    );
  }

  const config = { domain, email, apiToken };
  return {
    jira: new JiraClient(config),
    confluence: new ConfluenceClient(config),
  };
}
