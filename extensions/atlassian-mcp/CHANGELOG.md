# Changelog

All notable changes to the **atlassian-mcp** extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-17

### Added

- Jira integration with 72 tools for issues, sprints, boards, and workflows
- Confluence integration for pages, spaces, and content management
- MCP stdio transport via `@anthropic/atlassian-mcp-server`
- Dashboard panel with Jira and Confluence views
- My Tasks widget showing assigned issues
- Comments widget for recent activity
- Confluence Updates widget for space activity
- `status` command to check Atlassian connection
- Agent skills: `jira` and `confluence` with SKILL.md definitions
- Config schema with `jiraUrl`, `confluenceUrl`, `email`, and `apiToken` (vault-mapped)
- Toolsets: issues, transitions, attachments, development, metrics
