import { defineCommand } from '@renre-kit/extension-sdk/node';

const CONFLUENCE_HELP = `# Confluence Commands Reference

All commands use the \`renre-atlassian:\` prefix. Arguments are passed as \`--key "value"\` flags.

## Pages
| Command | Description | Required Args |
|---------|-------------|---------------|
| \`confluence-search\` | Search with CQL | \`--cql "type = page AND space = DEV"\` |
| \`confluence-get-page\` | Get page by ID | \`--pageId "123456"\` |
| \`confluence-get-page-children\` | Get child pages | \`--pageId "123456"\` |
| \`confluence-get-page-history\` | Get version history | \`--pageId "123456"\` |
| \`confluence-create-page\` | Create a page | \`--spaceKey --title --body\` |
| \`confluence-update-page\` | Update a page | \`--pageId --title --body --version\` |
| \`confluence-delete-page\` | Delete a page | \`--pageId "123456"\` |
| \`confluence-move-page\` | Move page to new parent | \`--pageId --targetAncestorId --currentVersion\` |
| \`confluence-get-page-diff\` | Compare two versions | \`--pageId --fromVersion --toVersion\` |

## Comments
| Command | Description | Required Args |
|---------|-------------|---------------|
| \`confluence-get-comments\` | Get page comments | \`--pageId "123456"\` |
| \`confluence-add-comment\` | Add a comment | \`--pageId --body\` |
| \`confluence-reply-to-comment\` | Reply to a comment | \`--pageId --parentCommentId --body\` |

## Labels
| Command | Description | Required Args |
|---------|-------------|---------------|
| \`confluence-get-labels\` | Get page labels | \`--pageId "123456"\` |
| \`confluence-add-label\` | Add labels | \`--pageId --labels '["api", "docs"]'\` |

## Users
| Command | Description | Required Args |
|---------|-------------|---------------|
| \`confluence-search-user\` | Search users by name | \`--query "Jane Smith"\` |

## Analytics
| Command | Description | Required Args |
|---------|-------------|---------------|
| \`confluence-get-page-views\` | Get page view stats | \`--pageId "123456"\` |

## Attachments
| Command | Description | Required Args |
|---------|-------------|---------------|
| \`confluence-upload-attachment\` | Upload a file | \`--pageId --filename --content\` |
| \`confluence-upload-attachments\` | Upload multiple files | \`--pageId --files '[...]'\` |
| \`confluence-get-attachments\` | List attachments | \`--pageId "123456"\` |
| \`confluence-download-attachment\` | Download by filename | \`--pageId --filename\` |
| \`confluence-download-all-attachments\` | List all attachments | \`--pageId "123456"\` |
| \`confluence-delete-attachment\` | Delete attachment | \`--attachmentId\` |
| \`confluence-get-page-images\` | Get image attachments | \`--pageId "123456"\` |

## Common Patterns

### Search recent pages
\`\`\`
renre-kit renre-atlassian:confluence-search --cql "lastModified >= now('-7d') ORDER BY lastModified DESC" --limit 10
\`\`\`

### Create page under a parent
\`\`\`
renre-kit renre-atlassian:confluence-create-page --spaceKey "DEV" --title "API Docs" --body "<h1>API</h1><p>Documentation.</p>" --parentId "123456"
\`\`\`

### Update page (requires current version)
\`\`\`
renre-kit renre-atlassian:confluence-get-page --pageId "123456"
renre-kit renre-atlassian:confluence-update-page --pageId "123456" --title "Updated Title" --body "<p>New content</p>" --version 5
\`\`\`

### Add labels
\`\`\`
renre-kit renre-atlassian:confluence-add-label --pageId "123456" --labels '["api", "documentation"]'
\`\`\`

## Notes

- Page bodies use Confluence storage format (XHTML-like): \`<h1>\`, \`<p>\`, \`<ul><li>\`, \`<ac:structured-macro>\`
- Updates require the current version number (optimistic locking) — always fetch the page first
- CQL is case-sensitive for space keys
`;

export default defineCommand({
  handler: () => ({
    output: CONFLUENCE_HELP,
    exitCode: 0,
  }),
});
