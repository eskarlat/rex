import type { CommandContext } from '../shared/types.js';

/**
 * Test configuration loaded from environment variables.
 *
 * Set these env vars to run integration tests against a real Atlassian instance:
 *
 *   ATLASSIAN_DOMAIN    — e.g. mycompany.atlassian.net
 *   ATLASSIAN_EMAIL     — e.g. user@company.com
 *   ATLASSIAN_API_TOKEN — API token from https://id.atlassian.com/manage-profile/security/api-tokens
 *   ATLASSIAN_PROJECT_KEY  — Jira project key to use for read tests (e.g. TEST)
 *   ATLASSIAN_ISSUE_KEY    — existing issue key for read tests (e.g. TEST-1)
 *   ATLASSIAN_BOARD_ID     — agile board ID for board/sprint tests
 *   ATLASSIAN_PAGE_ID      — Confluence page ID for page tests
 */
export const testConfig = {
  domain: process.env['ATLASSIAN_DOMAIN'] ?? '',
  email: process.env['ATLASSIAN_EMAIL'] ?? '',
  apiToken: process.env['ATLASSIAN_API_TOKEN'] ?? '',
  projectKey: process.env['ATLASSIAN_PROJECT_KEY'] ?? 'TEST',
  issueKey: process.env['ATLASSIAN_ISSUE_KEY'] ?? 'TEST-1',
  boardId: Number(process.env['ATLASSIAN_BOARD_ID'] ?? '1'),
  pageId: process.env['ATLASSIAN_PAGE_ID'] ?? '12345',
};

/** True when all required Atlassian credentials are provided */
export const hasCredentials = Boolean(
  testConfig.domain && testConfig.email && testConfig.apiToken,
);

/** Build a CommandContext with real credentials from env vars */
export function liveContext(args: Record<string, unknown> = {}): CommandContext {
  return {
    projectName: 'integration-test',
    projectPath: '/tmp/test',
    args,
    config: {
      domain: testConfig.domain,
      email: testConfig.email,
      apiToken: testConfig.apiToken,
    },
  };
}

/** Build a CommandContext with empty config (missing credentials) */
export function missingConfigContext(args: Record<string, unknown> = {}): CommandContext {
  return {
    projectName: 'test',
    projectPath: '/tmp/test',
    args,
    config: {},
  };
}
