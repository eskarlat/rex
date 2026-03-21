# ADR-007: Doctor Diagnostic Command

## Status

Proposed

## Context

As the CLI grows in complexity — SQLite database, encrypted vault, schema-versioned config files, extension ecosystem with engine constraints — users increasingly encounter failure modes that are hard to diagnose:

- "Why won't my extension activate?" (engine incompatibility, corrupt manifest)
- "Why is my config being ignored?" (invalid JSON, missing schemaVersion migration)
- "Is my vault actually encrypted?" (missing key file, wrong permissions)
- "Did my database migration fail halfway?" (pending migrations, inconsistent schema)

Today, diagnosing these issues requires manual inspection of multiple files, database state, and version comparisons. There is no single command that validates the health of a RenreKit installation.

The `doctor` pattern is well-established in CLI tools:

- `brew doctor` — checks Homebrew installation health
- `flutter doctor` — validates Flutter toolchain
- `npm doctor` — checks npm environment
- `gh extension doctor` — validates GitHub CLI extensions

## Decision

### 1. New top-level command: `renre doctor`

Located at `features/doctor/commands/doctor.command.ts`, registered as a top-level command (not namespaced under an extension).

### 2. Ten diagnostic checks

Each check returns one of three statuses:

- **pass** — check succeeded
- **warn** — non-critical issue detected (system works but may have problems)
- **fail** — critical issue that will cause runtime errors

```typescript
interface DiagnosticCheck {
  name: string;
  run: (ctx: DoctorContext) => DiagnosticResult;
}

interface DiagnosticResult {
  status: 'pass' | 'warn' | 'fail';
  message: string;
  detail?: string; // additional context for warn/fail
}
```

The ten checks, in execution order:

| #   | Check                     | Pass                                                   | Warn                             | Fail                                                                |
| --- | ------------------------- | ------------------------------------------------------ | -------------------------------- | ------------------------------------------------------------------- |
| 1   | **Node.js version**       | ≥ 20.0.0                                               | —                                | < 20.0.0                                                            |
| 2   | **Global directory**      | `~/.renre-kit/` exists and is writable                 | —                                | Missing or not writable                                             |
| 3   | **Database opens**        | SQLite file opens without error                        | —                                | Cannot open (corrupt, locked, missing)                              |
| 4   | **Schema up-to-date**     | No pending migrations                                  | Pending migrations exist         | Cannot read migration state                                         |
| 5   | **config.json valid**     | Parseable and `schemaVersion` is current               | Missing file (uses defaults)     | Invalid JSON or schemaVersion too new                               |
| 6   | **vault.json valid**      | Parseable and `schemaVersion` is current               | Missing file (no secrets stored) | Invalid JSON or schemaVersion too new                               |
| 7   | **Vault key**             | Key file exists with `0o600` permissions               | —                                | Missing key or wrong permissions                                    |
| 8   | **Extension manifests**   | All installed extension manifests parse without errors | —                                | Any manifest fails Zod validation                                   |
| 9   | **Engine constraints**    | All activated extensions satisfy engine constraints    | —                                | Any extension's `engines` constraint not met (project context only) |
| 10  | **Registry reachability** | At least one registry responds within 5s               | Slow response (> 2s)             | All registries unreachable                                          |

Check #9 only runs when `renre doctor` is invoked inside a project directory (i.e., a `.renre-kit/` folder exists in the current directory or a parent). Outside a project context, it is skipped with a note.

### 3. Output format

```
renre doctor

  ✓ Node.js version: v22.1.0
  ✓ Global directory: ~/.renre-kit/ exists and writable
  ✓ Database: opens successfully
  ✓ Schema: up-to-date (3 migrations applied)
  ✓ config.json: valid, schemaVersion 1
  ✓ vault.json: valid, schemaVersion 1
  ✗ Vault key: permissions are 0o644, expected 0o600
    → Run: chmod 600 ~/.renre-kit/vault.key
  ✓ Extension manifests: 3 extensions valid
  ✓ Engine constraints: all satisfied
  ! Registry: https://registry.example.com responded in 3.2s (slow)

9 passed, 1 warning, 1 failure
```

Actionable remediation hints are shown for warnings and failures where possible (e.g., the `chmod` suggestion above).

### 4. Exit code

- **0**: All checks pass (warnings are acceptable)
- **1**: One or more checks failed

This allows `renre doctor` to be used in CI or scripted health checks.

### 5. Implementation structure

```
features/doctor/
  commands/
    doctor.command.ts    # Command handler, orchestrates checks
  checks/
    node-version.ts
    global-directory.ts
    database.ts
    schema-status.ts
    config-valid.ts
    vault-valid.ts
    vault-key.ts
    extension-manifests.ts
    engine-constraints.ts
    registry-reachability.ts
    index.ts             # Exports ordered array of DiagnosticCheck
```

Each check is a small, focused module. The command handler iterates the array, runs each check, collects results, and formats output.

## Consequences

### Positive

- **Self-service diagnostics**: Users can identify and fix problems without filing issues or reading source code
- **Reduced support burden**: "Run `renre doctor`" becomes the first response to most troubleshooting questions
- **CI integration**: Exit code 1 on failure allows automated health checks in development workflows
- **Modular design**: New checks can be added by creating a module and adding it to the array — no changes to the command handler
- **Validates other ADRs**: Checks #4–6 validate ADR-004 (schema versioning) and ADR-006 (database migrations). Check #9 validates ADR-010 (mandatory engine constraints).

### Negative

- **Maintenance cost**: Each check must be kept in sync with the feature it validates. If the vault format changes, the vault check must be updated.
- **Network dependency**: Check #10 (registry reachability) requires network access. Offline users will always see a warning/failure for this check. Mitigation: this is a warning, not a failure, when the user is offline.
- **Partial project context**: Some checks (#9) only work in a project directory. The command must clearly communicate what was skipped and why.

## Alternatives Considered

- **`--check` flag on existing commands**: Add `renre config --check`, `renre vault --check`, etc. Rejected because diagnostic information is scattered across commands. A single `doctor` command provides a unified view.
- **Verbose startup checks**: Run diagnostics automatically on every CLI invocation. Rejected because it adds latency to every command and produces noise. Users should opt into diagnostics.
- **JSON output mode**: Add `--json` flag for machine-readable output. Deferred to a follow-up — the structured `DiagnosticResult` type makes this easy to add later without changing the check implementations.

## Related Decisions

- core/ADR-003: Technology Stack — Node.js version check validates the technology stack requirement
- core/ADR-004: Schema Versioning & Migration Framework — checks #5 and #6 validate config/vault schema versions
- core/ADR-006: Resilient Database Migrations — check #4 validates migration state
- extensions/ADR-010: Mandatory Engine Constraints — check #9 validates engine compatibility
- vault/ADR-002: AES-256-GCM Encryption — check #7 validates vault key presence and permissions
