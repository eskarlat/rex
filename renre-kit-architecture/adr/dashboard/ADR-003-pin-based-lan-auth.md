# ADR-003: 4-Digit PIN with window.prompt() for LAN Access Authentication

## Status

Accepted

## Context

The dashboard may be accessible over the local network from other devices. While the primary use case is localhost access, users may want to access the dashboard from a laptop connected to the same LAN. This access needs protection from unauthorized users on the network.

## Decision

Implement simple PIN-based authentication for LAN access:

1. Server generates a random 4-digit PIN at startup
2. PIN is printed to the CLI terminal (only visible to the user running renre)
3. Non-localhost requests trigger a `window.prompt()` dialog for PIN entry
4. Correct PIN sets an HTTP-only session cookie
5. Localhost (127.0.0.1) bypasses authentication entirely
6. Session persists across browser refreshes

## Alternatives Considered

- **Bearer token in URL** (`?token=1234567890`): Long, ugly, visible in browser history and referrer logs, easy to leak
- **Username/password form**: Overkill for trusted network, requires custom login UI, more complex
- **No authentication**: Simple but risky; any LAN device can access
- **mTLS/certificate-based**: Complex setup, not user-friendly for local network
- **OAuth/third-party auth**: Unnecessary complexity for local network

## Consequences

### Positive

- **Simple UX**: Users don't need to create accounts or passwords
- **No custom UI needed**: Reuses browser's native prompt dialog
- **Quick to implement**: Minimal code
- **Session persistence**: PIN entry happens once per browser session
- **Sufficient for trusted LAN**: 4-digit PIN acceptable for networks where users are known
- **Easy to rotate**: User can restart the server to get a new PIN

### Negative

- **Low entropy**: 4-digit PIN = 10,000 possibilities (brute-forceable)
- **Not for public networks**: Unsuitable for untrusted networks
- **No rate limiting**: No protection against brute-force attempts
- **No username granularity**: All LAN users share the same PIN
- **History risk**: PIN visible in terminal history
- **No logout mechanism**: Session persists until browser closes or cookie expires
