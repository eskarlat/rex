# ADR-001: Central Vault with Indirection Mapping

## Status
Accepted

## Context
Multiple extensions may need access to the same credential (e.g., a Jira API token). Extensions use different environment variable names for the same credential, creating a naming mismatch. Without a central store, credentials would need to be duplicated across extension configurations.

## Decision
Implement a central vault at `~/.renre-kit/vault.json` that stores named credential variables. Each extension provides a mapping configuration that:
1. Maps extension-specific field names (e.g., "apiToken") to vault keys (e.g., "jira_token")
2. Maps vault keys to the environment variable names expected by the extension (e.g., "ATLASSIAN_TOKEN")

The vault acts as the single source of truth. Extensions never directly specify credentials; they declare what they need and how to map it.

## Consequences

### Positive
- **Single source of truth**: Each credential stored once, eliminating duplication
- **Easy credential rotation**: Update a credential in the vault and all extensions see the change
- **Naming decoupled**: Extensions can use their preferred env variable names without conflict
- **Extensible**: New extensions can reference existing vault entries without re-entry

### Negative
- **Mapping complexity**: Extension configurations must define the indirection mapping, adding configuration overhead
- **Validation overhead**: Core must validate that all mapped vault keys exist at extension activation time
- **User confusion potential**: Users may not understand why fields aren't directly in the extension config
