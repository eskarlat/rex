# ADR-001: Use Markdown SKILL.md Files for LLM Skill Definitions

## Status

Accepted

## Context

Extensions need to teach LLM agents how to use their commands and capabilities. LLM agents (like Claude) need natural language descriptions of what commands do, what arguments they accept, and when to use them. There must be a way to distribute these skill definitions with extensions and make them discoverable to LLM systems.

## Decision

Adopt a convention-based approach using markdown files:

1. Extensions define skills in `skills/SKILL.md` in their source tree
2. Core SDK copies `skills/SKILL.md` to `.agents/skills/{extensionName}/SKILL.md` when extension is activated
3. LLM agents scan `.agents/skills/*/SKILL.md` to discover available skills
4. SKILL.md uses natural language (markdown) to describe the extension's capabilities
5. Format is flexible; each extension can structure as needed (prose, lists, examples)

This is a convention, not a rigid schema. LLMs can parse natural language flexibly.

## Alternatives Considered

- **JSON tool schemas**: Rigid structure (name, description, parameters), machine-readable but less natural
- **Central skill registry**: Requires RenreKit-specific integration, more complex, not portable
- **Inline in manifest**: Limited space, clutters manifest structure, hard to maintain
- **Auto-generated from code**: Requires complex introspection, fragile if code changes, no human guidance
- **GraphQL/OpenAPI schemas**: Over-engineered for LLM instruction delivery

## Consequences

### Positive

- **Natural language guidance**: Extensions can provide rich, contextual instructions
- **No RenreKit-specific format**: Pure markdown; portable, version-controllable
- **Flexible**: Each extension structures skills as makes sense
- **No validation overhead**: Markdown is forgiving; no schema validation needed
- **LLM-friendly**: LLMs excel at parsing natural language descriptions
- **Human-readable**: Developers can write and review skill docs easily
- **Version-controlled**: Skills tracked alongside extension code

### Negative

- **Inconsistent structure**: Different extensions may format skills differently, confusing LLMs
- **Quality dependent on author**: Vague or incomplete SKILL.md files are still accepted
- **No machine verification**: LLMs may misunderstand instructions if written ambiguously
- **LLM-specific**: Only useful for LLM agents; not portable to other tools
- **No schema validation**: Cannot programmatically validate that SKILL.md is well-formed
- **Scaling issues**: As extensions grow, discovering right skill can be harder
