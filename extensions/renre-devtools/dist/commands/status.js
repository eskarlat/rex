import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/commands/status.ts
var TOOLS = [
  "puppeteer_navigate",
  "puppeteer_screenshot",
  "puppeteer_click",
  "puppeteer_hover",
  "puppeteer_fill",
  "puppeteer_select",
  "puppeteer_evaluate"
];
var RESOURCES = ["console://logs", "screenshot://<name>"];
function status(_context) {
  return {
    output: [
      "renre-devtools v1.0.0",
      "Transport: stdio",
      "Command: npx -y @modelcontextprotocol/server-puppeteer",
      "Mode: headed (visible browser window)",
      `Tools: ${TOOLS.join(", ")}`,
      `Resources: ${RESOURCES.join(", ")}`,
      "Status: ready"
    ].join("\n"),
    exitCode: 0
  };
}
export {
  status as default
};
