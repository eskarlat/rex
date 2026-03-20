import { JiraClient } from '../client/jira-client.js';
import { ConfluenceClient } from '../client/confluence-client.js';
import type { Toolset, ToolDefinition, ToolResult } from './types.js';

// Jira toolsets
import { createIssuesToolset } from './jira/issues.js';
import { createFieldsToolset } from './jira/fields.js';
import { createCommentsToolset } from './jira/comments.js';
import { createTransitionsToolset } from './jira/transitions.js';
import { createProjectsToolset } from './jira/projects.js';
import { createAgileToolset } from './jira/agile.js';
import { createLinksToolset } from './jira/links.js';
import { createWorklogToolset } from './jira/worklog.js';
import { createAttachmentsToolset } from './jira/attachments.js';
import { createUsersToolset } from './jira/users.js';
import { createWatchersToolset } from './jira/watchers.js';
import { createServiceDeskToolset } from './jira/service-desk.js';
import { createFormsToolset } from './jira/forms.js';
import { createMetricsToolset } from './jira/metrics.js';
import { createDevelopmentToolset } from './jira/development.js';

// Confluence toolsets
import { createPagesToolset } from './confluence/pages.js';
import { createConfluenceCommentsToolset } from './confluence/comments.js';
import { createLabelsToolset } from './confluence/labels.js';
import { createConfluenceUsersToolset } from './confluence/users.js';
import { createAnalyticsToolset } from './confluence/analytics.js';
import { createConfluenceAttachmentsToolset } from './confluence/attachments.js';

export interface ToolRegistry {
  tools: ToolDefinition[];
  handlers: Record<string, (args: Record<string, unknown>) => Promise<ToolResult>>;
}

function buildToolsets(jira: JiraClient, confluence: ConfluenceClient): Toolset[] {
  return [
    // Jira
    createIssuesToolset(jira),
    createFieldsToolset(jira),
    createCommentsToolset(jira),
    createTransitionsToolset(jira),
    createProjectsToolset(jira),
    createAgileToolset(jira),
    createLinksToolset(jira),
    createWorklogToolset(jira),
    createAttachmentsToolset(jira),
    createUsersToolset(jira),
    createWatchersToolset(jira),
    createServiceDeskToolset(jira),
    createFormsToolset(jira),
    createMetricsToolset(jira),
    createDevelopmentToolset(jira),
    // Confluence
    createPagesToolset(confluence),
    createConfluenceCommentsToolset(confluence),
    createLabelsToolset(confluence),
    createConfluenceUsersToolset(confluence),
    createAnalyticsToolset(confluence),
    createConfluenceAttachmentsToolset(confluence),
  ];
}

/**
 * Collect tool definitions without requiring valid auth.
 * Creates dummy clients to extract static schema metadata only.
 */
export function collectToolDefinitions(): ToolDefinition[] {
  const dummyConfig = { domain: '', email: '', apiToken: '' };
  const jira = new JiraClient(dummyConfig);
  const confluence = new ConfluenceClient(dummyConfig);
  return buildToolsets(jira, confluence).flatMap((ts) => ts.tools);
}

export function createToolRegistry(jira: JiraClient, confluence: ConfluenceClient): ToolRegistry {
  const toolsets = buildToolsets(jira, confluence);

  const allTools: ToolDefinition[] = [];
  const allHandlers: Record<string, (args: Record<string, unknown>) => Promise<ToolResult>> = {};

  for (const toolset of toolsets) {
    allTools.push(...toolset.tools);
    Object.assign(allHandlers, toolset.handlers);
  }

  return { tools: allTools, handlers: allHandlers };
}
