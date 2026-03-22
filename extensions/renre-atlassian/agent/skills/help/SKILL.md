---
name: help
description: Use this skill FIRST when you need to discover available Atlassian commands or understand how to use them. Run the help commands to get a full reference of Jira and Confluence CLI commands with arguments and examples. Always start here before attempting to use specific Atlassian commands.
---

# Atlassian Help

## Overview

The renre-atlassian extension provides 75 CLI commands for Jira and Confluence. Use the help commands to discover what's available and how to use each command.

## Help Commands

### Get Jira command reference

```
renre-kit renre-atlassian:jira-help
```

Returns a complete reference of all 50 Jira commands organized by domain (Issues, Fields, Comments, Transitions, Projects, Agile, Links, Worklog, Attachments, Users, Watchers, Service Desk, Forms, Metrics, Development) with required arguments and usage examples.

### Get Confluence command reference

```
renre-kit renre-atlassian:confluence-help
```

Returns a complete reference of all 23 Confluence commands organized by domain (Pages, Comments, Labels, Users, Analytics, Attachments) with required arguments and usage examples.

### Check connection status

```
renre-kit renre-atlassian:status
```

Verifies the Atlassian API connection is working and shows the authenticated user.

## Required Workflow

**Always follow this workflow when working with Atlassian:**

### Step 1: Discover Commands

If you're unsure which command to use, run the appropriate help command first:
- For Jira tasks: `renre-kit renre-atlassian:jira-help`
- For Confluence tasks: `renre-kit renre-atlassian:confluence-help`

### Step 2: Verify Connection

Before making API calls, check the connection: `renre-kit renre-atlassian:status`

If the connection fails, guide the user through setup:
1. `renre-kit ext config renre-atlassian --set domain=<company>.atlassian.net`
2. `renre-kit ext config renre-atlassian --set email=<user@company.com>`
3. `renre-kit vault set renre-atlassian.apiToken`

The user needs an API token from https://id.atlassian.com/manage-profile/security/api-tokens

### Step 3: Execute Commands

Use the specific command from the help reference. All commands return markdown-formatted output.

## When to Use This Skill

- **First time using Atlassian** — run help to learn available commands
- **Unsure about arguments** — the help output includes required args for every command
- **Looking for the right command** — help lists all commands organized by domain
- **Troubleshooting** — run status to verify connection
