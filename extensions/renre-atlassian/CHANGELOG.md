# Changelog

All notable changes to the **renre-atlassian** extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-22

### Added

- 50 Jira CLI commands: issues, search, transitions, sprints, boards, comments, worklogs, attachments, fields, links, watchers, forms, SLA, dev info, service desk
- 23 Confluence CLI commands: pages, search, comments, labels, attachments, analytics, users
- `jira-help` and `confluence-help` commands for command discovery
- `status` command to check Atlassian connection
- Zod schema validation on all command arguments
- Structured `AtlassianApiError` with status code and response body
- Confluence pagination support (`limit`/`start`) wired through to client methods
- Dashboard panel with Jira and Confluence views
- My Tasks widget showing assigned issues
- Comments widget for recent activity
- Confluence Updates widget for space activity
- Agent skills: `jira`, `confluence`, and `help` with SKILL.md definitions
- Config schema with `domain`, `email`, and `apiToken` (vault-mapped)
- Integration test suite for Jira and Confluence commands

### Changed

- Converted from MCP stdio extension (`atlassian-mcp`) to standard in-process extension
- Replaced MCP tool definitions with direct CLI command handlers
- Replaced unsafe `as` type casts with Zod schema parsing
