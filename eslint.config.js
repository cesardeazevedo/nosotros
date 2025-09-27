// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook'

import pluginJs from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import react from 'eslint-plugin-react'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      react,
      'jsx-a11y': jsxA11y,
      'react-refresh': reactRefresh,
    },
    rules: {
      semi: [2, 'never'],
      'prettier/prettier': 0,
      'react/react-in-jsx-scope': 0,
      'react-refresh/only-export-components': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/ban-ts-comment': 0,
      '@typescript-eslint/no-empty-function': 0,
      '@typescript-eslint/no-unused-vars': ['warn', { ignoreRestSiblings: true }],
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
    },
  },
  ...storybook.configs['flat/recommended'],
]
