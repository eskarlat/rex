# Publishing to a Registry

RenreKit uses **git-based registries** — plain git repositories that catalog available extensions. No custom package servers needed. This page explains how to publish your extension.

## How Registries Work

A registry is a git repo with a `.renre-kit/extensions.json` file that lists available extensions:

```json
{
  "extensions": [
    {
      "name": "my-extension",
      "description": "Does something useful",
      "gitUrl": "https://github.com/you/my-extension.git",
      "latestVersion": "2.0.0",
      "type": "standard",
      "icon": "icons/my-extension.svg",
      "author": "you",
      "tags": ["tools", "utilities"]
    }
  ]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Extension identifier |
| `description` | Yes | Short description for marketplace |
| `gitUrl` | Yes | Git clone URL (or relative path like `./extensions/my-ext`) |
| `latestVersion` | Yes | Current version (used for install and update checks) |
| `type` | Yes | `"standard"` or `"mcp"` |
| `icon` | No | Path to icon SVG relative to `.renre-kit/` |
| `author` | No | Author name |
| `tags` | No | Searchable tags |

When a user runs `renre-kit ext:add my-extension`, RenreKit:

1. Checks all configured registries for the extension
2. Clones the extension repo at the git tag `v2.0.0`
3. Installs it to `~/.renre-kit/extensions/my-extension@2.0.0/`

## Step 1: Prepare Your Extension

Make sure your extension is ready:

```bash
# Build it
npm run build

# Verify the manifest is valid
renre-kit doctor

# Test the command
renre-kit my-extension:hello
```

Check that:
- `manifest.json` has all required fields (name, version, description, type, engines)
- The `main` entry point exists (if standard type)
- All `commands[*].handler` files exist
- All `ui.panels[*].entry` and `ui.widgets[*].entry` files exist

## Step 2: Tag a Release

RenreKit uses git tags for versioning:

```bash
# Commit everything
git add .
git commit -m "Release v1.0.0"

# Tag it
git tag v1.0.0
git push origin main --tags
```

## Step 3: Add to a Registry

### Using the built-in registry

If you're contributing to the main RenreKit registry, submit a PR that adds your extension to `.renre-kit/extensions.json`:

```json
{
  "name": "my-extension",
  "description": "Does something useful",
  "gitUrl": "https://github.com/you/my-extension.git",
  "latestVersion": "1.0.0",
  "type": "standard",
  "author": "you"
}
```

### Creating your own registry

For private or team registries:

1. Create a git repo
2. Add a `.renre-kit/extensions.json` with your extensions
3. Users add your registry:

```bash
renre-kit registry:add my-registry https://github.com/my-team/renre-registry.git
```

4. Sync to fetch the catalog:

```bash
renre-kit registry:sync
```

## Version Management

### Exact Version Pinning

When an extension is activated in a project, the exact version gets pinned in `.renre-kit/plugins.json`. This prevents surprise breakage.

### Checking for Updates

```bash
# See if newer versions are available
renre-kit ext:outdated

# Update a specific extension
renre-kit ext:update my-extension

# Update to a specific version
renre-kit ext:update my-extension --version 2.0.0
```

### Engine Constraints

Your `engines` field matters. If a user's RenreKit version doesn't satisfy your constraint, the extension won't install:

```json
{
  "engines": {
    "renre-kit": ">= 1.0.0",
    "extension-sdk": ">= 1.0.0"
  }
}
```

Use conservative ranges (e.g., `>= 1.0.0`) to maximize compatibility.

## Registry Commands

```bash
# Add a registry
renre-kit registry:add <name> <url>

# Remove a registry
renre-kit registry:remove <name>

# List configured registries
renre-kit registry:list

# Sync catalog from all registries
renre-kit registry:sync

# Search available extensions
renre-kit registry:search <query>
```

## Best Practices

1. **Semantic versioning** — Follow semver strictly. Breaking changes = major bump.
2. **README** — Include a README in your extension repo so users know what it does.
3. **Changelog** — Maintain a CHANGELOG.md so users know what changed between versions.
4. **Test before tagging** — Run your full test suite before creating a release tag.
5. **Engine constraints** — Set realistic constraints. Don't require cutting-edge versions unless necessary.

::: tip Private registries
Need extensions only your team can access? Host the registry repo on a private GitHub/GitLab instance. RenreKit uses git clone, so it respects your SSH keys and credentials.
:::
