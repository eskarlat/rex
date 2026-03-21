---
name: context7
description: Use this skill when the user needs up-to-date library documentation, API references, or usage examples — e.g. "show me React hooks docs", "what's the API for express router", "how to use zod schemas"
---

# context7-mcp

An MCP extension that resolves library names and fetches up-to-date documentation via the Context7 service.

## Commands

### context7-mcp:resolve-library-id

Resolves a library name to a Context7-compatible library ID. Use this first before querying docs.

**Parameters:**

- `query` (string, required) — The user's question or task (used to rank results by relevance)
- `libraryName` (string, required) — The name of the library to search for (e.g. "react", "express", "zod")

**Example:**

```
renre-kit context7-mcp:resolve-library-id --query "how to use hooks" --libraryName "react"
```

### context7-mcp:query-docs

Retrieves documentation for a library using a Context7-compatible library ID. Always call resolve-library-id first to get the ID.

**Parameters:**

- `libraryId` (string, required) — Exact Context7-compatible library ID (e.g. /mongodb/docs, /vercel/next.js)
- `query` (string, required) — The question or task to get relevant documentation for

**Example:**

```
renre-kit context7-mcp:query-docs --libraryId "/vercel/next.js" --query "how to use server actions"
```
