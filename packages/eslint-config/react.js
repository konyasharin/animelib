import { defineConfig } from 'eslint/config';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

import { config as baseConfig } from './base.js';

/**
 * A custom ESLint configuration for React applications and libraries.
 *
 * @type {import("eslint").Linter.Config[]} */
export const config = defineConfig([
  baseConfig,
  pluginReact.configs.flat.recommended,
  pluginReactHooks.configs.flat.recommended,
  pluginReactRefresh.configs.vite,
  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
    // 'detect' крашит eslint-plugin-react на ESLint 10 (context.getFilename удалён)
    settings: { react: { version: '19.0' } },
    rules: {
      // React scope no longer necessary with new JSX transform.
      'react/react-in-jsx-scope': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
]);
