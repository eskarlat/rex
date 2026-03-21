# ADR-005: Dedicated Settings Page with Sub-Sidebar Navigation

## Status

Accepted

## Context

The system needs to organize both global settings (general preferences, registry configuration, vault management) and per-extension configuration (extension-specific settings from their manifest schemas). A flat settings page would be overwhelming; extensions should have clear, isolated configuration spaces.

## Decision

Create a dedicated Settings page with its own sub-sidebar navigation:

1. Main sidebar continues to show Projects, Extensions, Connections, etc.
2. Settings page has a secondary sub-sidebar with collapsible sections:
   - **General**: Global settings (theme, language, etc.)
   - **Registries**: Registry configuration and management
   - **Vault**: Vault credentials and key management
   - **Per-extension entries**: Dynamically generated from each extension's `config.schema` in manifest
3. Extension config forms are auto-generated from their JSON Schema definition in the manifest
4. Each extension entry is namespaced and isolated

## Consequences

### Positive

- **Clean separation of concerns**: Global vs. extension settings clearly separated
- **Scalable**: As more extensions are added, each gets its own section automatically
- **Auto-generated forms**: Extension authors define schema; dashboard generates form UI automatically
- **Reduced boilerplate**: No manual form building for each extension
- **Organized UX**: Users know where to find each extension's configuration
- **Extensible**: New global settings added without cluttering the main interface

### Negative

- **UI complexity**: Additional navigation layer adds visual complexity
- **Schema validation required**: Core must validate extension schemas are valid JSON Schema
- **Form generation complexity**: Requires robust form builder from JSON Schema
- **Limited UI customization**: Auto-generated forms may not suit every extension's UX needs
- **Discoverability**: Users might not realize extensions have settings if they don't explore Settings
