import { FlatCompat } from '@eslint/eslintrc'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import reactRefresh from 'eslint-plugin-react-refresh'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

export default [
  { ignores: ['dist', 'node_modules', 'eslint.config.js', 'postcss.config.js'] },

  ...compat.extends('airbnb', 'airbnb/hooks'),

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.node.json'],
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-refresh': reactRefresh,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.json', './tsconfig.node.json'],
        },
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
      'react/require-default-props': 'off',
      'react/function-component-definition': ['error', {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      }],
      'react/jsx-props-no-spreading': ['error', { html: 'ignore', custom: 'enforce', exceptions: [] }],

      'no-use-before-define': 'off',
      'no-shadow': 'off',
      'no-redeclare': 'off',
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-void': ['error', { allowAsStatement: true }],

      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-use-before-define': ['error'],
      '@typescript-eslint/no-shadow': ['error'],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/explicit-function-return-type': ['error', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': ['error', {
        checksVoidReturn: { attributes: false },
      }],

      'import/extensions': ['error', 'ignorePackages', { ts: 'never', tsx: 'never' }],
      'import/prefer-default-export': 'off',

      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  {
    files: ['**/contexts/**'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },

  {
    files: ['*.config.ts', '*.config.js', 'vite.config.ts'],
    rules: {
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    },
  },
]
