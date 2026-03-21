import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/commands/status.ts
function status(context) {
  const domain = context.config["domain"];
  const email = context.config["email"];
  const hasToken = Boolean(context.config["apiToken"]);
  const lines = [
    "atlassian-mcp v1.0.0",
    "Transport: stdio (MCP SDK)",
    `Domain: ${domain ?? "(not configured)"}`,
    `Email: ${email ?? "(not configured)"}`,
    `API Token: ${hasToken ? "(set)" : "(not set)"}`,
    "",
    `Toolsets: 21 (15 Jira + 6 Confluence)`,
    `Total Tools: 73 (50 Jira + 23 Confluence)`,
    "",
    domain && email && hasToken ? "Status: ready" : "Status: configuration required"
  ];
  return { output: lines.join("\n"), exitCode: 0 };
}
export {
  status as default
};
