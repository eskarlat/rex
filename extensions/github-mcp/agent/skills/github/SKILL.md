---
name: github
description: Use this skill for GitHub operations — searching repos, managing issues/PRs, reading/writing files, creating branches, and code search. Requires a configured GitHub personal access token.
---

# github-mcp

An MCP extension that provides full GitHub API access via the official `@modelcontextprotocol/server-github` server.

## Prerequisites

A GitHub personal access token must be configured via `ext:config github-mcp githubToken`. The token is stored in the encrypted vault and passed as `GITHUB_PERSONAL_ACCESS_TOKEN` to the MCP server.

## Commands

### github-mcp:search_repositories
Search for GitHub repositories.

**Parameters:**
- `query` (string, required) — Search query (e.g. "react", "machine learning python")

**Example:**
```
renre-kit github-mcp:search_repositories --query "react state management"
```

### github-mcp:create_repository
Create a new GitHub repository.

**Parameters:**
- `name` (string, required) — Repository name
- `description` (string, optional) — Repository description
- `private` (boolean, optional) — Whether the repo is private (default: false)

**Example:**
```
renre-kit github-mcp:create_repository --name "my-project" --description "A new project" --private true
```

### github-mcp:get_file_contents
Get the contents of a file or directory from a repository.

**Parameters:**
- `owner` (string, required) — Repository owner
- `repo` (string, required) — Repository name
- `path` (string, required) — File or directory path
- `branch` (string, optional) — Branch name (defaults to repo default branch)

**Example:**
```
renre-kit github-mcp:get_file_contents --owner "facebook" --repo "react" --path "README.md"
```

### github-mcp:create_or_update_file
Create or update a single file in a repository.

**Parameters:**
- `owner` (string, required) — Repository owner
- `repo` (string, required) — Repository name
- `path` (string, required) — File path
- `content` (string, required) — File content
- `message` (string, required) — Commit message
- `branch` (string, required) — Branch name
- `sha` (string, optional) — SHA of the file being replaced (required for updates)

**Example:**
```
renre-kit github-mcp:create_or_update_file --owner "myorg" --repo "myrepo" --path "docs/guide.md" --content "# Guide" --message "Add guide" --branch "main"
```

### github-mcp:push_files
Push multiple files in a single commit.

**Parameters:**
- `owner` (string, required) — Repository owner
- `repo` (string, required) — Repository name
- `branch` (string, required) — Branch name
- `files` (array, required) — Array of `{ path, content }` objects
- `message` (string, required) — Commit message

**Example:**
```
renre-kit github-mcp:push_files --owner "myorg" --repo "myrepo" --branch "feature" --message "Add files" --files '[{"path":"a.txt","content":"hello"}]'
```

### github-mcp:create_issue
Create a new issue in a repository.

**Parameters:**
- `owner` (string, required) — Repository owner
- `repo` (string, required) — Repository name
- `title` (string, required) — Issue title
- `body` (string, optional) — Issue body (Markdown)
- `labels` (string[], optional) — Labels to apply

**Example:**
```
renre-kit github-mcp:create_issue --owner "myorg" --repo "myrepo" --title "Bug: crash on startup" --body "Steps to reproduce..."
```

### github-mcp:list_issues
List issues in a repository.

**Parameters:**
- `owner` (string, required) — Repository owner
- `repo` (string, required) — Repository name
- `state` (string, optional) — Filter by state: "open", "closed", or "all" (default: "open")

**Example:**
```
renre-kit github-mcp:list_issues --owner "facebook" --repo "react" --state "open"
```

### github-mcp:get_issue
Get details of a specific issue.

**Parameters:**
- `owner` (string, required) — Repository owner
- `repo` (string, required) — Repository name
- `issue_number` (number, required) — Issue number

**Example:**
```
renre-kit github-mcp:get_issue --owner "facebook" --repo "react" --issue_number 42
```

### github-mcp:update_issue
Update an existing issue.

**Parameters:**
- `owner` (string, required) — Repository owner
- `repo` (string, required) — Repository name
- `issue_number` (number, required) — Issue number
- `title` (string, optional) — New title
- `body` (string, optional) — New body
- `state` (string, optional) — New state: "open" or "closed"

**Example:**
```
renre-kit github-mcp:update_issue --owner "myorg" --repo "myrepo" --issue_number 42 --state "closed"
```

### github-mcp:add_issue_comment
Add a comment to an issue.

**Parameters:**
- `owner` (string, required) — Repository owner
- `repo` (string, required) — Repository name
- `issue_number` (number, required) — Issue number
- `body` (string, required) — Comment body (Markdown)

**Example:**
```
renre-kit github-mcp:add_issue_comment --owner "myorg" --repo "myrepo" --issue_number 42 --body "Fixed in latest commit"
```

### github-mcp:create_pull_request
Create a new pull request.

**Parameters:**
- `owner` (string, required) — Repository owner
- `repo` (string, required) — Repository name
- `title` (string, required) — PR title
- `body` (string, optional) — PR description (Markdown)
- `head` (string, required) — Branch containing changes
- `base` (string, required) — Branch to merge into

**Example:**
```
renre-kit github-mcp:create_pull_request --owner "myorg" --repo "myrepo" --title "Add feature X" --head "feature-x" --base "main"
```

### github-mcp:fork_repository
Fork a repository to your account.

**Parameters:**
- `owner` (string, required) — Repository owner
- `repo` (string, required) — Repository name

**Example:**
```
renre-kit github-mcp:fork_repository --owner "facebook" --repo "react"
```

### github-mcp:create_branch
Create a new branch in a repository.

**Parameters:**
- `owner` (string, required) — Repository owner
- `repo` (string, required) — Repository name
- `branch` (string, required) — New branch name
- `from_branch` (string, optional) — Source branch (defaults to repo default branch)

**Example:**
```
renre-kit github-mcp:create_branch --owner "myorg" --repo "myrepo" --branch "feature-x" --from_branch "main"
```

### github-mcp:search_code
Search for code across GitHub repositories.

**Parameters:**
- `query` (string, required) — Search query (supports GitHub code search syntax)

**Example:**
```
renre-kit github-mcp:search_code --query "useState repo:facebook/react language:typescript"
```

### github-mcp:list_commits
List commits in a repository.

**Parameters:**
- `owner` (string, required) — Repository owner
- `repo` (string, required) — Repository name
- `sha` (string, optional) — Branch name or commit SHA (defaults to default branch)

**Example:**
```
renre-kit github-mcp:list_commits --owner "facebook" --repo "react" --sha "main"
```
