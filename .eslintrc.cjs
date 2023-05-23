module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    project: ['tsconfig.json'],
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'no-type-assertion', 'import'],
  root: true,
  rules: {
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/no-non-null-assertion': 'error',
    'no-type-assertion/no-type-assertion': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
      },
    ],
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './src/domain',
            from: './src/adapter',
          },
          {
            target: './src/domain/entities',
            from: './src/domain/usecases',
          },
          {
            target: './src/adapter/repositories',
            from: './src/adapter/entry-points',
          },
        ],
      },
    ],
  },
};
