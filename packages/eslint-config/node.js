import { defineConfig } from 'eslint/config';
import globals from 'globals';

import { config as baseConfig } from './base.js';

/**
 * A custom ESLint configuration for server-side (Node.js) packages.
 *
 * @type {import("eslint").Linter.Config[]} */
export const config = defineConfig([
  baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
]);
