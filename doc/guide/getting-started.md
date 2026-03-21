# Getting Started

Let's get you up and running with RenreKit in under 5 minutes. By the end of this page, you'll have a project with an extension installed and a dashboard running.

## Prerequisites

You'll need:

- **Node.js** 20 or higher
- **pnpm** 9.15.4

::: tip Check your versions
```bash
node --version   # should be >= 20
pnpm --version   # should be 9.15.4
```
:::

## Installation

### From npm (coming soon)

```bash
npm install -g @renre-kit/cli
```

### From Source

```bash
# Clone the repo
git clone https://github.com/eskarlat/rex.git
cd rex

# Install dependencies
pnpm install

# Build everything
pnpm build

# Link the CLI globally
pnpm --filter @renre-kit/cli link --global
```

Verify it works:

```bash
renre-kit --version
```

## Create Your First Project

Navigate to any directory where you want to use RenreKit and initialize:

```bash
mkdir my-project && cd my-project
renre-kit init
```

This creates a `.renre-kit/` directory with your project manifest and a `plugins.json` file for tracking activated extensions.

## Install an Extension

Let's add the hello-world extension to see how everything works:

```bash
# Add the extension globally
renre-kit ext:add hello-world

# Activate it for this project
renre-kit ext:activate hello-world
```

Now you can run its command:

```bash
renre-kit hello-world:greet --name "Developer"
# => Hello, Developer! Welcome from RenreKit.
```

## Launch the Dashboard

The web dashboard gives you a visual interface for everything:

```bash
renre-kit ui
```

This opens your browser to `http://localhost:4200` where you can:

- Browse and install extensions from the marketplace
- Manage your vault secrets
- See extension UI panels and widgets
- View live logs
- Configure settings

::: tip LAN Access
Want to access the dashboard from your phone or another device?
```bash
renre-kit ui --lan
```
This enables LAN access with a 4-digit PIN for security.
:::

## What's Next?

You've got the basics down. Here's where to go from here:

| Want to... | Read this |
|-----------|-----------|
| Understand projects and file layout | [Project Management](/guide/project-management) |
| Configure extensions and global settings | [Configuration](/guide/configuration) |
| Store API keys and secrets | [Encrypted Vault](/guide/vault) |
| Explore the dashboard features | [Web Dashboard](/guide/web-dashboard) |
| Build your own extension | [Building a Standard Extension](/extensions/building-standard) |
| Understand the architecture | [Architecture Overview](/architecture/overview) |

## Quick Command Reference

Here are the commands you'll use most often:

```bash
# Project
renre-kit init                    # Set up a new project
renre-kit destroy                 # Remove project config

# Extensions
renre-kit ext:add <name>          # Install an extension
renre-kit ext:remove <name>       # Uninstall
renre-kit ext:list                # See what's installed
renre-kit ext:activate <name>     # Turn on for current project
renre-kit ext:deactivate <name>   # Turn off
renre-kit ext:config <name>       # Configure
renre-kit ext:status <name>       # Health check
renre-kit ext:outdated            # Check for updates
renre-kit ext:update <name>       # Update to latest

# Vault
renre-kit vault:set API_KEY       # Store a secret
renre-kit vault:list              # List stored keys
renre-kit vault:remove API_KEY    # Delete a secret

# Dashboard
renre-kit ui                      # Launch dashboard
renre-kit ui --port 8080          # Custom port
renre-kit ui --lan                # Enable LAN access

# Diagnostics
renre-kit doctor                  # Check system health
renre-kit capabilities            # List all active LLM skills
```
