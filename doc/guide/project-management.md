# Project Management

Every RenreKit project gets its own isolated configuration. This page explains how projects work, what files live where, and how global vs. local state interact.

## Initializing a Project

```bash
cd my-project
renre-kit init
```

This creates a `.renre-kit/` directory inside your project:

```
my-project/
├── .renre-kit/
│   ├── manifest.json    # Project metadata (name, created date)
│   ├── plugins.json     # Activated extensions with pinned versions
│   └── storage/         # Extension-scoped key/value storage
└── your-code/
```

The project also gets registered in the global SQLite database so RenreKit can track it across sessions.

## Global vs. Local State

RenreKit separates global state (shared across all projects) from local state (scoped to one project):

### Global (`~/.renre-kit/`)

| Path | Purpose |
|------|---------|
| `db.sqlite` | Project registry — tracks all known projects |
| `extensions/{name}@{version}/` | Installed extension packages |
| `registries/{name}/` | Cloned git registry repos |
| `vault.json` | AES-256-GCM encrypted secrets |
| `config.json` | Global settings |
| `logs/` | Rotating daily log files |

### Local (`.renre-kit/`)

| Path | Purpose |
|------|---------|
| `manifest.json` | Project name and metadata |
| `plugins.json` | Which extensions are active + exact version pins |
| `storage/` | Extension-scoped storage (key/value per extension) |

### LLM Assets (`.agents/`)

When you activate extensions that have agent assets, they get deployed here:

| Path | Purpose |
|------|---------|
| `skills/{name}/SKILL.md` | Skill definitions for AI agents |
| `prompts/` | Prompt templates |
| `context/` | Context documents |
| `agents/` | Agent configurations |
| `workflows/` | Workflow definitions |

::: tip Why two locations?
Extensions are installed **once globally** so you don't duplicate packages across projects. But they're **activated locally** so each project can use different extensions at different versions. It's like `npm install -g` vs. your project's `package.json`.
:::

## Working with Multiple Projects

RenreKit tracks all your projects in a central database. Switch between them easily:

```bash
# In the dashboard, use the project switcher
renre-kit ui

# Or initialize new projects wherever you need them
cd ~/project-a && renre-kit init
cd ~/project-b && renre-kit init
```

Each project has its own set of activated extensions, its own config overrides, and its own storage.

## Version Pinning

When you activate an extension in a project, the exact version gets pinned in `plugins.json`:

```json
{
  "extensions": {
    "hello-world": "1.0.0",
    "github-mcp": "2.1.3"
  }
}
```

This means your project won't accidentally break when an extension updates. To update:

```bash
renre-kit ext:update hello-world
```

## Destroying a Project

To remove a project's RenreKit configuration:

```bash
renre-kit destroy
```

This removes the `.renre-kit/` directory and unregisters the project from the global database. It does **not** uninstall extensions globally — other projects might still need them.

## Overriding the Global Directory

For testing or CI, you can override where RenreKit stores global state:

```bash
export RENRE_KIT_HOME=/tmp/my-test-env
renre-kit init
```

This is especially useful for E2E tests that need isolated state.
