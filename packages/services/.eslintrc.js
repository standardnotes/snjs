module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    'sort-imports': 'off',
    'require-await': 'off',
    '@typescript-eslint/require-await': 'warn',
    '@typescript-eslint/no-floating-promises': 'warn',
    quotes: ['warn', 'single'],
    'no-restricted-globals': ['error', 'history'],
    '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: true }],
  },
  ignorePatterns: [
    'test',
    '.eslintrc.js',
    'jest.unit.config.ts',
    'jest.e2e.config.ts',
    'babel.config.js',
    'webpack.*',
  ],
}
