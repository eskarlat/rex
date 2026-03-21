import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/commands/status.ts
var TOOLS = [
  "search_repositories",
  "create_repository",
  "get_file_contents",
  "create_or_update_file",
  "push_files",
  "create_issue",
  "list_issues",
  "get_issue",
  "update_issue",
  "add_issue_comment",
  "create_pull_request",
  "fork_repository",
  "create_branch",
  "search_code",
  "list_commits"
];
function status(_context) {
  return {
    output: [
      "github-mcp v1.0.0",
      "Transport: stdio",
      "Command: npx -y @modelcontextprotocol/server-github",
      `Tools: ${TOOLS.join(", ")}`,
      "Env: GITHUB_PERSONAL_ACCESS_TOKEN (required, via vault), GITHUB_HOST (optional, for Enterprise)",
      "Status: ready"
    ].join("\n"),
    exitCode: 0
  };
}
export {
  status as default
};
