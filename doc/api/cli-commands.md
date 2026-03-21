# CLI Commands

Complete reference for all built-in RenreKit CLI commands.

## Project Management

### `renre-kit init`

Initialize a new RenreKit project in the current directory.

```bash
renre-kit init
```

Creates `.renre-kit/` with `manifest.json` and `plugins.json`. Registers the project in the global database.

### `renre-kit destroy`

Remove RenreKit configuration from the current project.

```bash
renre-kit destroy
```

Deletes `.renre-kit/` and unregisters from the global database. Does **not** uninstall extensions globally.

---

## Extension Management

### `renre-kit ext:add <name>`

Install an extension globally from a registry.

```bash
renre-kit ext:add hello-world
renre-kit ext:add github-mcp --version 1.2.0
```

| Option | Description |
|--------|-------------|
| `--version <ver>` | Install a specific version (default: latest) |

### `renre-kit ext:remove <name>`

Uninstall an extension globally.

```bash
renre-kit ext:remove hello-world
```

Removes the extension from `~/.renre-kit/extensions/` and the database.

### `renre-kit ext:list`

List all installed extensions.

```bash
renre-kit ext:list
```

Shows name, version, type, and activation status for the current project.

### `renre-kit ext:activate <name>`

Activate an installed extension for the current project.

```bash
renre-kit ext:activate hello-world
```

Pins the version in `.renre-kit/plugins.json` and calls `onInit()`.

### `renre-kit ext:deactivate <name>`

Deactivate an extension from the current project.

```bash
renre-kit ext:deactivate hello-world
```

Removes from `plugins.json` and calls `onDestroy()`.

### `renre-kit ext:config <name>`

Configure an extension.

```bash
# Interactive mode
renre-kit ext:config hello-world

# Set a specific field
renre-kit ext:config hello-world --set companyName="Acme Corp"
```

### `renre-kit ext:status <name>`

Check the health status of an extension.

```bash
renre-kit ext:status github-mcp
```

For MCP extensions, this checks the server connection status.

### `renre-kit ext:outdated`

Check if newer versions of installed extensions are available.

```bash
renre-kit ext:outdated
```

### `renre-kit ext:update <name>`

Update an extension to the latest version.

```bash
renre-kit ext:update hello-world
renre-kit ext:update hello-world --version 2.0.0
```

### `renre-kit ext:link <path>`

Link a local extension for development.

```bash
renre-kit ext:link /path/to/my-extension
```

Creates a symlink from the global extensions directory to your local extension. Changes are reflected immediately.

### `renre-kit ext:restart <name>`

Restart an MCP extension's server process.

```bash
renre-kit ext:restart github-mcp
```

---

## Vault

### `renre-kit vault:set <key>`

Store or update a secret.

```bash
# Interactive (hidden input)
renre-kit vault:set GITHUB_TOKEN

# Direct value
renre-kit vault:set GITHUB_TOKEN ghp_abc123
```

### `renre-kit vault:list`

List all stored secret keys (values are never shown).

```bash
renre-kit vault:list
```

### `renre-kit vault:remove <key>`

Delete a secret from the vault.

```bash
renre-kit vault:remove GITHUB_TOKEN
```

---

## Registry

### `renre-kit registry:add <name> <url>`

Add a git-based extension registry.

```bash
renre-kit registry:add official https://github.com/eskarlat/renre-registry.git
```

### `renre-kit registry:remove <name>`

Remove a configured registry.

```bash
renre-kit registry:remove official
```

### `renre-kit registry:list`

List all configured registries.

```bash
renre-kit registry:list
```

### `renre-kit registry:sync`

Pull the latest catalog from all registries.

```bash
renre-kit registry:sync
```

### `renre-kit registry:search <query>`

Search for extensions across all registries.

```bash
renre-kit registry:search github
```

---

## Scheduler

### `renre-kit scheduler:list`

List all scheduled tasks for the current project.

```bash
renre-kit scheduler:list
```

### `renre-kit scheduler:trigger <task-id>`

Manually trigger a scheduled task.

```bash
renre-kit scheduler:trigger daily-sync
```

---

## Dashboard

### `renre-kit ui`

Launch the web dashboard.

```bash
renre-kit ui
renre-kit ui --port 8080
renre-kit ui --lan
renre-kit ui --no-browser
```

| Option | Description | Default |
|--------|-------------|---------|
| `--port <number>` | Server port | 4200 |
| `--lan` | Enable LAN access with PIN auth | off |
| `--no-browser` | Don't auto-open the browser | opens |

### `renre-kit stop`

Stop a running dashboard server.

```bash
renre-kit stop
```

---

## Diagnostics

### `renre-kit doctor`

Run health checks on your RenreKit installation.

```bash
renre-kit doctor
```

Checks:
- Global directory structure
- Database integrity
- Vault key presence
- Extension manifest validity

### `renre-kit capabilities`

List all active LLM skills from activated extensions.

```bash
renre-kit capabilities
```

---

## Global Options

These work with any command:

| Option | Description |
|--------|-------------|
| `--version` | Show RenreKit version |
| `--help` | Show help for a command |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `RENRE_KIT_HOME` | Override global directory | `~/.renre-kit` |
