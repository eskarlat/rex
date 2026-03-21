# Code Standards

These are the rules that keep the codebase consistent and healthy. They're enforced by tooling, not just convention.

## TypeScript

### ESM Everywhere

All code uses ES Modules. Use `.js` extensions in imports:

```typescript
// Correct
import { something } from './my-module.js';
import type { MyType } from './types.js';

// Wrong
import { something } from './my-module';
```

### No `any` Types

`@typescript-eslint/no-explicit-any` is an error. Use `unknown` + type narrowing:

```typescript
// Wrong
function process(data: any) {
  return data.value;
}

// Correct
function process(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: string }).value;
  }
  throw new Error('Invalid data');
}
```

### Type-Only Imports

Use `import type` when importing only types:

```typescript
import type { ExtensionManifest } from './types.js';
import { validateManifest } from './validation.js';
```

### Handle Undefined from Indexing

`noUncheckedIndexedAccess: true` is enabled. Always check indexed values:

```typescript
const items: string[] = ['a', 'b', 'c'];

// Wrong — TypeScript knows this might be undefined
const first = items[0].toUpperCase();

// Correct
const first = items[0];
if (first) {
  first.toUpperCase();
}
```

## Complexity Limits

### Cyclomatic Complexity: Max 10

If a function has more than 10 independent paths, break it up:

```typescript
// Too complex — refactor into smaller functions
function handleRequest(req: Request) {
  if (req.method === 'GET') {
    if (req.path === '/users') { /* ... */ }
    else if (req.path === '/posts') { /* ... */ }
    // ...10 more branches
  }
}

// Better — dispatch table
const handlers: Record<string, Handler> = {
  'GET /users': getUsers,
  'GET /posts': getPosts,
  // ...
};
```

### Cognitive Complexity: Max 15

Cognitive complexity measures how hard code is to understand. Deeply nested loops and conditionals score high.

## Test Coverage: 86%

Per-package minimum:
- **Statements**: 86%
- **Branches**: 86%
- **Functions**: 86%
- **Lines**: 86%

Enforced by Istanbul via `vitest.shared.ts`.

## Code Duplication: Threshold 5

jscpd checks for duplicated code blocks. If you find yourself copying more than 5 lines, extract a shared function.

```bash
pnpm lint:duplication
```

## Dead Code Detection

Knip checks for unused exports, unused dependencies, and unreachable code:

```bash
pnpm lint:deadcode
```

## Formatting

Prettier handles formatting. Don't fight it:

| Setting | Value |
|---------|-------|
| Print width | 100 |
| Quotes | Single |
| Trailing commas | All |
| Semicolons | Yes |
| Indent | 2 spaces |
| Tab width | 2 |

```bash
pnpm format        # Format everything
pnpm format:check  # Check without writing
```

## ESLint

The ESLint config lives at `packages/.eslintrc.cjs` and extends TypeScript ESLint with custom rules:

- `no-explicit-any`: error
- `complexity`: max 10
- `sonarjs/cognitive-complexity`: max 15
- Various `@typescript-eslint` rules for safety

shadcn/ui components have relaxed rules (they use generics and patterns that trigger some strict rules).

## Commit Style

Keep commits focused:
- One logical change per commit
- Write clear commit messages that explain **why**, not just what
- Reference issue numbers when applicable

## Pull Request Checklist

Before submitting a PR:

- [ ] `pnpm validate` passes (lint + typecheck + coverage + duplication)
- [ ] New code has tests (TDD preferred)
- [ ] No `any` types introduced
- [ ] No ESLint warnings
- [ ] Functions stay under complexity limits
- [ ] Formatting is consistent (`pnpm format:check`)
