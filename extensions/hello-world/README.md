# Hello World

A simple hello world extension for RenreKit that demonstrates all extension capabilities.

## Features

- **CLI Commands**: `greet` and `info` commands for greeting users and showing extension metadata
- **Dashboard Panels**: Main panel with greeting UI, settings panel for configuration, and analytics panel with usage statistics
- **Dashboard Widget**: Status widget showing current greeting state
- **Agent Skills**: LLM-ready skills for `greet` and `info` with SKILL.md definitions
- **Configuration**: Configurable company name and API token with vault-backed secrets

## Configuration

| Field         | Type   | Secret | Description                                      |
| ------------- | ------ | ------ | ------------------------------------------------ |
| `companyName` | string | No     | Company or team name displayed in greetings      |
| `apiToken`    | string | Yes    | API token for external service integration       |

## Usage

```bash
# Greet the user
renre-kit hello-world:greet

# Show extension info
renre-kit hello-world:info
```

## Development

This is a **standard** (in-process) extension. It serves as a reference implementation showcasing all extension capabilities: commands, UI panels, widgets, config schema, and agent assets.

```bash
cd extensions/hello-world
pnpm build    # tsc && node build-panel.js
```
