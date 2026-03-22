import { ConfluenceClient } from '../client/confluence-client.js';
import { JiraClient } from '../client/jira-client.js';

import { atlassianConfigSchema } from './schemas.js';
import type { ExecutionContext } from './types.js';

export interface AtlassianClients {
  jira: JiraClient;
  confluence: ConfluenceClient;
}

export function createClients(context: ExecutionContext): AtlassianClients {
  const result = atlassianConfigSchema.safeParse(context.config);

  if (!result.success) {
    const details = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(
      `Invalid Atlassian config (${details}). Configure via: ` +
        'renre-kit ext config renre-atlassian --set domain=<company>.atlassian.net && ' +
        'renre-kit ext config renre-atlassian --set email=<user@company.com> && ' +
        'renre-kit vault set renre-atlassian.apiToken',
    );
  }

  const config = result.data;
  return {
    jira: new JiraClient(config),
    confluence: new ConfluenceClient(config),
  };
}
