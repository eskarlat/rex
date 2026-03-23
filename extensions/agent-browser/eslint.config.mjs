import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import importX from 'eslint-plugin-import-x';
import unicorn from 'eslint-plugin-unicorn';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '**/*.test.ts', '**/*.test.tsx', '**/*.js', '**/*.mjs'],
  },

  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  sonarjs.configs.recommended,

  // All TS/TSX source files
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'import-x': importX,
      unicorn,
    },
    rules: {
      complexity: ['warn', { max: 10 }],
      'sonarjs/cognitive-complexity': ['warn', 15],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': 'warn',

      'import-x/no-cycle': 'error',
      'import-x/no-self-import': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
        },
      ],

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
    },
  },

  // React hooks for UI components
  {
    files: ['src/ui/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Relaxed rules for UI components
  {
    files: ['src/ui/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      'sonarjs/sonar-prefer-read-only-props': 'off',
      'sonarjs/prefer-read-only-props': 'off',
    },
  },
);
