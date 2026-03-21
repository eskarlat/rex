import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/commands/status.ts
function status(_context) {
  return {
    output: [
      "context7-mcp v1.0.0",
      "Transport: stdio",
      "Command: npx -y @upstash/context7-mcp",
      "Tools: resolve-library-id, query-docs",
      "Status: ready"
    ].join("\n"),
    exitCode: 0
  };
}
export {
  status as default
};
