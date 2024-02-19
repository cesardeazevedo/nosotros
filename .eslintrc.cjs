module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
    'plugin:storybook/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-refresh',
    'jest',
    '@typescript-eslint',
    'prettier',
    'import',
    'testing-library',
    'no-only-tests',
  ],
  rules: {
    'react/react-in-jsx-scope': 0,
    '@typescript-eslint/consistent-type-imports': 'error',
    semi: [2, 'never'],
    'prettier/prettier': [
      'error',
      {
        printWidth: 120,
        semi: false,
        trailingComma: 'all',
        singleQuote: true,
        jsxSingleQuote: true,
        bracketSpacing: true,
        bracketSameLine: true,
      },
    ],
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        ignoreRestSiblings: true,
      },
    ],
  },
}
