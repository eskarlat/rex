interface ExecutionContext {
  projectName: string;
  projectPath: string;
  args: Record<string, unknown>;
  config: Record<string, unknown>;
}

interface CommandResult {
  output: string;
  exitCode: number;
}

const TOOLS = [
  'search_repositories',
  'create_repository',
  'get_file_contents',
  'create_or_update_file',
  'push_files',
  'create_issue',
  'list_issues',
  'get_issue',
  'update_issue',
  'add_issue_comment',
  'create_pull_request',
  'fork_repository',
  'create_branch',
  'search_code',
  'list_commits',
];

export default function status(_context: ExecutionContext): CommandResult {
  return {
    output: [
      'github-mcp v1.0.0',
      'Transport: stdio',
      'Command: npx -y @modelcontextprotocol/server-github',
      `Tools: ${TOOLS.join(', ')}`,
      'Env: GITHUB_PERSONAL_ACCESS_TOKEN (required, via vault), GITHUB_HOST (optional, for Enterprise)',
      'Status: ready',
    ].join('\n'),
    exitCode: 0,
  };
}
