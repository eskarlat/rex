import { mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';

const CORE_SKILL_NAME = 'cli';

export const CORE_SKILL_CONTENT = `---
name: cli
description: Use this when the user asks how to use renre-kit, needs to manage extensions, search the registry, configure a project, or run any built-in CLI command.
---

# RenreKit CLI Reference

RenreKit is a plugin-driven development CLI. A thin core handles discovery, loading, and routing while **extensions** provide domain-specific functionality through CLI commands, web dashboard panels, and LLM skills.

## How It Works

- Run \`renre-kit init\` in any directory to initialize a project (\`.renre-kit/\` folder)
- Install extensions from registries with \`renre-kit ext:add <name>\`
- Activate/deactivate extensions per project
- Extensions expose commands as \`{extensionName}:{commandName}\`
- LLM skills are deployed to \`.agents/skills/\` when extensions are activated
- Use \`renre-kit capabilities\` to view all available skills

## Project Commands

### renre-kit init
Initialize a new RenreKit project in the current directory. Creates \`.renre-kit/\` with manifest and plugins files. Prompts to select installed extensions to activate.

\`\`\`
renre-kit init
\`\`\`

### renre-kit destroy
Destroy the current project. Deactivates all extensions (runs cleanup hooks), removes \`.renre-kit/\` directory and database entry.

\`\`\`
renre-kit destroy [--force]
\`\`\`

## Extension Commands

### renre-kit ext:add <name>
Search registries and install an extension globally. If inside a project, also activates it.

\`\`\`
renre-kit ext:add <name>
\`\`\`

### renre-kit ext:remove <name>
Remove an installed extension. Deactivates from all projects first.

\`\`\`
renre-kit ext:remove <name>
\`\`\`

### renre-kit ext:list
List all globally installed extensions with version, type, and activation status for the current project.

\`\`\`
renre-kit ext:list
\`\`\`

### renre-kit ext:activate <name>
Activate an installed extension in the current project. Runs the extension's \`onInit\` hook which deploys agent assets (skills, prompts, context) to \`.agents/\`.

\`\`\`
renre-kit ext:activate <name>
\`\`\`

### renre-kit ext:deactivate <name>
Deactivate an extension from the current project. Runs the extension's \`onDestroy\` hook to clean up agent assets.

\`\`\`
renre-kit ext:deactivate <name>
\`\`\`

### renre-kit ext:link <path>
Link a local extension directory for development. Creates a symlink so changes are reflected immediately.

\`\`\`
renre-kit ext:link <path>
\`\`\`

### renre-kit ext:config <name>
Interactively configure an extension. Prompts for schema-defined fields, supports vault-mapped secrets.

\`\`\`
renre-kit ext:config <name>
\`\`\`

### renre-kit ext:update [name]
Update extension(s) to the latest version from the registry.

\`\`\`
renre-kit ext:update [name]
renre-kit ext:update --all
\`\`\`

### renre-kit ext:outdated
Check which installed extensions have newer versions available.

\`\`\`
renre-kit ext:outdated
\`\`\`

### renre-kit ext:status
Show MCP connection status for all MCP-type extensions.

\`\`\`
renre-kit ext:status
\`\`\`

### renre-kit ext:restart <name>
Restart an MCP extension's connection.

\`\`\`
renre-kit ext:restart <name>
\`\`\`

### renre-kit ext:cleanup
Remove unused extension versions from global storage.

\`\`\`
renre-kit ext:cleanup
\`\`\`

## Registry Commands

### renre-kit registry:search [query]
Search for extensions across all configured registries. Filter by type or tag.

\`\`\`
renre-kit registry:search [query]
renre-kit registry:search --type mcp
renre-kit registry:search --tag database
\`\`\`

### renre-kit registry:sync
Sync all registries from their git sources. Fetches the latest extension listings.

\`\`\`
renre-kit registry:sync
\`\`\`

### renre-kit registry:list
List all configured registries with priority, cache status, and last fetch time.

\`\`\`
renre-kit registry:list
\`\`\`

### renre-kit registry:add <name> <url>
Add a new extension registry (git-based).

\`\`\`
renre-kit registry:add <name> <url> [--priority <number>] [--cache-ttl <seconds>]
\`\`\`

### renre-kit registry:remove <name>
Remove a configured registry.

\`\`\`
renre-kit registry:remove <name>
\`\`\`

## Vault Commands

Vault provides AES-256-GCM encrypted storage for secrets (API keys, tokens, etc.).

### renre-kit vault:set <key>
Store a value in the encrypted vault.

\`\`\`
renre-kit vault:set <key> [--value <value>] [--secret] [--tags <tags>]
\`\`\`

### renre-kit vault:list
List all vault entries (values are masked).

\`\`\`
renre-kit vault:list
\`\`\`

### renre-kit vault:remove <key>
Remove an entry from the vault.

\`\`\`
renre-kit vault:remove <key>
\`\`\`

## Scheduler Commands

### renre-kit scheduler:list
List all scheduled tasks for the current project.

\`\`\`
renre-kit scheduler:list
\`\`\`

### renre-kit scheduler:trigger <id>
Manually trigger a scheduled task by ID.

\`\`\`
renre-kit scheduler:trigger <id>
\`\`\`

## Dashboard Commands

### renre-kit ui
Start the web dashboard server. Opens a browser to the dashboard UI.

\`\`\`
renre-kit ui [--port <number>] [--lan] [--no-browser] [--no-sleep]
\`\`\`

### renre-kit stop
Stop the running dashboard server.

\`\`\`
renre-kit stop
\`\`\`

## Skill & Capabilities Commands

### renre-kit capabilities
Show all aggregated SKILL.md content from activated extensions. Reads from \`.agents/skills/\`.

\`\`\`
renre-kit capabilities
\`\`\`

## Common Workflows

### Setting up a new project
1. \`renre-kit init\` — initialize the project
2. \`renre-kit registry:search\` — browse available extensions
3. \`renre-kit ext:add <name>\` — install and activate extensions

### Finding and installing extensions
1. \`renre-kit registry:sync\` — ensure registries are up to date
2. \`renre-kit registry:search <query>\` — search by keyword, type, or tag
3. \`renre-kit ext:add <name>\` — install the extension
4. \`renre-kit ext:config <name>\` — configure if needed

### Managing secrets
1. \`renre-kit vault:set API_KEY --secret\` — store a secret
2. \`renre-kit ext:config <name>\` — vault-mapped fields auto-resolve

### Developing an extension locally
1. Build your extension in a local directory
2. \`renre-kit ext:link ./my-extension\` — link for development
3. Changes are reflected immediately without reinstall
`;

/**
 * Deploys the built-in RenreKit CLI skill to the project's agent skills directory.
 * Called during `renre-kit init` so that agents always have access to CLI documentation.
 */
export function deployCoreSkills(projectPath: string, agentDir = '.agents'): void {
  const skillPath = join(projectPath, agentDir, 'skills', CORE_SKILL_NAME, 'SKILL.md');
  mkdirSync(dirname(skillPath), { recursive: true });
  writeFileSync(skillPath, CORE_SKILL_CONTENT, 'utf-8');
}

/**
 * Removes the built-in RenreKit CLI skill from the project's `.agents/skills/` directory.
 * Called during `renre-kit destroy`.
 */
export function cleanupCoreSkills(projectPath: string, agentDir = '.agents'): void {
  const coreDir = join(projectPath, agentDir, 'skills', CORE_SKILL_NAME);
  if (existsSync(coreDir)) {
    rmSync(coreDir, { recursive: true, force: true });
  }
}
