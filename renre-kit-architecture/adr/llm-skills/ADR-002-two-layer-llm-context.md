# ADR-002: Two-Layer LLM Context Provisioning

## Status
Accepted

## Context
Extensions may need to provide more than just skill files to LLM agents. They might want to ship:
- Custom prompts and instructions for specific tasks
- Workflow definitions and agent configurations
- Example interactions and use cases
- Specialized agent definitions for domain-specific reasoning

A single SKILL.md file is too limited. Extensions need a structured way to deploy arbitrary LLM-related assets without cluttering the core system.

## Decision
Implement a two-layer approach:

**Layer 1 (Automatic by core)**:
- Core automatically copies `skills/SKILL.md` from extension source to `.agent/skills/{extensionName}/SKILL.md`
- No extension integration needed; happens at activation

**Layer 2 (Custom by extension)**:
- Extensions ship an `agent/` directory in their source tree containing:
  - `agent/prompts/` - Custom prompt files (markdown)
  - `agent/agents/` - Agent definitions (JSON or YAML)
  - `agent/workflows/` - Workflow definitions
- Extension's `onInit()` hook deploys these to:
  - `.agent/prompts/{extensionName}/{filename}`
  - `.agent/agents/{extensionName}/{filename}`
  - `.agent/workflows/{extensionName}/{filename}`
- Namespacing prevents collisions
- Extension's `onUninstall()` hook cleans up deployed assets

## Consequences

### Positive
- **Core stays simple**: Automatic SKILL.md deployment requires no extension code
- **Extensions have full control**: Can deploy any LLM-related assets they need
- **Convention-based discovery**: LLM agents scan `.agent/prompts/`, `.agent/agents/`, `.agent/workflows/`
- **Namespaced safety**: Prevents extension name collisions
- **Lifecycle management**: onInit/onUninstall hooks ensure cleanup
- **Extensible**: New asset types (e.g., `.agent/datasets/`) can be added without core changes

### Negative
- **Hook responsibility**: Extensions must implement cleanup; if forgotten, assets persist
- **Multiple discovery paths**: LLM agents must know to scan multiple directories
- **Asset format flexibility**: No enforced schema; extensions may ship invalid JSON/YAML
- **State management**: Extensions must track what they deployed for cleanup
- **Complex onUninstall**: Requires careful removal; risk of partial cleanup
- **Potential bloat**: Extensions could ship large asset directories
