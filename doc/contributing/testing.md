# Testing Guide

RenreKit takes testing seriously — 86% coverage minimum, enforced per-package. This page covers the testing setup, patterns, and how to write effective tests.

## Test Stack

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit testing (fast, Vite-native) |
| **Playwright** | E2E browser testing |
| **Node test runner** | CLI integration tests |
| **Istanbul** | Coverage measurement |

## Running Tests

```bash
# All unit tests
pnpm test

# Single package
pnpm --filter @renre-kit/cli test

# Single file
pnpm --filter @renre-kit/cli test -- src/core/database/database.test.ts

# Watch mode
pnpm --filter @renre-kit/cli test -- --watch

# With coverage
pnpm test:coverage

# E2E tests
pnpm test:e2e

# CLI integration tests
pnpm test:cli
```

## Test File Location

Tests are **co-located** with source files:

```
src/
├── features/
│   ├── extensions/
│   │   ├── extension-manager.ts
│   │   └── extension-manager.test.ts    # Right next to the source
│   └── vault/
│       ├── vault-manager.ts
│       └── vault-manager.test.ts
```

## Test Environments

Different packages use different environments:

| Package | Environment | Why |
|---------|------------|-----|
| cli | `node` | Server-side code |
| server | `node` | Server-side code |
| ui | `jsdom` | Needs DOM APIs |
| extension-sdk | `jsdom` | Needs DOM APIs for components |

## Writing Unit Tests

### Basic Pattern

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MyManager } from './my-manager.js';

describe('MyManager', () => {
  let manager: MyManager;

  beforeEach(() => {
    manager = new MyManager();
  });

  it('should do the thing', () => {
    const result = manager.doThing('input');
    expect(result).toBe('expected output');
  });

  it('should handle errors gracefully', () => {
    expect(() => manager.doThing('')).toThrow('Input required');
  });
});
```

### Mocking

Use Vitest's `vi` for mocks:

```typescript
import { vi, describe, it, expect } from 'vitest';

// Mock a module
vi.mock('./database.js', () => ({
  getDatabase: vi.fn(() => ({
    prepare: vi.fn().mockReturnValue({
      all: vi.fn().mockReturnValue([{ id: 1, name: 'test' }]),
      run: vi.fn(),
    }),
  })),
}));

// Mock a function
const mockCallback = vi.fn();

// Spy on a method
const spy = vi.spyOn(manager, 'someMethod');
```

### Async Tests

```typescript
it('should fetch data', async () => {
  const result = await manager.fetchData();
  expect(result).toHaveLength(3);
});
```

### Testing React Components (UI/SDK)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MyComponent } from './MyComponent.js';

describe('MyComponent', () => {
  it('renders the title', () => {
    render(<MyComponent title="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const onClick = vi.fn();
    render(<MyComponent onClick={onClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

## Test Setup Files

Packages with `jsdom` environment have setup files:

```typescript
// src/test-setup.ts
import '@testing-library/jest-dom';

// Polyfill ResizeObserver for jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
```

## E2E Tests

Playwright tests run against a real server and UI:

```typescript
// e2e/home.spec.ts
import { test, expect } from '@playwright/test';

test('home page shows project info', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('RenreKit')).toBeVisible();
});
```

E2E tests use an isolated environment:
- `RENRE_KIT_HOME` set to a temp directory
- API server on port 4200
- UI on port 4201
- Clean state for each test run

## Coverage Configuration

Shared coverage settings in `vitest.shared.ts`:

```typescript
export const coverageConfig = {
  provider: 'istanbul',
  thresholds: {
    statements: 86,
    branches: 86,
    functions: 86,
    lines: 86,
  },
  exclude: [
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/types.ts',
    '**/index.ts',
    '**/main.tsx',
    '**/components/ui/**',  // Vendored shadcn/ui
  ],
};
```

## TDD Workflow

The recommended development approach:

1. **Write the test first** — Define what the function should do
2. **Watch it fail** — Confirm the test catches the missing behavior
3. **Implement** — Write the minimum code to pass
4. **Refactor** — Clean up while keeping tests green
5. **Check coverage** — Make sure you're at 86%+

```bash
# Start watch mode
pnpm --filter @renre-kit/cli test -- --watch

# Write test, see it fail, implement, see it pass
```

## Tips

- **Test behavior, not implementation** — Don't test private methods or internal state.
- **One assertion per test when possible** — Makes failures easier to diagnose.
- **Use descriptive names** — `it('should throw when API key is missing')` not `it('error test')`.
- **Mock at the boundary** — Mock external services and file system, not internal modules.
- **Keep tests fast** — If a test takes more than 100ms, check if you're doing unnecessary I/O.
