/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: ['./packages/*/tsconfig.lint.json', './packages/*/tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'sonarjs'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:sonarjs/recommended-legacy',
  ],
  rules: {
    // Cyclomatic complexity — max 10 branches per function
    'complexity': ['warn', { max: 10 }],
    // Cognitive complexity — max 15 (sonarjs)
    'sonarjs/cognitive-complexity': ['warn', 15],
    // No any types — enforced as error
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/no-unsafe-argument': 'error',
    // Additional strictness
    '@typescript-eslint/explicit-function-return-type': ['warn', {
      allowExpressions: true,
      allowTypedFunctionExpressions: true,
    }],
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    'no-console': 'warn',
  },
  overrides: [
    {
      // shadcn/ui components use patterns (cva, cn, React.forwardRef) that
      // produce false-positive unsafe-* lint errors due to complex type inference.
      files: ['packages/ui/src/components/ui/**/*.tsx', 'packages/extension-sdk/src/components/ui/**/*.tsx'],
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        'sonarjs/sonar-prefer-read-only-props': 'off',
      },
    },
    {
      // React components use third-party libraries (React Query, Radix, CVA) whose
      // complex generics produce false-positive unsafe-* lint errors. The no-explicit-any
      // rule still ensures we don't introduce our own `any` types.
      files: ['packages/ui/src/**/*.tsx', 'packages/ui/src/**/*.ts', 'packages/extension-sdk/src/**/*.tsx', 'packages/extension-sdk/src/**/*.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        'sonarjs/sonar-prefer-read-only-props': 'off',
      },
    },
    {
      // CLI entry points use console.log for user output
      files: ['packages/create-renre-extension/src/index.ts', 'packages/cli/src/index.ts'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
  ignorePatterns: ['dist/', 'node_modules/', '*.js', '*.cjs', '*.mjs', 'coverage/', '**/*.test.ts', '**/*.test.tsx', '**/e2e/**'],
};
