# Implementation Plan: ESLint v9 Migration + 3 New Plugins

## Summary

Migrate from ESLint v8 (`.eslintrc.cjs`) to ESLint v9 (flat config `eslint.config.js`) and add 3 high-ROI plugins:
1. **eslint-plugin-import-x** — import hygiene, circular deps, monorepo safety (fork with native flat config + better perf)
2. **eslint-plugin-unicorn** — 100+ modern JS best practices (requires ESLint v9)
3. **eslint-plugin-react-hooks** — hooks correctness for UI packages

---

## Step 1: Upgrade ESLint & typescript-eslint dependencies

**Changes in root `package.json`:**
- `eslint`: `^8.57.0` → `^9.0.0`
- Remove `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser`
- Add `typescript-eslint`: `^8.18.0` (unified package for flat config — provides parser + plugin + config helper)
- Add `@eslint/js` (base recommended config for flat config)

**Also remove** `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-plugin-sonarjs` from each `packages/*/package.json` — they only need to be in the root since ESLint runs from root config.

---

## Step 2: Install 3 new plugins

```bash
pnpm add -Dw eslint-plugin-import-x eslint-plugin-unicorn eslint-plugin-react-hooks
```

---

## Step 3: Create `eslint.config.js` (replaces `.eslintrc.cjs`)

Convert the existing config to ESLint v9 flat config format:

| `.eslintrc.cjs` concept | Flat config equivalent |
|---|---|
| `parser` + `parserOptions.project` | `languageOptions.parserOptions.projectService: true` |
| `extends: [...]` | Spread config arrays into the array |
| `plugins: ['sonarjs']` | `import sonarjs from 'eslint-plugin-sonarjs'` as object |
| `overrides: [{ files, rules }]` | Separate config objects with `files` property |
| `ignorePatterns: [...]` | Top-level `{ ignores: [...] }` object |

**New config structure outline:**

```js
// eslint.config.js
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import importX from 'eslint-plugin-import-x';
import unicorn from 'eslint-plugin-unicorn';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  // 1. Global ignores
  { ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**', '**/*.test.ts', '**/*.test.tsx', '**/e2e/**'] },

  // 2. Base configs
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  sonarjs.configs.recommended,

  // 3. All TS/TSX files — core rules + new plugins
  {
    files: ['packages/*/src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { 'import-x': importX, unicorn },
    rules: {
      // --- Preserved existing rules ---
      complexity: ['warn', { max: 10 }],
      'sonarjs/cognitive-complexity': ['warn', 15],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true, allowTypedFunctionExpressions: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'warn',

      // --- import-x (cherry-picked) ---
      'import-x/no-cycle': 'error',
      'import-x/no-self-import': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/no-extraneous-dependencies': 'error',
      'import-x/order': ['warn', { groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'], 'newlines-between': 'always' }],

      // --- unicorn (cherry-picked, NOT full recommended) ---
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/no-array-for-each': 'warn',
      'unicorn/prefer-string-starts-ends-with': 'error',
      'unicorn/prefer-string-slice': 'error',
      'unicorn/throw-new-error': 'error',
      'unicorn/prefer-number-properties': 'error',
      'unicorn/no-lonely-if': 'error',
      'unicorn/prefer-optional-catch-binding': 'error',
      'unicorn/no-useless-spread': 'error',
      'unicorn/no-useless-promise-resolve-reject': 'error',
      'unicorn/prefer-array-find': 'error',
      'unicorn/prefer-includes': 'error',
      'unicorn/prefer-ternary': 'warn',
      'unicorn/better-regex': 'warn',
      'unicorn/consistent-function-scoping': 'warn',
      'unicorn/no-abusive-eslint-disable': 'error',
      // Intentionally NOT enabling: no-null, no-array-reduce, filename-case, prevent-abbreviations
    },
  },

  // 4. React hooks — UI + extension-sdk only
  {
    files: ['packages/ui/src/**/*.{ts,tsx}', 'packages/extension-sdk/src/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // 5–7. Preserved overrides: shadcn/ui relaxation, React component relaxation, CLI entry console
  // (same rules as current .eslintrc.cjs overrides, just in flat config object format)
);
```

---

## Step 4: Update lint scripts in `packages/*/package.json`

ESLint v9 drops `--ext` flag (file extensions come from config). Update all lint scripts:

- **Before:** `"lint": "eslint src/ --ext .ts,.tsx"`
- **After:** `"lint": "eslint --cache src/"`

All 5 packages need this update.

---

## Step 5: Delete `.eslintrc.cjs`

Remove the old config file once `eslint.config.js` is verified working.

---

## Step 6: Run lint, fix violations

1. `pnpm lint` — identify new violations
2. `pnpm lint -- --fix` — auto-fix what's possible (import order, unicorn auto-fixable rules)
3. Manually address remaining violations or tune rule severity
4. `pnpm validate` — ensure full pipeline passes

---

## Step 7: Update CLAUDE.md

Document the new setup:
- ESLint v9 flat config (`eslint.config.js`)
- New plugins and their purpose
- Cherry-picked unicorn rules rationale

---

## Risk Assessment

| Risk | Mitigation |
|---|---|
| sonarjs `recommended` (non-legacy) may enable new rules | Review violations, disable noisy ones |
| `import-x/no-cycle` slow on large codebases | Add `maxDepth: 3` if needed |
| `projectService` resolves tsconfigs differently | Fall back to `project` array option |
| unicorn requires ESLint ≥9.20.0 | Pin eslint to `^9.20.0` |
| Breaking change: `context.getScope()` removed in v9 | Ensured by using typescript-eslint v8+ |

---

## Files Changed

| File | Action |
|---|---|
| `package.json` (root) | Edit — update/add/remove deps |
| `packages/*/package.json` (×5) | Edit — update lint scripts, remove per-package eslint deps |
| `.eslintrc.cjs` | Delete |
| `eslint.config.js` | Create |
| `CLAUDE.md` | Edit — document new setup |
| Various `src/**/*.ts` files | Edit — fix lint violations |
