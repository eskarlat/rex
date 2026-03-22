import { defineCommand } from '@renre-kit/extension-sdk/node';

const JIRA_HELP = `# Jira Commands Reference

All commands use the \`renre-atlassian:\` prefix. Arguments are passed as \`--key "value"\` flags.

## Issues
| Command | Description | Required Args |
|---------|-------------|---------------|
| \`jira-get-issue\` | Get issue by key | \`--issueKey "PROJ-123"\` |
| \`jira-search\` | Search issues with JQL | \`--jql "project = PROJ"\` |
| \`jira-get-project-issues\` | Get all issues for a project | \`--projectKey "PROJ"\` |
| \`jira-create-issue\` | Create a new issue | \`--projectKey --issueType --summary\` |
| \`jira-update-issue\` | Update issue fields | \`--issueKey --fields '{...}'\` |
| \`jira-delete-issue\` | Delete an issue | \`--issueKey "PROJ-123"\` |
| \`jira-batch-create-issues\` | Bulk create issues | \`--issues '[{...}]'\` |
| \`jira-get-changelogs\` | Get issue changelog | \`--issueKey "PROJ-123"\` |

## Fields
| Command | Description | Required Args |
|---------|-------------|---------------|
| \`jira-search-fields\` | List all fields | (none) |
| \`jira-get-field-options\` | Get field options | \`--fieldId --contextId\` |

## Comments
| Command | Description | Required Args |
|---------|-------------|---------------|
| \`jira-add-comment\` | Add comment to issue | \`--issueKey --body\` |
| \`jira-edit-comment\` | Edit existing comment | \`--issueKey --commentId --body\` |

## Transitions
| Command | Description | Required Args |
|---------|-------------|---------------|
| \`jira-get-transitions\` | Get available transitions | \`--issueKey "PROJ-123"\` |
| \`jira-transition-issue\` | Move issue through workflow | \`--issueKey --transitionId\` |

## Projects
| Command | Description | Required Args |
|---------|-------------|---------------|
| \`jira-get-all-projects\` | List all projects | (none) |
| \`jira-get-project-versions\` | Get project versions | \`--projectKey "PROJ"\` |
| \`jira-get-project-components\` | Get project components | \`--projectKey "PROJ"\` |
| \`jira-create-version\` | Create release version | \`--projectKey --name\` |
| \`jira-batch-create-versions\` | Create multiple versions | \`--projectKey --versions '[...]'\` |

## Agile
| Command | Description | Required Args |
|---------|-------------|---------------|
| \`jira-get-agile-boards\` | List all boards | (none) |
| \`jira-get-board-issues\` | Get issues on a board | \`--boardId 42\` |
| \`jira-get-sprints-from-board\` | List sprints for a board | \`--boardId 42\` |
| \`jira-get-sprint-issues\` | Get issues in a sprint | \`--sprintId 15\` |
| \`jira-create-sprint\` | Create a sprint | \`--boardId --name\` |
| \`jira-update-sprint\` | Update sprint details | \`--sprintId\` |
| \`jira-add-issues-to-sprint\` | Move issues to sprint | \`--sprintId --issueKeys '[...]'\` |

## Links
| Command | Description | Required Args |
|---------|-------------|---------------|
| \`jira-get-link-types\` | Get available link types | (none) |
| \`jira-link-to-epic\` | Link issues to epic | \`--epicKey --issueKeys '[...]'\` |
| \`jira-create-issue-link\` | Link two issues | \`--typeName --inwardIssueKey --outwardIssueKey\` |
| \`jira-create-remote-issue-link\` | Link to external URL | \`--issueKey --url --title\` |
| \`jira-remove-issue-link\` | Remove a link | \`--linkId\` |

## Worklog
| Command | Description | Required Args |
|---------|-------------|---------------|
| \`jira-get-worklog\` | Get work log entries | \`--issueKey "PROJ-123"\` |
| \`jira-add-worklog\` | Log time spent | \`--issueKey --timeSpent\` |

## Attachments
| Command | Description | Required Args |
|---------|-------------|---------------|
| \`jira-download-attachment\` | Download attachment | \`--attachmentId\` |
| \`jira-get-issue-images\` | Get image attachments | \`--issueKey "PROJ-123"\` |

## Users
| Command | Description | Required Args |
|---------|-------------|---------------|
| \`jira-get-user-profile\` | Get user profile | (none) or \`--accountId\` |

## Watchers
| Command | Description | Required Args |
|---------|-------------|---------------|
| \`jira-get-issue-watchers\` | List watchers | \`--issueKey "PROJ-123"\` |
| \`jira-add-watcher\` | Add a watcher | \`--issueKey --accountId\` |
| \`jira-remove-watcher\` | Remove a watcher | \`--issueKey --accountId\` |

## Service Desk
| Command | Description | Required Args |
|---------|-------------|---------------|
| \`jira-get-service-desks\` | List service desks | (none) |
| \`jira-get-service-desk-queues\` | Get queues | \`--serviceDeskId\` |
| \`jira-get-queue-issues\` | Get queue issues | \`--serviceDeskId --queueId\` |

## Forms
| Command | Description | Required Args |
|---------|-------------|---------------|
| \`jira-get-issue-forms\` | Get Proforma forms | \`--issueKey "PROJ-123"\` |
| \`jira-get-form-details\` | Get form details | \`--issueKey --formId\` |
| \`jira-update-form-answers\` | Update form answers | \`--issueKey --formId --answers '{...}'\` |

## Metrics
| Command | Description | Required Args |
|---------|-------------|---------------|
| \`jira-get-issue-dates\` | Get date fields | \`--issueKey "PROJ-123"\` |
| \`jira-get-issue-sla\` | Get SLA info | \`--issueKey "PROJ-123"\` |

## Development
| Command | Description | Required Args |
|---------|-------------|---------------|
| \`jira-get-dev-info\` | Get dev info (commits, PRs) | \`--issueId\` |
| \`jira-get-dev-summary\` | Get dev summary | \`--issueId\` |
| \`jira-get-batch-dev-info\` | Batch dev info | \`--issueIds '[...]'\` |

## Common Patterns

### Search with JQL
\`\`\`
renre-kit renre-atlassian:jira-search --jql "project = PROJ AND status = 'In Progress'"
renre-kit renre-atlassian:jira-search --jql "assignee = currentUser() ORDER BY updated DESC" --maxResults 20
\`\`\`

### Transition an issue
\`\`\`
renre-kit renre-atlassian:jira-get-transitions --issueKey "PROJ-123"
renre-kit renre-atlassian:jira-transition-issue --issueKey "PROJ-123" --transitionId "31"
\`\`\`

### Create issue with description
\`\`\`
renre-kit renre-atlassian:jira-create-issue --projectKey "PROJ" --issueType "Task" --summary "My task" --description "Details here"
\`\`\`
`;

export default defineCommand({
  handler: () => ({
    output: JIRA_HELP,
    exitCode: 0,
  }),
});
