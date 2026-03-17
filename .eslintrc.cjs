/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: ['./packages/*/tsconfig.lint.json', './packages/*/tsconfig.json'],
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
      files: ['**/*.test.ts', '**/*.test.tsx'],
      parserOptions: {
        project: ['./packages/*/tsconfig.lint.json'],
      },
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-console': 'off',
        'complexity': 'off',
        'sonarjs/cognitive-complexity': 'off',
        'sonarjs/no-duplicate-string': 'off',
      },
    },
  ],
  ignorePatterns: ['dist/', 'node_modules/', '*.js', '*.cjs', '*.mjs', 'coverage/'],
};
