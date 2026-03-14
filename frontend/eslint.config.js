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

  // Airbnb base + hooks via FlatCompat (bridges ESLint 8 legacy → ESLint 9 flat config)
  // We intentionally skip airbnb-typescript here because it's incompatible with
  // @typescript-eslint v8 (references removed rules). TypeScript rules are added below.
  ...compat.extends('airbnb', 'airbnb/hooks'),

  // TypeScript + strict rules layer
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
      // ── React 17+ JSX transform ───────────────────────────────────────────
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      // Only allow JSX inside .tsx files
      'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
      // TypeScript handles prop validation — prop-types is redundant
      'react/require-default-props': 'off',
      // Enforce arrow-function components (consistent with Airbnb + modern React)
      'react/function-component-definition': ['error', {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      }],

      // ── TypeScript: disable JS rules that have TS equivalents ─────────────
      'no-use-before-define': 'off',
      'no-shadow': 'off',
      'no-redeclare': 'off',
      'no-unused-vars': 'off',
      'no-undef': 'off', // TypeScript handles this

      // ── TypeScript strict rules ───────────────────────────────────────────
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

      // ── Imports ───────────────────────────────────────────────────────────
      // Never write file extensions for .ts/.tsx imports
      'import/extensions': ['error', 'ignorePackages', {
        ts: 'never',
        tsx: 'never',
      }],
      // Named exports are more refactor-safe than default exports
      'import/prefer-default-export': 'off',

      // ── React Refresh (Vite HMR) ──────────────────────────────────────────
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
]
