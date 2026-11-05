import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import onlyWarn from 'eslint-plugin-only-warn';
import prettierPlugin from 'eslint-plugin-prettier';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = defineConfig([
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/.turbo/**',
    '**/generated/**',
    '**/coverage/**',
    '**/*.d.ts',
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
      prettier: prettierPlugin,
      'simple-import-sort': simpleImportSortPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
      'prettier/prettier': [
        'warn',
        {
          endOfLine: 'auto',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            // common types
            ['^@/types'],
            // Packages. `react` related packages come first.
            ['^react', '^@?\\w'],
            // Internal packages.
            // api
            ['^@?\\/api'],
            // utils
            ['^@?\\/utils'],
            // misc
            ['^@?\\/[^(ui|api|utils)]'],
            // UI
            ['^@?\\/ui\\/[^ce]', '^@?\\/ui\\/e', '^@?\\/ui\\/c'],
            // Side effect imports.
            ['^\\u0000'],
            // Parent imports. Put `..` last.
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // Other relative imports. Put same-folder imports and `.` last.
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            // Style imports.
            ['^.+\\.s?css$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'warn',
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  eslintConfigPrettier,
]);
