# Changelog

All notable changes to the **miro-mcp** extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-17

### Added

- Miro integration with 98 tools for boards, items, and collaboration
- MCP stdio transport via custom Miro MCP server
- Dashboard panel for board management
- Status widget showing Miro connection state
- `status` command to check Miro API connectivity
- Agent skill: `miro` with SKILL.md definition
- Config schema with `miroAccessToken` (vault-mapped)
- Toolsets: boards, items, shapes, sticky-notes, cards, app-cards, connectors, frames, groups, images, documents, embeds, text, tags, mindmaps, members, projects, organization, exports, compliance, bulk operations
- CRUD factory for consistent item management
