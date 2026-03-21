# ADR-001: Trusted Code Model for MVP (No Sandboxing)

## Status

Accepted

## Context

RenreKit is an extension framework where arbitrary code (extensions) runs with access to the core API. Security is a concern, but implementing full sandboxing is complex and delays MVP. The project must balance security with time-to-market.

## Decision

Use a trusted code model for MVP, identical to npm packages:

1. Extensions run with the same permissions as the CLI process
2. The registry (where extensions are published) is the trust boundary
3. Registry curators review extensions before accepting them
4. Users install extensions knowing they grant code execution privileges
5. Post-MVP: Implement permission scopes, sandboxing, and digital signatures

This approach is straightforward and matches user expectations from familiar tools like npm.

## Alternatives Considered

- **Full sandboxing from day one**: Complex (requires V8 isolates, seccomp, containers), delays MVP, unclear threat model
- **Permission prompts**: Users prompted on each privileged action; causes alert fatigue and is bypassable if extensions can delay prompts
- **Capability-based security**: Fine-grained permission model; complex API design, UX burden on users
- **Code signing + verification**: Adds trust infrastructure; requires PKI, key management

## Consequences

### Positive

- **Simple trust model**: Users understand they're installing code
- **Familiar to developers**: Matches npm and most package managers
- **No performance overhead**: No sandboxing/interception layer
- **Faster MVP**: Avoids complex security implementation
- **Registry-based safety**: Curated list of extensions provides safety for most users
- **Clear upgrade path**: Can add layers of security without breaking existing extensions

### Negative

- **No protection against malicious extensions**: A bad actor can access user data, credentials, system resources
- **No protection against compromised extensions**: If an extension is backdoored after approval, users are exposed
- **User responsibility**: Users must trust extension authors
- **No permission transparency**: Users don't know what permissions an extension requests
- **Scalability risk**: As registry grows, manual curation doesn't scale
- **Regulatory concerns**: Organizations with compliance requirements may reject RenreKit
