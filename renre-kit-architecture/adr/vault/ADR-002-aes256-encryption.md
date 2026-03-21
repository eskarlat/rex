# ADR-002: AES-256-GCM Encryption for Vault Secrets

## Status

Accepted

## Context

The vault stores sensitive credentials (API tokens, passwords, private keys) that must not be readable in plain text on disk. An attacker with file system access should not be able to extract credentials without additional knowledge.

## Decision

Encrypt secret-flagged values at rest using AES-256-GCM (authenticated encryption). The encryption key is derived from a machine-specific identifier (hardware UUID or MAC address). This approach:

1. Secrets marked in vault schema are encrypted before storage
2. Key derivation uses machine-specific entropy
3. Vault file remains JSON for readability of non-secret fields
4. Post-MVP: Integrate with OS keychain (Keychain on macOS, Credential Manager on Windows, Secret Service on Linux) to store the derived key securely

## Consequences

### Positive

- **At-rest security**: Secrets are not plaintext readable
- **Authenticated encryption**: GCM provides both confidentiality and integrity verification
- **Gradual security improvements**: Can add keychain integration without changing vault format

### Negative

- **Machine-specific key**: Vault is not portable between machines; requires re-entry or key export/import
- **No high-entropy option yet**: MVP uses machine ID; not as strong as user-provided passphrases
- **Complexity**: Adds encryption/decryption layer to vault operations
- **Dependency management**: Requires crypto library (consider crypto built-ins in Node.js)
- **Key loss scenarios**: If machine ID changes, encrypted secrets become inaccessible
